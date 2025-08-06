// ✅ Updated models/room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  roomType: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["select", "active", "checked_out"],
    default: "select",
  },
  stayDays: {
    type: Number,
    default: 0,
  },
  activatedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const Room = mongoose.model('Room', roomSchema);
