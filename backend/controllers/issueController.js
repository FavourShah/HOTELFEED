import { Issue } from "../models/issue.js";
import fs from "fs";
import path from "path";

// CREATE ISSUE (Staff or Guest)
export const createIssue = async (req, res) => {
  try {
    const { title, description, roomNumber, location } = req.body;

    const attachments =
      req.files?.map(
        (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      ) || [];

    const user = req.user;

    const issue = new Issue({
      title,
      description,
      roomNumber,
      location,
      reportedBy: user._id,
      reportedByModel: user.role === "guest" ? "Guest" : "Staff",
      attachments,
    });

    const saved = await issue.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL ISSUES (With optional status or department filter)
export const getAllIssues = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const issues = await Issue.find(query)
      .populate("reportedBy", "fullName username roomNumber")
      .populate("department", "name")
      .populate("statusChangedBy", "fullName username");

    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET A SINGLE ISSUE BY ID
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "fullName username roomNumber")
      .populate("department", "name")
      .populate("statusChangedBy", "fullName username");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE ISSUE
export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.attachments.forEach((url) => {
      const filePath = url.split("/uploads/")[1];
      const fullPath = path.join(process.cwd(), "uploads", filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    await issue.deleteOne();
    res.status(200).json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE ISSUE (Assign or Change Status)
export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, status, remarks } = req.body;
    const user = req.user;

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const role = user.role?.toLowerCase();
    const isIT = role === "it";
    const isOwnDept = issue.department?.toString() === user.department?.toString();
    const elevatedRoles = ["front office manager", "general manager", "duty manager"];
    const previousStatus = issue.status;

    // Assign department
    if (department !== undefined && department !== issue.department?.toString()) {
      if (!isIT && !elevatedRoles.includes(role)) {
        return res.status(403).json({
          message: "Access denied: Only IT, General Manager,  Front Office Manager, or Duty Manager can assign departments"
        });
      }
      issue.department = department || null;
      issue.assignedBy = user._id;
    }

    // Update status
    if (status) {
      if (!isIT && !isOwnDept && !elevatedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied: Not authorized to update this issue" });
      }

      if (status === "resolved") {
        if (!remarks || !remarks.trim()) {
          return res.status(400).json({ message: "Remarks required to resolve an issue" });
        }
        issue.remarks = remarks;
        issue.statusChangedBy = user._id;
        issue.resolvedAt = new Date();
      }

      issue.status = status;

      if (previousStatus === "resolved" && status !== "resolved") {
        issue.remarks = undefined;
        issue.statusChangedBy = undefined;
        issue.resolvedAt = undefined;
      }
    }

    const updated = await issue.save();

    const populated = await Issue.findById(updated._id)
      .populate("reportedBy", "fullName username roomNumber")
      .populate("department", "name")
      .populate("statusChangedBy", "fullName username");

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE ISSUE STATUS ONLY
export const updateIssueStatusOnly = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const user = req.user;

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const role = user.role?.toLowerCase();
    const isIT = role === "it";
    const isOwnDept = issue.department?.toString() === user.department?.toString();
    const elevatedRoles = ["front office manager", "general manager"];
    const previousStatus = issue.status;

    if (!isIT && !isOwnDept && !elevatedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied: Not authorized to update this issue" });
    }

    if (status === "resolved") {
      if (!remarks || !remarks.trim()) {
        return res.status(400).json({ message: "Remarks required to resolve an issue" });
      }
      issue.remarks = remarks;
      issue.statusChangedBy = user._id;
      issue.resolvedAt = new Date();
    }

    issue.status = status;

    if (previousStatus === "resolved" && status !== "resolved") {
      issue.remarks = undefined;
      issue.statusChangedBy = undefined;
      issue.resolvedAt = undefined;
    }

    const updated = await issue.save();

    const populated = await Issue.findById(updated._id)
      .populate("reportedBy", "fullName username roomNumber")
      .populate("department", "name")
      .populate("statusChangedBy", "fullName username");

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ISSUES REPORTED BY CURRENT USER
export const getMyReports = async (req, res) => {
  try {
    const issues = await Issue.find({
      reportedBy: req.user._id,
      reportedByModel: req.user.role === "guest" ? "Guest" : "Staff",
    })
      .populate("department", "name")
      .populate("statusChangedBy", "fullName username");

    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ISSUES ASSIGNED TO MY DEPARTMENT
export const getAssignedToMyDept = async (req, res) => {
  try {
    const dept = req.user.department;
    if (!dept) {
      return res.status(400).json({ message: "You have no department assigned" });
    }

    const issues = await Issue.find({ department: dept })
      .populate("reportedBy", "username roomNumber")
      .populate("statusChangedBy", "fullName username");

    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add these functions to your issueController.js file

// BULK ARCHIVE ISSUES
export const bulkArchiveIssues = async (req, res) => {
  try {
    const { issueIds } = req.body;
    const user = req.user;
    
    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ message: 'Invalid issue IDs provided' });
    }

    // Check user permissions - only certain roles can archive
    const role = user.role?.toLowerCase();
    const elevatedRoles = ["it", "front office manager", "general manager", "duty manager"];
    
    if (!elevatedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Access denied: Only IT, General Manager, Front Office Manager, or Duty Manager can archive issues' 
      });
    }

    // Update multiple issues to set archived: true
    const result = await Issue.updateMany(
      { _id: { $in: issueIds } },
      { 
        $set: { 
          archived: true, 
          archivedAt: new Date(),
          archivedBy: user._id
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No issues found to archive' });
    }

    res.json({ 
      message: `${result.modifiedCount} issue${result.modifiedCount > 1 ? 's' : ''} archived successfully`,
      archivedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk archive error:', error);
    res.status(500).json({ message: 'Failed to archive issues', error: error.message });
  }
};

// BULK UNARCHIVE ISSUES
export const bulkUnarchiveIssues = async (req, res) => {
  try {
    const { issueIds } = req.body;
    const user = req.user;
    
    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ message: 'Invalid issue IDs provided' });
    }

    // Check user permissions
    const role = user.role?.toLowerCase();
    const elevatedRoles = ["it", "front office manager", "general manager", "duty manager"];
    
    if (!elevatedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Access denied: Only IT, General Manager, Front Office Manager, or Duty Manager can unarchive issues' 
      });
    }

    // Update multiple issues to set archived: false
    const result = await Issue.updateMany(
      { _id: { $in: issueIds } },
      { 
        $set: { 
          archived: false,
          unarchivedAt: new Date(),
          unarchivedBy: user._id
        },
        $unset: { 
          archivedAt: 1,
          archivedBy: 1
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No issues found to unarchive' });
    }

    res.json({ 
      message: `${result.modifiedCount} issue${result.modifiedCount > 1 ? 's' : ''} unarchived successfully`,
      unarchivedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk unarchive error:', error);
    res.status(500).json({ message: 'Failed to unarchive issues', error: error.message });
  }
};

// INDIVIDUAL ARCHIVE ISSUE (optional)
export const archiveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check user permissions
    const role = user.role?.toLowerCase();
    const elevatedRoles = ["it", "front office manager", "general manager", "duty manager"];
    
    if (!elevatedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Access denied: Only IT, General Manager, Front Office Manager, or Duty Manager can archive issues' 
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { 
        archived: true, 
        archivedAt: new Date(),
        archivedBy: user._id
      },
      { new: true }
    ).populate("reportedBy", "fullName username roomNumber")
     .populate("department", "name")
     .populate("statusChangedBy", "fullName username")
     .populate("archivedBy", "fullName username");

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue archived successfully', issue });
  } catch (error) {
    console.error('Archive error:', error);
    res.status(500).json({ message: 'Failed to archive issue', error: error.message });
  }
};

// INDIVIDUAL UNARCHIVE ISSUE (optional)
export const unarchiveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check user permissions
    const role = user.role?.toLowerCase();
    const elevatedRoles = ["it", "front office manager", "general manager", "duty manager"];
    
    if (!elevatedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Access denied: Only IT, General Manager, Front Office Manager, or Duty Manager can unarchive issues' 
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { 
        $set: { 
          archived: false,
          unarchivedAt: new Date(),
          unarchivedBy: user._id
        },
        $unset: { 
          archivedAt: 1,
          archivedBy: 1
        }
      },
      { new: true }
    ).populate("reportedBy", "fullName username roomNumber")
     .populate("department", "name")
     .populate("statusChangedBy", "fullName username")
     .populate("unarchivedBy", "fullName username");

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue unarchived successfully', issue });
  } catch (error) {
    console.error('Unarchive error:', error);
    res.status(500).json({ message: 'Failed to unarchive issue', error: error.message });
  }
};