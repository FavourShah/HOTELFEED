import express from "express";
import { autoCheckoutHandler } from "../controllers/cronController.js";


const router = express.Router();

// No auth for cron-job.org; secure by obscurity or token in query
router.post("/auto-checkout", autoCheckoutHandler);

export default router;
