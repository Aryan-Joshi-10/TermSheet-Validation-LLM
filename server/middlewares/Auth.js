require("dotenv").config();
const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "Unauthorized, JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return res
        .status(500)
        .json({ message: "Internal server error, JWT secret is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      if (err.message === "invalid signature") {
        console.error(
          "Invalid JWT signature. Ensure the token is signed with the correct secret."
        );
      } else {
        console.error(`JWT error: ${err.message}`);
      }
      console.error("Token causing the error:", token); // Log the token once
    }
    console.error("JWT verification failed:", err.message);
    return res
      .status(403)
      .json({ message: "Unauthorized, JWT token is invalid or expired" });
  }
};

module.exports = ensureAuthenticated;
