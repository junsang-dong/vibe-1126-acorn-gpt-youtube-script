/**
 * System prompt for the script generation AI
 */
export const SYSTEM_PROMPT = `You are a senior video scriptwriter with extensive experience in creating engaging YouTube content. Your expertise includes:

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

/**
 * Generate prompt for creating title suggestions
 */
export function generateTitlesPrompt(referenceContent, targetAudience = '', tone = '') {
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

/**
 * Generate prompt for creating the full script
 */
export function generateScriptPrompt(
  title,
  referenceContent,
  duration,
  targetAudience = '',
  tone = ''
) {
  const wordCount = duration * 130; // 130 words per minute average
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

**Word count must be approximately ${wordCount} words total. If the script exceeds this, condense it while maintaining quality and completeness.**`;

  return prompt;
}

/**
 * Generate prompt for condensing an overly long script
 */
export function condenseScriptPrompt(script, targetWordCount) {
  return `The following script is too long. Please condense it to approximately ${targetWordCount} words while:

1. Maintaining all key points and structure
2. Keeping the hook and CTA strong
3. Preserving the conversational tone
4. Ensuring visual directions remain clear
5. Not losing important insights

Original script:
${script}

Please provide the condensed version in the same format.`;
}

/**
 * Extract structured data from generated titles
 */
export function parseTitles(response) {
  const lines = response.split('\n').filter(line => line.trim());
  const titles = [];
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      titles.push(match[1].trim());
    }
  }
  
  return titles.slice(0, 3); // Ensure only 3 titles
}

/**
 * Count words in text (approximate)
 */
export function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

