// controllers/propertyController.js
import { Property } from "../models/property.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/logos/');
    console.log('📁 Multer destination:', uploadPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Created upload directory:', uploadPath);
    } else {
      console.log('✅ Upload directory exists:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'logo-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📁 Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('📁 File filter check:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ File type accepted');
    cb(null, true);
  } else {
    console.log('❌ File type rejected');
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
    console.log('🏞️ Logo upload started');
    console.log('🏞️ Request file info:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file in request');

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ CREATE FULL URL LIKE YOUR ISSUES CONTROLLER
    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/logos/${req.file.filename}`;
    console.log('🏞️ Generated logo URL (FULL):', logoUrl);
    
    // Check if file actually exists on disk
    const filePath = req.file.path;
    if (!fs.existsSync(filePath)) {
      console.log('❌ File was not saved to disk:', filePath);
      return res.status(500).json({ message: "File upload failed - file not saved" });
    }
    
    console.log('✅ File confirmed on disk:', filePath);
    console.log('📊 File size on disk:', fs.statSync(filePath).size, 'bytes');
    
    // Update property with new logo
    let property = await Property.findOne();
    console.log('🏞️ Current property:', property ? {
      name: property.name,
      currentLogoUrl: property.logoUrl
    } : 'No property exists');
    
    // Remove old logo file if it exists and is a local file
    if (property && property.logoUrl && property.logoUrl.includes('/uploads/') && property.logoUrl !== logoUrl) {
      // Extract filename from the old URL
      try {
        const oldUrl = new URL(property.logoUrl);
        const oldFilename = path.basename(oldUrl.pathname);
        const oldFilePath = path.join(__dirname, '../uploads/logos/', oldFilename);
        
        console.log('🗑️ Trying to delete old file:', oldFilePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('✅ Old logo file deleted successfully');
        }
      } catch (deleteErr) {
        console.error('❌ Error deleting old logo file:', deleteErr);
      }
    }
    
    if (!property) {
      // If no property exists, create one with empty name
      console.log('🏞️ Creating new property with logo');
      property = await Property.create({
        name: '',
        logoUrl: logoUrl
      });
    } else {
      console.log('🏞️ Updating existing property with new logo');
      property.logoUrl = logoUrl;
      await property.save();
    }

    console.log('✅ Logo upload completed successfully:', {
      filename: req.file.filename,
      logoUrl: logoUrl,
      filePath: req.file.path,
      propertyId: property._id
    });

    res.json({
      message: "Logo uploaded successfully",
      logoUrl: logoUrl,
      property: property,
      debug: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        diskSize: fs.statSync(filePath).size
      }
    });

  } catch (err) {
    console.error('❌ Error uploading logo:', err);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Cleaned up uploaded file after error');
      } catch (cleanupErr) {
        console.error('❌ Error cleaning up uploaded file:', cleanupErr);
      }
    }
    
    res.status(500).json({ 
      message: "Failed to upload logo",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    console.log('🗑️ Current logo URL:', property.logoUrl);

    // Delete file if it's a local upload (contains /uploads/)
    if (property.logoUrl.includes('/uploads/')) {
      try {
        const url = new URL(property.logoUrl);
        const filename = path.basename(url.pathname);
        const filePath = path.join(__dirname, '../uploads/logos/', filename);
        
        console.log('🗑️ Trying to delete file:', filePath);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ Logo file deleted successfully');
        } else {
          console.log('⚠️ Logo file not found on disk:', filePath);
        }
      } catch (deleteErr) {
        console.error('❌ Error deleting logo file:', deleteErr);
      }
    }

    // Clear logo URL from database
    const oldLogoUrl = property.logoUrl;
    property.logoUrl = '';
    await property.save();

    console.log('✅ Logo deletion completed');

    res.json({
      message: "Logo deleted successfully",
      property: property,
      debug: {
        deletedLogoUrl: oldLogoUrl,
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