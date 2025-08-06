import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Staff } from "../models/staff.js";
import { Guest } from "../models/guest.js";
import { Stay } from "../models/stay.js";
import { Room } from "../models/room.js";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔐 Register Staff
export const registerUser = async (req, res) => {
  const { fullName, username, email, phone, password, role, department } = req.body;

  if (req.user && req.user.role !== "it") {
    return res.status(403).json({ message: "Only IT can register staff." });
  }

  if (!fullName || !username || !email || !phone || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const normalizedRole = role.trim().toLowerCase();

  const roleTaken = await Staff.findOne({ role: normalizedRole });
  if (roleTaken) {
    return res.status(400).json({ message: `The role '${normalizedRole}' is already assigned.` });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const staff = await Staff.create({
    fullName: fullName.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    phone: phone.trim().toLowerCase(),
    role: normalizedRole,
    password: hashedPassword,
    department: department || null,
    status: "active",
  });

  res.status(201).json({ message: "Staff registered", userId: staff._id });
};

// 🔐 Register Guest
export const registerGuest = async (req, res) => {
  const { roomNumber } = req.body;

  if (!req.user || !["it", "front office manager", "supervisor"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only IT or Front Office can register guests." });
  }

  if (!roomNumber) {
    return res.status(400).json({ message: "Room number is required." });
  }

  const existingStay = await Stay.findOne({ roomNumber, status: "active" });
  if (existingStay) {
    return res.status(400).json({ message: "Room is already occupied." });
  }

  const password = `G${roomNumber}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const guest = await Guest.create({
    roomNumber,
    password: hashedPassword,
    status: "active",
  });

  res.status(201).json({
    message: "Guest registered",
    roomNumber: guest.roomNumber,
    autoPassword: password,
    guestId: guest._id,
  });
};

// 🔐 Login Staff (including supervisor)
export const loginUser = async (req, res) => {
  const { role, username, password } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, password and role are required." });
  }

  // Normalize inputs
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  // 🔍 Find staff user (includes supervisor since it's stored like regular staff)
  const staff = await Staff.findOne({
    username: normalizedUsername,
    role: normalizedRole,
  }).populate("department", "name");

  if (!staff) return res.status(404).json({ message: "Staff not found." });
  if (staff.status === "inactive") return res.status(403).json({ message: "Account inactive." });

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

  // ✅ Return valid token with real MongoDB ObjectId
  res.status(200).json({
    _id: staff._id,
    username: staff.username,
    fullName: staff.fullName,
    role: staff.role,
    department: staff.department,
    token: generateToken(staff._id, staff.role),
  });
};

// 🔐 Login Guest
export const loginGuest = async (req, res) => {
  const { roomNumber, password } = req.body;

  if (!roomNumber || !password) {
    return res.status(400).json({ message: "Room number and password required." });
  }

const guest = await Guest.findOne({ roomNumber, status: "active" })

  if (!guest) return res.status(404).json({ message: "Guest not found." });

  if (guest.status === "checked_out") {
    return res.status(403).json({ message: "Guest already checked out." });
  }

  const isMatch = await bcrypt.compare(password, guest.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

  res.status(200).json({
    _id: guest._id,
    roomNumber: guest.roomNumber,
    role: "guest",
    token: generateToken(guest._id, "guest"),
  });
};

// GET ALL STAFF
export const getAllUsers = async (req, res) => {
  try {
    const staff = await Staff.find()
      .select("-password")
      .populate("department", "name"); // ✅ Populate department name
    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE STAFF
export const updateUser = async (req, res) => {
  try {
    const user = await Staff.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { fullName, username, email, phone, role, password, status, department } = req.body;

    if (role && role !== user.role) {
      const conflict = await Staff.findOne({ role });
      if (conflict && conflict._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: `Role '${role}' is already assigned.` });
      }
    }

    if (fullName) user.fullName = fullName.trim().toLowerCase();
    if (username) user.username = username.trim().toLowerCase();
    if (email) user.email = email.trim().toLowerCase();
    if (phone) user.phone = phone.trim().toLowerCase();
    if (role) user.role = role.trim().toLowerCase();
    if (status) user.status = status;
    if (department) user.department = department;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE STAFF
export const deleteUser = async (req, res) => {
  try {
    const user = await Staff.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Staff deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ROOMS
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms." });
  }
};


// ✅ UPDATE GUEST DETAILS (e.g., status, stay duration)
export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !["it", "front office manager","supervisor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only IT or Front Office Manager can update guests." });
    }

    const guest = await Guest.findById(id);
    if (!guest) return res.status(404).json({ message: "Guest not found." });

    const { roomNumber, status, password, stayDuration } = req.body;

    if (roomNumber) guest.roomNumber = roomNumber;
    if (stayDuration) guest.stayDuration = stayDuration;

    if (status) {
      if (!["active", "checked_out"].includes(status)) {
        return res.status(400).json({ message: "Invalid guest status." });
      }
      guest.status = status;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      guest.password = await bcrypt.hash(password, salt);
    }

    const updated = await guest.save();
    res.status(200).json({ message: "Guest updated successfully", guest: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

