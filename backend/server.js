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

// To get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
const allowedOrigins = [
  "https://fixlodge.onrender.com", 
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());


app.use(express.json()); // Parse incoming JSON

// Serve static files (like uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/cron", cronRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});



