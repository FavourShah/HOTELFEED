import express from "express";
import { getGuestStayHistory } from "../controllers/stayController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/history/:userId", protect, requireIT, getGuestStayHistory);

export default router;
