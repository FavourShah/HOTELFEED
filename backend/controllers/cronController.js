import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

export const autoCheckout = async (req, res) => {
  try {
    const now = new Date();
    console.log("📅 Current time:", now.toISOString());

    // Find stays that have been active for more than X minutes
    const minutesToStay = 2; // Change this to your desired duration
    const expiredTime = new Date(now.getTime() - (minutesToStay * 60 * 1000));

    const expiredStays = await Stay.find({
      status: "active",
      createdAt: { $lte: expiredTime } // Checkout if created more than X minutes ago
    });

    console.log(`📋 Found ${expiredStays.length} stays that have been active for more than ${minutesToStay} minutes`);

    let count = 0;
    for (const stay of expiredStays) {
      console.log(`Processing stay ${stay._id} - created: ${stay.createdAt}`);
      
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

    res.json({ 
      success: true,
      message: `${count} guests auto checked-out after ${minutesToStay} minutes.`,
      checkedOut: count
    });
  } catch (err) {
    console.error("❌ Auto-checkout error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message
    });
  }
};