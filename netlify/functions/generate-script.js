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

  return chunkSummaries.join('\n\n');
}

function estimateWordCount(minutes) {
  const WPM = 130;
  return Math.round(minutes * WPM);
}

function generateScriptPrompt(title, referenceContent, duration, targetAudience = '', tone = '') {
  const wordCount = duration * 130;
  const wordRange = `${wordCount - 100} to ${wordCount + 100}`;

  let prompt = `Create a complete ${duration}-minute YouTube video script with the following specifications:

**Title:** ${title}

**Duration:** ${duration} minutes (approximately ${wordRange} words)

**Reference Content:** 
${referenceContent}

**Tone:** ${tone || 'Engaging, conversational, and informative'}
${targetAudience ? `**Target Audience:** ${targetAudience}` : ''}

**IMPORTANT REQUIREMENTS:**
1. Do NOT copy or plagiarize the reference content
2. Use the reference as inspiration but present ideas in completely new ways
3. Add your own insights, examples, and perspectives
4. Create original transitions and narrative flow
5. The script must feel fresh and unique

**Structure your script in the following format:**

# [VIDEO TITLE]

## Hook (0:00-0:30)
[Write a compelling opening that grabs attention in the first 30 seconds. Include what the viewer will learn and why they should keep watching.]

**Visual Direction:** [Describe what should be shown on screen]
**Narration:** [The exact words to be spoken]

---

## Synopsis
[Brief overview of what the video will cover - 2-3 sentences]

---

## Main Content

### Scene 1: [Scene Title] (0:30-X:XX)
**Visual Direction:** [Detailed description of visuals, b-roll, graphics needed]
**Narration:** [Complete narration for this scene]

### Scene 2: [Scene Title] (X:XX-X:XX)
**Visual Direction:** [Detailed description of visuals, b-roll, graphics needed]
**Narration:** [Complete narration for this scene]

[Continue with appropriate number of scenes for ${duration} minutes]

---

## Call-to-Action (Last 30 seconds)
**Visual Direction:** [Describe end screen elements, subscribe button animation, etc.]
**Narration:** [Strong CTA encouraging likes, subscriptions, comments]

---

## Production Notes
- Total estimated duration: ${duration} minutes
- Recommended B-roll: [List key visual elements needed]
- Key points to emphasize: [List 3-4 main takeaways]

**Word count must be approximately ${wordCount} words total.**`;

  return prompt;
}

function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { title, referenceContent, duration, targetAudience, tone } = JSON.parse(event.body);

    // Validation
    if (!title || title.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Title is required' })
      };
    }

    if (!referenceContent || referenceContent.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Reference content is required' })
      };
    }

    if (!duration || ![5, 10, 15].includes(parseInt(duration))) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Duration must be 5, 10, or 15 minutes' })
      };
    }

    const durationNum = parseInt(duration);
    const targetWordCount = estimateWordCount(durationNum);

    // Summarize if content is too large
    let processedContent = referenceContent;
    if (referenceContent.length > 10000) {
      processedContent = await summarizeLargeText(referenceContent);
    }

    // Set headers for streaming
    const streamHeaders = {
      ...headers,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    let fullScript = '';
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: generateScriptPrompt(title, processedContent, durationNum, targetAudience, tone) }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    });

    let responseText = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullScript += content;
        responseText += `data: ${JSON.stringify({ content })}\n\n`;
      }
    }

    // Check word count
    const wordCount = countWords(fullScript);
    
    // Send completion
    responseText += `data: ${JSON.stringify({ 
      status: 'complete',
      metadata: {
        wordCount,
        duration: 0,
        tokensUsed: 0
      }
    })}\n\n`;

    return {
      statusCode: 200,
      headers: streamHeaders,
      body: responseText
    };

  } catch (error) {
    console.error('Error generating script:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'text/event-stream' },
      body: `data: ${JSON.stringify({ 
        error: 'Failed to generate script',
        details: error.message
      })}\n\n`
    };
  }
};

