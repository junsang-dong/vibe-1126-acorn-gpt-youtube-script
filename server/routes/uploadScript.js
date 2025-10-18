import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { normalizeText } from '../utils/openai.js';
import { logger } from '../index.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'server', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'script-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Only allow .txt files
  if (file.mimetype === 'text/plain' || path.extname(file.originalname).toLowerCase() === '.txt') {
    cb(null, true);
  } else {
    cb(new Error('Only .txt files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB max
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    logger.info({
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'File uploaded');

    // Read file content
    const filePath = req.file.path;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Validate UTF-8 encoding
    if (!isValidUTF8(content)) {
      fs.unlinkSync(filePath); // Clean up
      return res.status(400).json({ 
        error: 'Invalid file encoding',
        message: 'File must be UTF-8 encoded'
      });
    }

    // Normalize text
    content = normalizeText(content);

    // Validate content
    if (content.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        error: 'Empty file',
        message: 'The uploaded file is empty'
      });
    }

    if (content.length < 100) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        error: 'Content too short',
        message: 'The file content is too short (minimum 100 characters)'
      });
    }

    // Clean up file after processing
    fs.unlinkSync(filePath);

    logger.info({
      originalFilename: req.file.originalname,
      contentLength: content.length
    }, 'File processed successfully');

    res.json({
      content,
      metadata: {
        originalFilename: req.file.originalname,
        size: req.file.size,
        length: content.length
      }
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    logger.error({ 
      error: error.message, 
      stack: error.stack 
    }, 'Error processing uploaded file');

    if (error.message === 'Only .txt files are allowed') {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only .txt files are allowed'
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Maximum file size is 1MB'
      });
    }
    
    res.status(500).json({
      error: 'Failed to process file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Check if string is valid UTF-8
 */
function isValidUTF8(str) {
  try {
    // Try to encode and decode - if it fails, it's not valid UTF-8
    const buffer = Buffer.from(str, 'utf-8');
    return buffer.toString('utf-8') === str;
  } catch (e) {
    return false;
  }
}

export default router;

