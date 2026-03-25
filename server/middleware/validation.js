import { logger } from '../logger.js';

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
}

/**
 * Validate YouTube URL
 */
export function isValidYoutubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}(&.*)?$/;
  return youtubeRegex.test(url);
}

/**
 * Validate text length
 */
export function validateTextLength(text, minLength = 0, maxLength = 100000) {
  if (typeof text !== 'string') return false;
  return text.length >= minLength && text.length <= maxLength;
}

/**
 * Validate duration value
 */
export function validateDuration(duration) {
  const validDurations = [5, 10, 15];
  return validDurations.includes(parseInt(duration));
}

/**
 * Middleware to validate and sanitize request body
 */
export function validateRequestBody(requiredFields = []) {
  return (req, res, next) => {
    try {
      // Check required fields
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            error: `Missing required field: ${field}`
          });
        }
      }

      // Sanitize string fields
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      }

      next();
    } catch (error) {
      logger.error({ error: error.message }, 'Validation error');
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

/**
 * Middleware to log request metrics
 */
export function logMetrics(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }, 'Request completed');
  });

  next();
}

/**
 * Error handler for multer file upload errors
 */
export function handleMulterError(err, req, res, next) {
  if (err) {
    logger.error({ error: err.message }, 'File upload error');
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 1MB'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Only single file upload is allowed'
      });
    }
    
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }
  
  next();
}

