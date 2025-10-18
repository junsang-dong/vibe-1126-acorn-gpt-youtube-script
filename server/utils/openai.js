import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Chunk large text into smaller pieces for processing
 * @param {string} text - The text to chunk
 * @param {number} maxTokens - Maximum tokens per chunk (approximate)
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, maxTokens = 2500) {
  // Rough estimate: 1 token ≈ 4 characters
  const charsPerChunk = maxTokens * 4;
  const chunks = [];
  
  for (let i = 0; i < text.length; i += charsPerChunk) {
    chunks.push(text.slice(i, i + charsPerChunk));
  }
  
  return chunks;
}

/**
 * Summarize large text using map-reduce approach
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} Summarized text
 */
export async function summarizeLargeText(text) {
  const chunks = chunkText(text);
  
  if (chunks.length === 1) {
    return text; // No need to summarize if it's already small
  }
  
  // Map: Summarize each chunk
  const chunkSummaries = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes video transcripts concisely while preserving key information.'
          },
          {
            role: 'user',
            content: `Summarize the following transcript excerpt, keeping all important details:\n\n${chunk}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
    })
  );
  
  // Reduce: Combine summaries
  const combinedSummary = chunkSummaries.join('\n\n');
  
  // If combined summary is still too large, summarize again
  if (combinedSummary.length > 10000) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates comprehensive summaries from multiple text segments.'
        },
        {
          role: 'user',
          content: `Create a comprehensive summary from these excerpts:\n\n${combinedSummary}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
  }
  
  return combinedSummary;
}

/**
 * Normalize and clean text input
 * @param {string} text - Raw text input
 * @returns {string} Cleaned text
 */
export function normalizeText(text) {
  return text
    // Remove timestamps (e.g., [00:00:00] or 00:00:00)
    .replace(/\[?\d{1,2}:\d{2}:\d{2}\]?/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might cause issues
    .replace(/[^\w\s\u3131-\uD79D.,!?'"()-]/g, '')
    .trim();
}

/**
 * Estimate word count for a given duration
 * @param {number} minutes - Duration in minutes
 * @returns {number} Estimated word count
 */
export function estimateWordCount(minutes) {
  const WPM = 130; // Words per minute (average speaking rate)
  return Math.round(minutes * WPM);
}

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<any>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export default openai;

