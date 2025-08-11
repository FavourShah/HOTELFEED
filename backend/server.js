import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import stayRoutes from "./routes/stayRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import roomTypeRoutes from "./routes/roomTypeRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";

dotenv.config();

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
  "https://fixlodge.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files (like uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/cron", cronRoutes);

// Keep-alive endpoint
app.get("/api/ping", (req, res) => {
  console.log("🏓 Keep-alive ping received at:", new Date().toISOString());
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    message: "Server is awake"
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "client", "dist");
  app.use(express.static(clientDistPath));

  // Catch-all for SPA routes
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}


// Start server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
