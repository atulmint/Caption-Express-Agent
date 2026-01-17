/**
 * GPT API Service
 * 
 * Generates platform-specific social media captions using OpenAI's GPT.
 * 
 * Features:
 * - Platform-specific formatting (Instagram, YouTube, LinkedIn)
 * - Tone customization (Professional, Fun, GenZ, Motivational)
 * - Language support (English, Hinglish)
 * - Generates 3 caption variations + hook lines + CTA + hashtags
 */

import { CaptionResult, CaptionRequest, ContentSummary, Platform, Tone, Language } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Platform-specific guidelines for caption generation
 */
const PLATFORM_GUIDELINES: Record<Platform, string> = {
  instagram: `
    - Keep captions engaging and visually descriptive
    - Use emojis strategically (2-4 per caption)
    - Include a clear call-to-action
    - Optimal length: 150-200 words
    - Add relevant hashtags (5-10, mix of popular and niche)
    - Break text into short paragraphs for readability
    - Start with a strong hook to stop the scroll`,
  
  youtube: `
    - Focus on video content description
    - Include keywords for SEO
    - Add timestamps hints if relevant
    - Optimal length: 100-150 words for description start
    - Include a subscribe CTA
    - Mention what viewers will learn/gain
    - NO hashtags needed (YouTube descriptions are different)`,
  
  linkedin: `
    - Maintain professional tone even when casual
    - Focus on value, insights, and thought leadership
    - Use line breaks for readability
    - Optimal length: 150-300 words
    - Include industry-relevant insights
    - End with a question to encourage engagement
    - NO hashtags or minimal (3 max) professional hashtags`
};

/**
 * Tone-specific writing styles
 */
const TONE_STYLES: Record<Tone, string> = {
  professional: `
    - Clear, concise language
    - Data-driven when possible
    - Authoritative but approachable
    - Industry-appropriate vocabulary
    - Focus on expertise and credibility`,
  
  fun: `
    - Light-hearted and playful
    - Use wordplay and puns when appropriate
    - Casual and relatable language
    - Include humor that resonates broadly
    - Emojis add personality 🎉`,
  
  genz: `
    - Use trending phrases and slang (slay, no cap, lowkey, bussin, it's giving)
    - Short punchy sentences fr fr
    - Heavy emoji usage 💀🔥✨
    - Reference current memes/trends
    - Keep it real and authentic
    - Start with "POV:" or "Me when" if it fits`,
  
  motivational: `
    - Inspiring and uplifting language
    - Action-oriented verbs
    - Empowering messages
    - Include wisdom or life lessons
    - Use powerful metaphors
    - End with an inspiring quote or thought`
};

/**
 * Language-specific instructions
 */
const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  english: 'Write in clear, modern English.',
  hinglish: `Write in Hinglish - a mix of Hindi and English commonly used in India.
    Examples of Hinglish style:
    - "Yaar, this is so good na!"
    - "Bilkul amazing content hai ye"
    - "Aaj ka mood is totally lit 🔥"
    - Mix Hindi phrases naturally with English
    - Use Hindi words for emphasis and emotion`
};

/**
 * Build the main caption generation prompt
 * This is the core prompt engineering for quality captions
 */
