// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import cashbookRoutes from "./routes/cashbookRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import creditKitRoutes from "./routes/creditKitRoutes.js";
import schemesRoutes from "./routes/schemesRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static frontend & uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "frontend")));

// API routing
app.use("/api/auth", authRoutes);
app.use("/api/cashbook", cashbookRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/creditkit", creditKitRoutes);
app.use("/api/schemes", schemesRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// fallback to index.html for frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
