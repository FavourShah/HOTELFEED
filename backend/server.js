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
app.post("/api/cron/auto-checkout", async (req, res) => {
  try {
    const now = new Date();
    
    console.log("📅 Current time:", now.toISOString());

    const allActiveStays = await Stay.find({ status: "active" });
    console.log("📊 Total active stays:", allActiveStays.length);
    
    allActiveStays.forEach((stay, index) => {
      console.log(`Stay ${index + 1}:`, {
        id: stay._id,
        checkoutDate: stay.checkoutDate,
        checkoutDateISO: stay.checkoutDate?.toISOString(),
        isExpired: stay.checkoutDate <= now
      });
    });

    const expiredStays = await Stay.find({
      status: "active",
      checkoutDate: { $lte: now }
    });

    console.log("📋 Found stays due for checkout:", expiredStays.length);

    let count = 0;
    for (const stay of expiredStays) {
      console.log(`Processing stay ${stay._id}`);
      
      stay.status = "checked_out";
      await stay.save();

      await Guest.updateOne(
        { _id: stay.userId },
        { status: "checked_out", password: undefined }
      );

      await Room.updateOne(
        { roomNumber: stay.roomNumber },
        { status: "checked_out", stayDays: 0, activatedAt: null }
      );

      count++;
    }

    console.log(`✅ ${count} guests auto checked-out successfully`);

    res.json({ 
      success: true,
      message: `${count} guests auto checked-out.`,
      timestamp: now.toISOString(),
      checkedOut: count,
      totalActiveStays: allActiveStays.length
    });
  } catch (err) {
    console.error("❌ Auto-checkout error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});



