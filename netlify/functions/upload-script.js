import multipart from 'parse-multipart-data';

function normalizeText(text) {
  return text
    .replace(/\[?\d{1,2}:\d{2}:\d{2}\]?/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u3131-\uD79D.,!?'"()-]/g, '')
    .trim();
}

function isValidUTF8(str) {
  try {
    const buffer = Buffer.from(str, 'utf-8');
    return buffer.toString('utf-8') === str;
  } catch (e) {
    return false;
  }
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' })
      };
    }

    // Parse multipart data
    const boundary = contentType.split('boundary=')[1];
    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const parts = multipart.parse(bodyBuffer, boundary);

    if (!parts || parts.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    const filePart = parts.find(part => part.name === 'file');
    
    if (!filePart) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file field found' })
      };
    }

    // Check file type
    const filename = filePart.filename || '';
    if (!filename.endsWith('.txt')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file type',
          message: 'Only .txt files are allowed'
        })
      };
    }

    // Check file size (1MB limit)
    if (filePart.data.length > 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large',
          message: 'Maximum file size is 1MB'
        })
      };
    }

    // Read content
    let content = filePart.data.toString('utf-8');

    // Validate UTF-8
    if (!isValidUTF8(content)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file encoding',
          message: 'File must be UTF-8 encoded'
        })
      };
    }

    // Normalize text
    content = normalizeText(content);

    // Validate content
    if (content.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Empty file',
          message: 'The uploaded file is empty'
        })
      };
    }

    if (content.length < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Content too short',
          message: 'The file content is too short (minimum 100 characters)'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content,
        metadata: {
          originalFilename: filename,
          size: filePart.data.length,
          length: content.length
        }
      })
    };

  } catch (error) {
    console.error('Error processing uploaded file:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process file',
        details: error.message
      })
    };
  }
};

