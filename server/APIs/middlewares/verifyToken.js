const jwt = require("jsonwebtoken");

const verifyToken = (request, response, next) => {
  // Get bearer token from headers
  const bearerToken = request.headers.authorization;

  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = bearerToken.split(" ")[1];
  if (!token) {
    return response.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, "abcdef"); // Use your secret key
    request.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return response.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = verifyToken;