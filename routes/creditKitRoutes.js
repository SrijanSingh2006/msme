// backend/routes/creditKitRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import db from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// Upload a document
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    await db.query("INSERT INTO uploads (user_id, filename, originalname, mimetype, size, path) VALUES (?,?,?,?,?,?)",
      [userId, file.filename, file.originalname, file.mimetype, file.size, file.path]);

    res.json({ message: "Uploaded", file: file.filename });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List user's uploaded files
router.get("/files", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query("SELECT id, filename, originalname, mimetype, size, path, created_at FROM uploads WHERE user_id = ? ORDER BY id DESC", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("files error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Build credit kit (.zip) containing cashbook CSV + uploaded docs
router.get("/build", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [files] = await db.query("SELECT * FROM uploads WHERE user_id = ?", [userId]);
    const [cashbook] = await db.query("SELECT entry_date, party_name, amount, type, note FROM cashbook WHERE user_id = ? ORDER BY entry_date DESC", [userId]);

    const csvHeader = "Date,Party,Amount,Type,Note\n";
    const csvRows = cashbook.map(r => `${r.entry_date},"${(r.party_name||'').replace(/\"/g,'""')}",${Number(r.amount).toFixed(2)},${r.type},"${(r.note||'').replace(/\"/g,'""')}"`);
    const csvContent = csvHeader + csvRows.join("\n");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=credit-kit.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", err => { throw err; });
    archive.pipe(res);

    archive.append(csvContent, { name: "cashbook.csv" });

    for (const f of files) {
      if (fs.existsSync(f.path)) {
        archive.file(f.path, { name: `uploads/${f.originalname}` });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error("build error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
});

export default router;
