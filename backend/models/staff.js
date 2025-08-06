import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Staff = mongoose.model("Staff", staffSchema);
