const db = require("../db/index");

// Create payroll
const createPayroll = (req, res) => {
  const { employee_name, salary, month } = req.body;

  if (!employee_name || !salary || !month) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql =
    "INSERT INTO payroll (employee_name, salary, month) VALUES (?, ?, ?)";
  db.query(sql, [employee_name, salary, month], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(201)
      .json({ message: "Payroll created successfully", id: result.insertId });
  });
};

// Get all payrolls
const getPayrolls = (req, res) => {
  const sql = "SELECT * FROM payroll";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

module.exports = { createPayroll, getPayrolls };
