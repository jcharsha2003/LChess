import { useEffect, useState } from "react";
import CurrencyDropdown from "./dropdown";
import { HiArrowsRightLeft } from "react-icons/hi2";

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [converting, setConverting] = useState(false);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || ["INR", "EUR"]
  );

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencies(Object.keys(data));
      } catch (error) {
        console.error("Error Fetching", error);
      }
    };
    fetchCurrencies();
  }, []);

  const convertCurrency = async () => {
    if (!amount) return;
    setConverting(true);
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await res.json();
      setConvertedAmount(data.rates[toCurrency] + " " + toCurrency);
    } catch (error) {
      console.error("Error Fetching", error);
    } finally {
      setConverting(false);
    }
  };

  const handleFavorite = (currency) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(currency)) {
      updatedFavorites = updatedFavorites.filter((fav) => fav !== currency);
    } else {
      updatedFavorites.push(currency);
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="container my-5">
    
       
         

          <div className="row align-items-end g-3">
            <div className="col-sm-5">
              <CurrencyDropdown
                favorites={favorites}
                currencies={currencies}
                title="From:"
                currency={fromCurrency}
                setCurrency={setFromCurrency}
                handleFavorite={handleFavorite}
              />
            </div>

            <div className="col-sm-2 d-flex justify-content-center">
              <button
                onClick={swapCurrencies}
                className="btn btn-light border rounded-circle"
                title="Swap currencies"
              >
                <HiArrowsRightLeft size={20} />
              </button>
            </div>

            <div className="col-sm-5">
              <CurrencyDropdown
                favorites={favorites}
                currencies={currencies}
                title="To:"
                currency={toCurrency}
                setCurrency={setToCurrency}
                handleFavorite={handleFavorite}
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="amount" className="form-label">
              Amount:
            </label>
            <input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className="form-control"
              placeholder="Enter amount"
            />
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              onClick={convertCurrency}
              className={`btn btn-primary ${converting ? "opacity-75" : ""}`}
              disabled={converting}
            >
              {converting ? "Converting..." : "Convert"}
            </button>
          </div>

          {convertedAmount && (
            <div className="mt-4 text-end text-success fw-bold">
              Converted Amount: {convertedAmount}
            </div>
          )}
      
    </div>
  );
};

export default CurrencyConverter;
