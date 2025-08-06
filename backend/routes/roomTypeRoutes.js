import express from "express";
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from "../controllers/roomTypeController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, requireIT, getRoomTypes);
router.post("/", protect, requireIT, createRoomType);
router.put("/:id", protect, requireIT, updateRoomType);
router.delete("/:id", protect, requireIT, deleteRoomType);

export default router;
