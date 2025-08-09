// controllers/cronController.js
import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

export const autoCheckoutHandler = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(12, 0, 0, 0); // 12:00 PM Africa/Lagos time

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

    console.log(`✅ ${count} guests auto checked-out.`);

    return res.json({ message: `✅ ${count} guests auto checked-out.` });
  } catch (err) {
    console.error("❌ Auto-checkout error:", err);
    return res.status(500).json({ message: err.message });
  }
};
