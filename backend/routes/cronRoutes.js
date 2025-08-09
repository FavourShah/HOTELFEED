import express from "express";
import { autoCheckoutHandler } from "../controllers/cronController.js";


const router = express.Router();

// No auth for cron-job.org; secure by obscurity or token in query
router.get("/auto-checkout", autoCheckout);

export default router;
