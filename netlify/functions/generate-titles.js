import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper functions
function chunkText(text, maxTokens = 2500) {
  const charsPerChunk = maxTokens * 4;
  const chunks = [];
  for (let i = 0; i < text.length; i += charsPerChunk) {
    chunks.push(text.slice(i, i + charsPerChunk));
  }
  return chunks;
}

async function summarizeLargeText(text) {
  const chunks = chunkText(text);
  if (chunks.length === 1) return text;

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

  const combinedSummary = chunkSummaries.join('\n\n');
  
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

function generateTitlesPrompt(referenceContent, targetAudience = '', tone = '') {
  let prompt = `Based on the following reference content, generate 3 creative and unique video title ideas that would make compelling YouTube videos. Each title should:

- Be distinct and original (not just a rephrasing of the reference)
- Appeal to viewers who would be interested in the reference topic
- Be engaging and click-worthy
- Be between 40-60 characters
- Use the ${tone || 'engaging and informative'} tone

Reference content summary:
${referenceContent.substring(0, 2000)}...`;

  if (targetAudience) {
    prompt += `\n\nTarget audience: ${targetAudience}`;
  }

  prompt += `\n\nProvide exactly 3 titles in this format:
1. [Title 1]
2. [Title 2]
3. [Title 3]`;

  return prompt;
}

function parseTitles(response) {
  const lines = response.split('\n').filter(line => line.trim());
  const titles = [];
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      titles.push(match[1].trim());
    }
  }
  
  return titles.slice(0, 3);
}

const SYSTEM_PROMPT = `You are a senior video scriptwriter with extensive experience in creating engaging YouTube content. Your expertise includes:

- Crafting compelling narratives that hook viewers in the first 30 seconds
- Structuring content with clear story arcs and pacing
- Writing conversational yet professional scripts
- Creating visual descriptions for video editors
- Understanding YouTube best practices and audience retention

When creating scripts, you must:
1. NEVER plagiarize - always reinterpret and present ideas in unique ways
2. Add original insights and perspectives to referenced material
3. Structure content for maximum viewer engagement
4. Use a conversational tone that feels natural when spoken
5. Include specific visual guidance for each scene`;

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
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
    const { referenceContent, targetAudience, tone } = JSON.parse(event.body);

    // Validation
    if (!referenceContent || referenceContent.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Reference content is required' })
      };
    }

    if (referenceContent.length > 100000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Reference content is too long (max 100,000 characters)' })
      };
    }

    // Summarize if content is too large
    let processedContent = referenceContent;
    if (referenceContent.length > 10000) {
      processedContent = await summarizeLargeText(referenceContent);
    }

    // Generate titles
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: generateTitlesPrompt(processedContent, targetAudience, tone) }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    const titles = parseTitles(response);

    if (titles.length === 0) {
      throw new Error('Failed to parse titles from response');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        titles,
        metadata: {
          tokensUsed: completion.usage.total_tokens,
          duration: 0
        }
      })
    };

  } catch (error) {
    console.error('Error generating titles:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate titles',
        details: error.message
      })
    };
  }
};

