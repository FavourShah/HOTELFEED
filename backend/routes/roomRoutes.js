import express from "express";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Public route — used for guest login dropdown
router.get("/", getRooms);

// 🔐 IT-only protected routes
router.post("/", protect, requireIT, createRoom);
router.put("/:id", protect,  updateRoom);     // Handles status + stayDays
router.delete("/:id", protect, requireIT, deleteRoom);

export default router;
