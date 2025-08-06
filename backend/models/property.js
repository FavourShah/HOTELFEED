// models/property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      minlength: [2, 'Property name must be at least 2 characters long'],
      maxlength: [100, 'Property name must be less than 100 characters']
    },
    logoUrl: { 
      type: String,
      default: ''
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted dates
propertySchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt ? this.updatedAt.toLocaleDateString() : 'Never';
});

export const Property = mongoose.model("Property", propertySchema);