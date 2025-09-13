import { query, execute } from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  try {
    const { name, email, password, business_name, upi_id } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email & password required" });

    const existing = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    await execute(
      "INSERT INTO users (name, email, password, business_name, upi_id) VALUES (?,?,?,?,?)",
      [name || null, email, hashed, business_name || null, upi_id || null]
    );

    const rows = await query("SELECT id, name, email, business_name, upi_id FROM users WHERE email = ?", [email]);
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error("signup error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email & password required" });

    const rows = await query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    const userSafe = { id: user.id, name: user.name, email: user.email, business_name: user.business_name, upi_id: user.upi_id };
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req, res) => {
  try {
    const rows = await query("SELECT id, name, email, business_name, upi_id FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("me error", err);
    res.status(500).json({ message: "Server error" });
  }
};
