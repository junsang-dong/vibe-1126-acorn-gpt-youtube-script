import express from 'express';
import openai, { summarizeLargeText, retryWithBackoff, estimateWordCount } from '../utils/openai.js';
import { SYSTEM_PROMPT, generateScriptPrompt, condenseScriptPrompt, countWords } from '../utils/prompts.js';
import { logger } from '../index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { title, referenceContent, duration, targetAudience, tone } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!referenceContent || referenceContent.trim().length === 0) {
      return res.status(400).json({ error: 'Reference content is required' });
    }

    if (!duration || ![5, 10, 15].includes(parseInt(duration))) {
      return res.status(400).json({ error: 'Duration must be 5, 10, or 15 minutes' });
    }

    const durationNum = parseInt(duration);
    const targetWordCount = estimateWordCount(durationNum);

    logger.info({
      title,
      duration: durationNum,
      targetWordCount,
      contentLength: referenceContent.length
    }, 'Generating script');

    // Summarize if content is too large
    let processedContent = referenceContent;
    if (referenceContent.length > 10000) {
      logger.info('Content too large, summarizing...');
      processedContent = await summarizeLargeText(referenceContent);
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullScript = '';
    let totalTokens = 0;

    // Generate script with streaming
    const stream = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: generateScriptPrompt(title, processedContent, durationNum, targetAudience, tone) }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      });
    });

    // Stream response to client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullScript += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Check if script needs condensing
    const wordCount = countWords(fullScript);
    logger.info({ wordCount, targetWordCount }, 'Initial script generated');

    if (wordCount > targetWordCount + 200) {
      logger.info('Script too long, condensing...');
      
      res.write(`data: ${JSON.stringify({ status: 'condensing' })}\n\n`);

      const condenseCompletion = await retryWithBackoff(async () => {
        return await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: condenseScriptPrompt(fullScript, targetWordCount) }
          ],
          temperature: 0.5,
          max_tokens: 4000
        });
      });

      fullScript = condenseCompletion.choices[0].message.content;
      totalTokens += condenseCompletion.usage.total_tokens;

      const finalWordCount = countWords(fullScript);
      logger.info({ finalWordCount }, 'Script condensed');
    }

    // Send completion signal
    const duration_ms = Date.now() - startTime;
    res.write(`data: ${JSON.stringify({ 
      status: 'complete',
      metadata: {
        wordCount: countWords(fullScript),
        duration: duration_ms,
        tokensUsed: totalTokens
      }
    })}\n\n`);
    
    res.end();

    logger.info({
      duration: duration_ms,
      finalWordCount: countWords(fullScript),
      tokensUsed: totalTokens,
      cost: (totalTokens * 0.00001).toFixed(4)
    }, 'Script generation completed');

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error generating script');
    
    res.write(`data: ${JSON.stringify({ 
      error: 'Failed to generate script',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })}\n\n`);
    res.end();
  }
});

export default router;

