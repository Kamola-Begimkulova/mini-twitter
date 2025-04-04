const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Ruxsat berilmagan! Token yo'q!" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(403).json({ message: "Noto'g'ri yoki eskirgan token!" });
  }
};

module.exports = authenticateToken;
