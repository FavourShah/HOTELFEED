import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

// No dotenv/config/connectDB here

export const autoCheckout = async (req, res) => {
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

    res.json({ message: `${count} guests auto checked-out.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
