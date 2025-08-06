// models/roomType.js
import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
}, { timestamps: true });

export const RoomType = mongoose.model("RoomType", roomTypeSchema);
