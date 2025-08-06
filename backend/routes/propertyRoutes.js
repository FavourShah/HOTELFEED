// routes/propertyRoutes.js
import express from "express";
import { 
  getProperty, 
  updateProperty, 
  uploadLogo, 
  deleteLogo, 
  upload 
} from "../controllers/propertyController.js";
import { protect, requireIT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get property info (accessible to all authenticated users)
router.get("/", protect, getProperty);

// Update property info (IT only)
router.put("/", protect, requireIT, updateProperty);

// Upload logo (IT only)
router.post("/logo", protect, requireIT, upload.single('logo'), uploadLogo);

// Delete logo (IT only)
router.delete("/logo", protect, requireIT, deleteLogo);

export default router;