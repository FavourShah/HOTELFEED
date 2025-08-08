// controllers/propertyController.js
import { Property } from "../models/property.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { cloudinary, storage } from "../config/cloudinary.js";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
export const upload = multer({ storage }); // from Cloudinary config


export const getProperty = async (req, res) => {
  try {
    console.log('📋 Getting property info...');
    const property = await Property.findOne();
    
    if (!property) {
      console.log('📋 No property found, returning defaults');
      return res.json({
        name: '',
        logoUrl: '',
        createdAt: null,
        updatedAt: null
      });
    }
    
    console.log('📋 Property found:', {
      name: property.name,
      logoUrl: property.logoUrl,
      hasLogo: !!property.logoUrl
    });
    
    res.json(property);
  } catch (err) {
    console.error('❌ Error fetching property:', err);
    res.status(500).json({ 
      message: "Failed to get property info",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    console.log('📝 Updating property:', { name, logoUrl });
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        message: "Property name is required" 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        message: "Property name must be at least 2 characters long" 
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ 
        message: "Property name must be less than 100 characters" 
      });
    }

    let property = await Property.findOne();
    
    const updateData = {
      name: name.trim(),
      logoUrl: logoUrl || property?.logoUrl || ''
    };

    if (!property) {
      console.log('📝 Creating new property');
      property = await Property.create(updateData);
    } else {
      console.log('📝 Updating existing property');
      // Update property
      Object.assign(property, updateData);
      await property.save();
    }

    console.log('✅ Property updated successfully');
    res.json({
      ...property.toObject(),
      message: "Property updated successfully"
    });
    
  } catch (err) {
    console.error('❌ Error updating property:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error",
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update property info",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const uploadLogo = async (req, res) => {
  try {
   if (!req.file?.path) {
  return res.status(400).json({ message: 'No image uploaded' });
}


    const property = await Property.findOne(); // or based on user

    // ✅ Store relative path for frontend
 property.logoUrl = req.file.path; // ✅ This is the Cloudinary URL

    await property.save();

    res.status(200).json({ message: 'Logo uploaded', property });
  } catch (error) {
    console.error('Logo upload failed:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
};





export const deleteLogo = async (req, res) => {
  try {
    console.log('🗑️ Logo deletion started');

    const property = await Property.findOne();
    
    if (!property || !property.logoUrl) {
      console.log('❌ No logo found to delete');
      return res.status(404).json({ message: "No logo found to delete" });
    }

    const oldLogoUrl = property.logoUrl;
    console.log('🗑️ Current logo URL:', oldLogoUrl);

    // 1. 🧼 Attempt to delete from Cloudinary if it's a Cloudinary-hosted image
    const match = oldLogoUrl.match(/\/hotel\/logos\/([^/.]+)/);
    if (match) {
      const publicId = `hotel/logos/${match[1]}`;
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("✅ Cloudinary logo deleted:", publicId);
      } catch (err) {
        console.warn("⚠️ Failed to delete from Cloudinary:", err.message);
      }
    }

    // 2. 🧼 Fallback: Try deleting from local storage (if applicable)
    if (oldLogoUrl.includes('/uploads/')) {
      try {
        const filename = path.basename(new URL(oldLogoUrl, 'http://localhost').pathname);
        const filePath = path.join(__dirname, '../uploads/logos/', filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ Local logo file deleted:', filePath);
        } else {
          console.log('⚠️ Local logo file not found:', filePath);
        }
      } catch (deleteErr) {
        console.error('❌ Error deleting local logo file:', deleteErr);
      }
    }

    // 3. 🗑️ Clear logoUrl from DB
    property.logoUrl = '';
    await property.save();

    console.log('✅ Logo deletion completed');

    res.json({
      message: "Logo deleted successfully",
      property,
      debug: {
        deletedLogoUrl: oldLogoUrl,
        deletedFromCloudinary: !!match,
        wasLocalFile: oldLogoUrl.includes('/uploads/')
      }
    });

  } catch (err) {
    console.error('❌ Error deleting logo:', err);
    res.status(500).json({ 
      message: "Failed to delete logo",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};