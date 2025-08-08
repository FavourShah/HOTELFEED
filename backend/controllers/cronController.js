import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

export const autoCheckoutHandler = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    const expiredStays = await Stay.find({
      status: "active",
      checkoutDate: { $lte: now },
    });

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
    res.status(200).json({ message: `Checked out ${count} guests` });
  } catch (error) {
    console.error("❌ Auto-checkout error:", error);
    res.status(500).json({ message: "Auto checkout failed", error: error.message });
  }
};
