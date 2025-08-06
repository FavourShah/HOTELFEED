import { Room } from "../models/room.js";
import { Guest } from "../models/guest.js";
import { Stay } from "../models/stay.js";
import bcrypt from "bcryptjs";

// GET: All rooms
export const getRooms = async (req, res) => {
  const rooms = await Room.find().sort({ roomNumber: 1 });
  res.status(200).json(rooms);
};

// POST: Create a room
export const createRoom = async (req, res) => {
  const { roomNumber, roomType } = req.body;

  if (!roomNumber || !roomType) {
    return res.status(400).json({ message: "Room number and type are required." });
  }

  const exists = await Room.findOne({ roomNumber });
  if (exists) return res.status(400).json({ message: "Room number already exists." });

  const room = await Room.create({ roomNumber, roomType, status: "select", stayDays: 0 });
  res.status(201).json(room);
};

export const updateRoom = async (req, res) => {
  
  const { id } = req.params;
  const { roomNumber, roomType, status, stayDays } = req.body;

  // ✅ Only IT and Front Office Manager and supervisor can update
  if (!req.user || !["it", "front office manager", "supervisor",].includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized to update room." });
  }

  const room = await Room.findById(id);
  if (!room) return res.status(404).json({ message: "Room not found." });

  if (roomNumber) room.roomNumber = roomNumber;
  if (roomType) room.roomType = roomType;

  let password = null;

  if (typeof stayDays !== "undefined" && !status) {
    room.stayDays = Number(stayDays);

    const stay = await Stay.findOne({ roomNumber: room.roomNumber, status: "active" });
    if (stay) {
      const now = new Date();
      const newCheckout = new Date(now);
      newCheckout.setDate(now.getDate() + Number(stayDays));
      newCheckout.setHours(12, 0, 0, 0);
      stay.checkoutDate = newCheckout;
      await stay.save();
    }

    await room.save();
    return res.status(200).json({ message: "Stay days updated", room });
  }

  if (status) {
    room.status = status;

    if (status === "active") {
      const guestPassword = `G${room.roomNumber}`;
      const hashedPassword = await bcrypt.hash(guestPassword, 10);

      let guest = await Guest.findOne({ roomNumber: room.roomNumber, role: "guest" });

      if (!guest) {
        guest = await Guest.create({
          roomNumber: room.roomNumber,
          role: "guest",
          password: hashedPassword,
          status: "active",
        });
      } else {
        guest.password = hashedPassword;
        guest.status = "active";
        await guest.save();
      }

      const now = new Date();
      const checkoutDate = new Date(now);
      checkoutDate.setDate(now.getDate() + parseInt(stayDays || 0));
      checkoutDate.setHours(12, 0, 0, 0);

      await Stay.create({
        userId: guest._id,
        roomNumber: room.roomNumber,
        checkinDate: now,
        checkoutDate,
        status: "active",
      });

      room.stayDays = parseInt(stayDays || 0);
      room.activatedAt = now;
      password = guestPassword;
    }

    if (status === "checked_out") {
      const guest = await Guest.findOne({ roomNumber: room.roomNumber, role: "guest" });
      if (guest) {
        guest.status = "checked_out";
        guest.password = undefined;
        await guest.save();
      }

      await Stay.updateMany(
        { roomNumber: room.roomNumber, status: "active" },
        { $set: { status: "checked_out" } }
      );

      room.stayDays = 0;
      room.activatedAt = null;
    }

    await room.save();

    return res.status(200).json({
      message: "Room updated",
      room,
      ...(password ? { autoPassword: password } : {}),
    });
  }

  await room.save();
  res.status(200).json({ message: "Room updated", room });
};


// DELETE: Remove a room
export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const room = await Room.findByIdAndDelete(id);
  if (!room) return res.status(404).json({ message: "Room not found." });

  res.status(200).json({ message: "Room deleted." });
};
