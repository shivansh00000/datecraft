const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// @desc    Upload media file
// @route   POST /api/upload
// @access  Private
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const localFilePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Determine type
    let fileType = 'image';
    if (['.mp4', '.mov', '.webm', '.avi'].includes(fileExtension)) {
      fileType = 'video';
    } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExtension)) {
      fileType = 'audio';
    }

    // If Cloudinary is configured, upload and clean local file
    if (isCloudinaryConfigured) {
      try {
        const resourceType = fileType === 'image' ? 'image' : (fileType === 'video' ? 'video' : 'raw');
        
        const result = await cloudinary.uploader.upload(localFilePath, {
          folder: 'datecraft',
          resource_type: resourceType
        });

        // Delete local temp file
        fs.unlinkSync(localFilePath);

        return res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          type: fileType
        });
      } catch (cloudError) {
        console.error('Cloudinary upload failure, falling back to local file storage:', cloudError.message);
        // Continue to local fallback
      }
    }

    // Local static fallback: serve from local uploads dir
    // Generate public file path link
    const host = req.get('host');
    const protocol = req.protocol;
    const publicUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      publicId: req.file.filename,
      type: fileType
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete media file
// @route   DELETE /api/upload/:id
// @access  Private
exports.deleteMedia = async (req, res) => {
  try {
    const fileId = req.params.id;

    if (isCloudinaryConfigured && !fileId.includes('.')) {
      // If it doesn't have an extension, it's likely a Cloudinary public ID
      await cloudinary.uploader.destroy(fileId);
      return res.status(200).json({ success: true, message: 'Cloudinary media deleted successfully' });
    }

    // Local file fallback
    const localFilePath = path.join(__dirname, '../uploads', fileId);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      return res.status(200).json({ success: true, message: 'Local media deleted successfully' });
    }

    res.status(404).json({ success: false, message: 'Media file not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
