import express from "express";
import pool from "../src/db/index.js";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new user
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, locale } = req.body;
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, locale) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, locale || "en"]
    );
    res.json({ user_id: result.insertId, name, email, phone, locale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, locale } = req.body;
    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, locale = ? WHERE user_id = ?",
      [name, email, phone || null, locale || "en", req.params.id]
    );
    res.json({ message: "User updated", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
    res.json({ message: "User deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
