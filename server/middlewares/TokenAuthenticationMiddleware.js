const jwt = require("jsonwebtoken");

const TokenAuthMiddleware = function (req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, "suraj6708", function (err, decoded) {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded._id;
    next();
  });
};

module.exports = TokenAuthMiddleware;
