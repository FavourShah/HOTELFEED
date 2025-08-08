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
    if (!req.file?.filename) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const property = await Property.findOne(); // or based on user

    // ✅ Store relative path for frontend
    property.logoUrl = `/uploads/logos/${req.file.filename}`;
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