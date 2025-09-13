// backend/routes/payrollRoutes.js
import express from "express";
import db from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Add employee
router.post("/employee", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, salary, role, start_date } = req.body;
    if (!name || !salary) return res.status(400).json({ message: "name & salary required" });

    const [result] = await db.query(
      "INSERT INTO employees (user_id, name, salary, role, start_date) VALUES (?,?,?,?,?)",
      [userId, name, salary, role || null, start_date || null]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error("addEmployee error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List employees
router.get("/employees", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query("SELECT id, name, salary, role, start_date FROM employees WHERE user_id = ? ORDER BY id DESC", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("listEmployees error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate payroll (returns CSV file)
router.get("/generate", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const [employees] = await db.query("SELECT name, salary FROM employees WHERE user_id = ?", [userId]);
    let total = 0;
    employees.forEach(e => total += Number(e.salary || 0));

    // store metadata
    await db.query("INSERT INTO payroll_reports (user_id, month, year, total_amount) VALUES (?,?,?,?)", [userId, month, year, total]);

    // Build CSV
    const csvHeader = "Name,Salary\n";
    const csvRows = employees.map(e => `${(e.name||'').replace(/,/g,' ')} , ${Number(e.salary||0).toFixed(2)}`);
    const csv = csvHeader + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=payroll-${month}-${year}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("generatePayroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
