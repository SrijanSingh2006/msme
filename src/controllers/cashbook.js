import { execute, query } from "../db/index.js";

/**
 * Add a cashbook entry.
 * Body expected: { entry_date, party_name, type, amount, note }
 */
export const addEntry = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { entry_date, party_name, type, amount, note } = req.body;

    if (!entry_date || !type || !amount) return res.status(400).json({ message: "entry_date, type, amount required" });

    const result = await execute(
      "INSERT INTO cashbook (user_id, entry_date, party_name, type, amount, note) VALUES (?,?,?,?,?,?)",
      [userId, entry_date, party_name || null, type, amount, note || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("addEntry error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * List entries for logged-in user (or all if no user_id column — but we inserted user_id above).
 * Query params: start, end, type (credit|debit), q (search)
 */
export const listEntries = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { start, end, type, q } = req.query;

    let sql = "SELECT id, user_id, entry_date, party_name, type, amount, note, created_at FROM cashbook WHERE 1=1";
    const params = [];

    if (userId) {
      sql += " AND (user_id = ? OR user_id IS NULL)";
      params.push(userId);
    }

    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (start) {
      sql += " AND entry_date >= ?";
      params.push(start);
    }
    if (end) {
      sql += " AND entry_date <= ?";
      params.push(end);
    }
    if (q) {
      sql += " AND (party_name LIKE ? OR note LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY entry_date DESC, id DESC LIMIT 2000";

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("listEntries error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const summary = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    let sql = `SELECT
      SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as total_credit,
      SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as total_debit
      FROM cashbook WHERE 1=1`;
    const params = [];
    if (userId) {
      sql += " AND (user_id = ? OR user_id IS NULL)";
      params.push(userId);
    }
    const rows = await query(sql, params);
    res.json(rows[0] || { total_credit: 0, total_debit: 0 });
  } catch (err) {
    console.error("summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
