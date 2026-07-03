/**
 * Smart NID Nepal Server — Express entry point
 *
 * Security headers, CORS, and API routes are configured here.
 * No PII is ever logged to console or persisted.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import extractRouter from "./routes/extract.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Security headers ──────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; script-src 'self'"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:5176", 
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use("/api", extractRouter);

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-nid-server" });
});

// ── Error handler ─────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Multer file size error
    if (err.message?.includes("File too large")) {
      res.status(413).json({
        success: false,
        error: "Image is too large. Maximum size is 10 MB.",
      });
      return;
    }

    // Multer file type error
    if (err.message?.includes("Only JPEG")) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
      return;
    }

    console.error(`[server] Unhandled error: ${err.message}`);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🇳🇵 Smart NID Nepal Server`);
  console.log(`  ─────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`  API:     http://localhost:${PORT}/api/extract\n`);

  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "  ⚠️  GEMINI_API_KEY not set! Copy .env.example to .env and add your key.\n"
    );
  }
});
