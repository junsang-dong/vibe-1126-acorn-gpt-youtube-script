import express from 'express';
import multer from 'multer';
import path from 'path';
import { normalizeText } from '../utils/openai.js';
import { logger } from '../logger.js';

const router = express.Router();

const storage = multer.memoryStorage();

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

    let content = req.file.buffer.toString('utf-8');

    if (!isValidUTF8(content)) {
      return res.status(400).json({
        error: 'Invalid file encoding',
        message: 'File must be UTF-8 encoded'
      });
    }

    content = normalizeText(content);

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty file',
        message: 'The uploaded file is empty'
      });
    }

    if (content.length < 100) {
      return res.status(400).json({
        error: 'Content too short',
        message: 'The file content is too short (minimum 100 characters)'
      });
    }

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

