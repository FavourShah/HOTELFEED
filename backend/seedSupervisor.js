// seedSupervisor.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { Staff } from "./models/staff.js";

const seedSupervisor = async () => {
  try {
    await connectDB();

    const existing = await Staff.findOne({ role: "supervisor" });

    if (existing) {
      console.log("✅ Supervisor already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.SUPERVISOR_PASSWORD, 10);

    const supervisor = await Staff.create({
      fullName: "System Supervisor",
      username: process.env.SUPERVISOR_USERNAME.toLowerCase().trim(),
      email: "supervisor@system.com",
      phone: "0000000000",
      password: hashedPassword,
      role: "supervisor",
      status: "active",
    });

    console.log("🎉 Supervisor created:", supervisor.username);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedSupervisor();
