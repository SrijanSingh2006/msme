// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing Authorization header" });
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid Authorization header" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains at least { id, email } depending on token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
