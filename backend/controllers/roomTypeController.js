// controllers/roomTypeController.js
import { RoomType } from "../models/roomType.js";

// GET all room types
export const getRoomTypes = async (req, res) => {
  const types = await RoomType.find().sort("name");
  res.status(200).json(types);
};

// CREATE new room type
export const createRoomType = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Room type is required" });

  const exists = await RoomType.findOne({ name: name.toLowerCase().trim() });
  if (exists) return res.status(400).json({ message: "Room type already exists" });

  const newType = await RoomType.create({ name: name.toLowerCase().trim() });
  res.status(201).json(newType);
};

// UPDATE a room type
export const updateRoomType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name required" });

  const type = await RoomType.findById(id);
  if (!type) return res.status(404).json({ message: "Room type not found" });

  type.name = name.toLowerCase().trim();
  await type.save();

  res.status(200).json({ message: "Room type updated", type });
};

// DELETE a room type
export const deleteRoomType = async (req, res) => {
  const { id } = req.params;
  const type = await RoomType.findByIdAndDelete(id);
  if (!type) return res.status(404).json({ message: "Room type not found" });

  res.status(200).json({ message: "Room type deleted" });
};
