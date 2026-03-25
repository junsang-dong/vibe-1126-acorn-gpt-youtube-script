import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { normalizeText } from '../utils/openai.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * Extract video ID from YouTube URL
 */
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

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    // Validation
    if (!url || url.trim().length === 0) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL format' });
    }

    logger.info({ videoId, url }, 'Extracting YouTube transcript');

    try {
      // Fetch transcript
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptItems || transcriptItems.length === 0) {
        return res.status(404).json({ 
          error: 'No transcript available for this video',
          message: 'This video does not have public subtitles/captions. Please upload a transcript file instead.'
        });
      }

      // Combine transcript items into full text
      const fullText = transcriptItems
        .map(item => item.text)
        .join(' ');

      // Normalize text
      const normalizedText = normalizeText(fullText);

      logger.info({
        videoId,
        transcriptLength: normalizedText.length,
        itemsCount: transcriptItems.length
      }, 'Transcript extracted successfully');

      res.json({
        transcript: normalizedText,
        metadata: {
          videoId,
          length: normalizedText.length,
          duration: transcriptItems[transcriptItems.length - 1]?.offset / 1000 || 0
        }
      });

    } catch (transcriptError) {
      logger.warn({
        videoId,
        error: transcriptError.message
      }, 'Failed to fetch transcript');

      // Check if it's a "no transcript" error
      if (transcriptError.message.includes('disabled') || 
          transcriptError.message.includes('not available')) {
        return res.status(404).json({
          error: 'Transcript not available',
          message: 'This video does not have public subtitles/captions enabled. Please upload a transcript file instead.',
          suggestion: 'You can manually create a transcript or use a third-party service to transcribe the video.'
        });
      }

      throw transcriptError;
    }

  } catch (error) {
    logger.error({ 
      error: error.message, 
      stack: error.stack 
    }, 'Error extracting YouTube transcript');
    
    res.status(500).json({
      error: 'Failed to extract transcript',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      message: 'Unable to extract transcript. Please try uploading a transcript file instead.'
    });
  }
});

export default router;

