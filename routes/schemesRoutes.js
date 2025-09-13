// backend/routes/schemesRoutes.js
import express from "express";
import db from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// List all schemes
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM schemes ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("schemes fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Search
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const like = `%${q}%`;
    const [rows] = await db.query(
      "SELECT * FROM schemes WHERE title LIKE ? OR benefit LIKE ? OR description LIKE ? LIMIT 200",
      [like, like, like]
    );
    res.json(rows);
  } catch (err) {
    console.error("schemes search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bookmark a scheme
router.post("/bookmark", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { schemeId } = req.body;
    if (!schemeId) return res.status(400).json({ message: "schemeId required" });

    await db.query("INSERT INTO bookmarks (user_id, scheme_id) VALUES (?, ?)", [userId, schemeId]);
    res.json({ message: "Bookmarked" });
  } catch (err) {
    console.error("bookmark error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// List user's bookmarks
router.get("/bookmarks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query("SELECT b.id as bookmark_id, s.* FROM bookmarks b JOIN schemes s ON b.scheme_id = s.id WHERE b.user_id = ? ORDER BY b.created_at DESC", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("bookmarks fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
