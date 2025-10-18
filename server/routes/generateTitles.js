import express from 'express';
import openai, { summarizeLargeText, retryWithBackoff } from '../utils/openai.js';
import { SYSTEM_PROMPT, generateTitlesPrompt, parseTitles } from '../utils/prompts.js';
import { logger } from '../index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { referenceContent, targetAudience, tone } = req.body;

    // Validation
    if (!referenceContent || referenceContent.trim().length === 0) {
      return res.status(400).json({ error: 'Reference content is required' });
    }

    if (referenceContent.length > 100000) {
      return res.status(400).json({ error: 'Reference content is too long (max 100,000 characters)' });
    }

    logger.info({
      contentLength: referenceContent.length,
      targetAudience: targetAudience || 'not specified',
      tone: tone || 'not specified'
    }, 'Generating titles');

    // Summarize if content is too large
    let processedContent = referenceContent;
    if (referenceContent.length > 10000) {
      logger.info('Content too large, summarizing...');
      processedContent = await summarizeLargeText(referenceContent);
    }

    // Generate titles with retry logic
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: generateTitlesPrompt(processedContent, targetAudience, tone) }
        ],
        temperature: 0.8,
        max_tokens: 300
      });
    });

    const response = completion.choices[0].message.content;
    const titles = parseTitles(response);

    if (titles.length === 0) {
      throw new Error('Failed to parse titles from response');
    }

    const duration = Date.now() - startTime;
    logger.info({
      duration,
      titlesCount: titles.length,
      tokensUsed: completion.usage.total_tokens,
      cost: (completion.usage.total_tokens * 0.00001).toFixed(4) // Rough cost estimate
    }, 'Titles generated successfully');

    res.json({
      titles,
      metadata: {
        tokensUsed: completion.usage.total_tokens,
        duration
      }
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error generating titles');
    
    res.status(500).json({
      error: 'Failed to generate titles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