function buildCaptionPrompt(request: CaptionRequest): string {
  const { platform, tone, language, summary, content } = request;
  
  const summaryText = summary 
    ? `
CONTENT SUMMARY:
Main Idea: ${summary.mainIdea}

Key Points:
${summary.bulletPoints.map(bp => `• ${bp}`).join('\n')}

Keywords: ${summary.keywords.join(', ')}
`
    : `
RAW CONTENT:
${content}
`;

  return `You are a world-class social media copywriter who creates viral, engaging content.

${summaryText}

PLATFORM: ${platform.toUpperCase()}
${PLATFORM_GUIDELINES[platform]}

TONE: ${tone.toUpperCase()}
${TONE_STYLES[tone]}

LANGUAGE: ${language.toUpperCase()}
${LANGUAGE_INSTRUCTIONS[language]}

YOUR TASK:
Create 3 unique caption variations that will maximize engagement for this content.

For each caption, you MUST also provide:
- 2 powerful hook lines (opening sentences that grab attention)
- 1 strong call-to-action (CTA)
${platform === 'instagram' ? '- 8-10 relevant hashtags (mix of popular and niche)' : ''}

IMPORTANT RULES:
1. DO NOT be generic - every caption should feel unique and tailored
2. DO NOT start with "Looking for" or "Want to" - be more creative
3. DO hook the reader in the first line - they should WANT to read more
4. DO match the tone perfectly - a GenZ caption should FEEL like GenZ
5. DO optimize for the platform's best practices
6. DO include a clear value proposition
7. DO make it shareable and engaging

Respond in this EXACT JSON format:
{
  "captions": [
    {
      "text": "Full caption text here",
      "hookLines": ["Hook line 1", "Hook line 2"],
      "cta": "Call to action text",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    {
      "text": "Second caption variation",
      "hookLines": ["Hook line 1", "Hook line 2"],
      "cta": "Call to action text",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    {
      "text": "Third caption variation",
      "hookLines": ["Hook line 1", "Hook line 2"],
      "cta": "Call to action text",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  ]
}

Generate captions that would make a social media manager say "This is exactly what I needed!"`;
}

/**
 * Parse GPT response into CaptionResult array
 */
function parseGPTResponse(response: string): CaptionResult[] {
  try {
    // Extract JSON from response
    let jsonStr = response;
    
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Find JSON object
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.captions || !Array.isArray(parsed.captions)) {
      throw new Error('Invalid response format');
    }
    
    return parsed.captions.map((caption: {
      text?: string;
      hookLines?: string[];
      cta?: string;
      hashtags?: string[];
    }, index: number) => ({
      id: `caption-${Date.now()}-${index}`,
      caption: caption.text || '',
      hookLines: Array.isArray(caption.hookLines) ? caption.hookLines : [],
      cta: caption.cta || '',
      hashtags: Array.isArray(caption.hashtags) 
        ? caption.hashtags.map((h: string) => h.replace(/^#/, '')) 
        : []
    }));
  } catch (error) {
    console.error('Failed to parse GPT response:', error);
    throw new Error('Failed to parse caption response. Please try again.');
  }
}

/**
 * Generate captions using OpenAI GPT API
 */
export async function generateCaptions(
  request: CaptionRequest,
  apiKey: string
): Promise<CaptionResult[]> {
  const prompt = buildCaptionPrompt(request);
  
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective and fast
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media copywriter. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // Creative but controlled
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    return parseGPTResponse(content);
  } catch (error) {
    console.error('GPT generation error:', error);
    throw error;
  }
}

/**
 * Regenerate a single caption with the same parameters
 */
export async function regenerateSingleCaption(
  request: CaptionRequest,
  apiKey: string,
  existingCaptions: string[]
): Promise<CaptionResult> {
  const prompt = `${buildCaptionPrompt(request)}

ADDITIONAL INSTRUCTION:
Generate ONE new unique caption that is DIFFERENT from these existing ones:
${existingCaptions.map((c, i) => `${i + 1}. ${c.substring(0, 100)}...`).join('\n')}

Respond with ONLY ONE caption in this format:
{
  "caption": {
    "text": "Full caption text",
    "hookLines": ["Hook 1", "Hook 2"],
    "cta": "CTA text",
    "hashtags": ["tag1", "tag2"]
  }
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media copywriter. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temp for more variety
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    // Parse single caption response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) jsonStr = jsonObjectMatch[0];
    
    const parsed = JSON.parse(jsonStr);
    const caption = parsed.caption || parsed.captions?.[0];
    
    return {
      id: `caption-${Date.now()}-regen`,
      caption: caption.text || '',
      hookLines: Array.isArray(caption.hookLines) ? caption.hookLines : [],
      cta: caption.cta || '',
      hashtags: Array.isArray(caption.hashtags) 
        ? caption.hashtags.map((h: string) => h.replace(/^#/, '')) 
        : []
    };
  } catch (error) {
    console.error('Regeneration error:', error);
    throw error;
  }
}
