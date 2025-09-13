// backend/routes/cashbookRoutes.js
import express from "express";
import db from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Add entry (auth required)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entry_date, party_name, type, amount, note } = req.body;
    if (!entry_date || !type || !amount) return res.status(400).json({ message: "entry_date, type, amount required" });

    const [result] = await db.query(
      "INSERT INTO cashbook (user_id, entry_date, party_name, type, amount, note) VALUES (?,?,?,?,?,?)",
      [userId, entry_date, party_name || null, type, amount, note || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("addEntry error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List entries for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT id, entry_date, party_name, type, amount, note, created_at FROM cashbook WHERE user_id = ? ORDER BY entry_date DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("listEntries error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
        IFNULL(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0) AS total_credit,
        IFNULL(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) AS total_debit
       FROM cashbook WHERE user_id = ?`,
      [userId]
    );
    res.json(rows[0] || { total_credit: 0, total_debit: 0 });
  } catch (err) {
    console.error("summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
