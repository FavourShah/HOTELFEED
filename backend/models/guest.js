import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true,},
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "checked_out"], default: "active" },
  },
  { timestamps: true }
);

export const Guest = mongoose.model("Guest", guestSchema);
