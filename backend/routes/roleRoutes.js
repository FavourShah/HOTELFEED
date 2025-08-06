// routes/roleRoutes.js
import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Protected: Only IT users can manage roles
router.get("/", getRoles);
router.post("/", protect, requireIT, createRole);
router.put("/:id", protect, requireIT, updateRole);
router.delete("/:id", protect, requireIT, deleteRole);

export default router;
