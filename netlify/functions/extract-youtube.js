import { YoutubeTranscript } from 'youtube-transcript';

function normalizeText(text) {
  return text
    .replace(/\[?\d{1,2}:\d{2}:\d{2}\]?/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u3131-\uD79D.,!?'"()-]/g, '')
    .trim();
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
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
    const { url } = JSON.parse(event.body);

    if (!url || url.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'YouTube URL is required' })
      };
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid YouTube URL format' })
      };
    }

    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptItems || transcriptItems.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'No transcript available for this video',
            message: 'This video does not have public subtitles/captions. Please upload a transcript file instead.'
          })
        };
      }

      const fullText = transcriptItems.map(item => item.text).join(' ');
      const normalizedText = normalizeText(fullText);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          transcript: normalizedText,
          metadata: {
            videoId,
            length: normalizedText.length,
            duration: transcriptItems[transcriptItems.length - 1]?.offset / 1000 || 0
          }
        })
      };

    } catch (transcriptError) {
      if (transcriptError.message.includes('disabled') || 
          transcriptError.message.includes('not available')) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Transcript not available',
            message: 'This video does not have public subtitles/captions enabled. Please upload a transcript file instead.'
          })
        };
      }
      throw transcriptError;
    }

  } catch (error) {
    console.error('Error extracting YouTube transcript:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to extract transcript',
        message: 'Unable to extract transcript. Please try uploading a transcript file instead.'
      })
    };
  }
};

