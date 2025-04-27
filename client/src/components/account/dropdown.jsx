/* eslint-disable react/prop-types */
import { HiOutlineStar, HiStar } from "react-icons/hi2";

const CurrencyDropdown = ({
  currencies,
  currency,
  setCurrency,
  favorites,
  handleFavorite,
  title = "",
}) => {
  const isFavorite = (curr) => favorites.includes(curr);

  return (
    <div className="mb-3">
      <label htmlFor={title} className="form-label">
        {title}
      </label>

      <div className="position-relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="form-select"
        >
          {favorites.map((fav) => (
            <option key={fav} value={fav}>
              {fav}
            </option>
          ))}
          <option disabled>──────────</option>
          {currencies
            .filter((c) => !favorites.includes(c))
            .map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
        </select>

        <button
          type="button"
          onClick={() => handleFavorite(currency)}
          className="position-absolute top-50 end-0 translate-middle-y me-1 btn btn-link p-0 text-dark"
          title="Toggle Favorite"
        >
          {isFavorite(currency) ? <HiStar size={18} /> : <HiOutlineStar size={18} />}
        </button>
      </div>
    </div>
  );
};

export default CurrencyDropdown;
