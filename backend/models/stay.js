// models/stay.js
import mongoose from "mongoose";

const staySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomNumber: { type: Number, required: true },
  checkinDate: { type: Date, default: Date.now },
  checkoutDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "checked_out"], default: "active" },
}, { timestamps: true });

export const Stay = mongoose.model("Stay", staySchema);
