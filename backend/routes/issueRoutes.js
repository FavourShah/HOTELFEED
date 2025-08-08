import express from "express";
import multer from "multer";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  updateIssueStatusOnly,
  deleteIssue,
  getMyReports,
  getAssignedToMyDept,
  // Add the new archive functions
  bulkArchiveIssues,
  bulkUnarchiveIssues,
  archiveIssue,
  unarchiveIssue,
} from "../controllers/issueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { canAssign } from "../middleware/roleMiddleware.js";
import { issueStorage } from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: issueStorage });
// Existing routes
router.post("/", protect, upload.array("attachments", 5), createIssue);
router.get("/", protect, getAllIssues);
router.get("/my-reports", protect, getMyReports);
router.get("/assigned-to-dept", protect, getAssignedToMyDept);
router.get("/:id", protect, getIssueById);
router.put("/:id/assign", protect, canAssign, updateIssue);
router.put('/:id/status', protect, updateIssueStatusOnly);
router.delete("/:id", protect, deleteIssue);

// New archive routes
router.put("/bulk-archive", protect, bulkArchiveIssues);
router.put("/bulk-unarchive", protect, bulkUnarchiveIssues);
router.put("/:id/archive", protect, archiveIssue);
router.put("/:id/unarchive", protect, unarchiveIssue);

export default router;