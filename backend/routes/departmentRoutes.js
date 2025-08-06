// routes/departmentRoutes.js
import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDepartments);
router.post("/", protect, requireIT, createDepartment);
router.put("/:id", protect, requireIT, updateDepartment);
router.delete("/:id", protect, requireIT, deleteDepartment);

export default router;
