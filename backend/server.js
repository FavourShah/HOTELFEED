import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

// Route imports
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
connectDB();

const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
  "https://fixlodge.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve static uploads
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

// Health check
app.get("/api/ping", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    message: "Server is awake",
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
