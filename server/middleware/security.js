/**
 * Security middleware for request validation and protection
 */

/**
 * Validate Content-Type for JSON requests
 */
export function validateContentType(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    
    // Allow multipart/form-data for file uploads
    if (req.path.includes('upload')) {
      return next();
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json'
      });
    }
  }
  
  next();
}

/**
 * Add security headers
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

/**
 * Request size limiter to prevent DoS
 */
export function requestSizeLimiter(maxSize = '2mb') {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024);
      const maxMB = parseInt(maxSize);
      
      if (sizeMB > maxMB) {
        return res.status(413).json({
          error: 'Request too large',
          message: `Maximum request size is ${maxSize}`
        });
      }
    }
    
    next();
  };
}

/**
 * API key validation (if using API keys in the future)
 */
export function validateApiKey(req, res, next) {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required'
    });
  }
  
  // Validate API key (implement your own logic)
  // For now, we'll skip this check
  next();
}

