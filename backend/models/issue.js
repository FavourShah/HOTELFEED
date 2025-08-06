import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    roomNumber: { type: String },
    location: { type: String },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reportedByModel",
    },
    reportedByModel: {
      type: String,
      required: true,
      enum: ["Guest", "Staff"],
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },

    archived: {
      type: Boolean,
      default: false,
    },

    // Archive-related fields  
    archivedAt: { type: Date },
    archivedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Staff' 
    },
    unarchivedAt: { type: Date },
    unarchivedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Staff' 
    },

    attachments: [{ type: String }],
    remarks: { type: String },
    statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
issueSchema.index({ archived: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ department: 1 });

export const Issue = mongoose.model("Issue", issueSchema);