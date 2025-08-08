import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";
import { connectDB } from "../config/db.js";

dotenv.config();
connectDB();

cron.schedule(
  "0 12 * * *", // Runs at 12:00 PM daily
  async () => {
    try {
      const now = new Date();
      now.setHours(12, 0, 0, 0); // Set time to 12:00 PM

      console.log("📅 Checking auto-checkout at:", now.toISOString());

      const expiredStays = await Stay.find({
        status: "active",
        checkoutDate: { $lte: now },
      });

      console.log("📋 Due for checkout:", expiredStays.length);

      let count = 0;

      for (const stay of expiredStays) {
        stay.status = "checked_out";
        await stay.save();

        // Update guest user
        await Guest.updateOne(
          { _id: stay.userId },
          { status: "checked_out", password: undefined }
        );

        // Update room status
        await Room.updateOne(
          { roomNumber: stay.roomNumber },
          { status: "checked_out", stayDays: 0, activatedAt: null }
        );

        count++;
      }

      console.log(`✅ ${count} guests auto checked-out.`);
    } catch (err) {
      console.error("❌ Auto-checkout error:", err);
    }
  },
  {
    timezone: "Africa/Lagos",
  }
);
