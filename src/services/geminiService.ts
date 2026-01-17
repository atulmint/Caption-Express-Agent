/**
 * Gemini API Service
 * 
 * Handles content extraction and understanding from:
 * - Text content
 * - PDF files (via text extraction)
 * - Images (via vision capabilities)
 * 
 * The goal is to summarize content into 3-5 bullet points
 * that capture the core idea for caption generation.
 */

import { ContentSummary } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Build the prompt for content summarization
 * This prompt is designed to extract the essence of content
 * for social media caption generation
 */
function buildSummarizationPrompt(content: string, isImage: boolean = false): string {
  const contextType = isImage ? 'image' : 'content';
  
  return `You are a content analyst specializing in social media marketing.

Analyze the following ${contextType} and provide a structured summary for caption generation.

Your task:
1. Identify the MAIN IDEA or core message
2. Extract 3-5 KEY POINTS that support the main idea
3. Identify relevant KEYWORDS for hashtag generation

${isImage ? 'Describe what you see in the image and extract the key themes, emotions, and messages it conveys.' : ''}

Content to analyze:
${content}

Respond in this EXACT JSON format:
{
  "mainIdea": "One sentence capturing the core message",
  "bulletPoints": [
    "Key point 1",
    "Key point 2", 
    "Key point 3",
    "Key point 4 (optional)",
    "Key point 5 (optional)"
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- Be concise but insightful
- Focus on what would resonate with social media audiences
- Extract emotional hooks if present
- Identify unique selling points or value propositions
- Keep bullet points under 15 words each`;
}

/**
 * Extract text content from a PDF file
 * Uses a simplified approach - in production, you'd use a PDF parsing library
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For PDF, we'll read as text (works for text-based PDFs)
  // In a production app, use pdf.js or similar library
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Simple text extraction - look for readable strings
  let text = '';
  let currentString = '';
  
  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[i];
    // Check if it's a printable ASCII character
    if (byte >= 32 && byte <= 126) {
      currentString += String.fromCharCode(byte);
    } else if (currentString.length > 3) {
      // Save strings longer than 3 characters
      text += currentString + ' ';
      currentString = '';
    } else {
      currentString = '';
    }
  }
  
  // Clean up the extracted text
  text = text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?;:'"()-]/g, '')
    .trim();
  
  if (text.length < 50) {
    throw new Error('Could not extract sufficient text from PDF. Please try pasting the text directly.');
  }
  
  // Limit to first 3000 characters to avoid token limits
  return text.substring(0, 3000);
}

/**
 * Convert image file to base64 for Gemini Vision API
 */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini API for text content analysis
 */
async function analyzeTextContent(
  content: string, 
  apiKey: string
): Promise<ContentSummary> {
  const prompt = buildSummarizationPrompt(content, false);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('No response from Gemini API');
  }

  return parseGeminiResponse(textResponse);
}

/**
 * Call Gemini API for image analysis
 */
async function analyzeImageContent(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<ContentSummary> {
  const prompt = buildSummarizationPrompt('', true);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('No response from Gemini API');
  }

  return parseGeminiResponse(textResponse);
}

/**
 * Parse Gemini's JSON response into ContentSummary
 */
function parseGeminiResponse(response: string): ContentSummary {
  try {
    // Extract JSON from response (it might be wrapped in markdown code blocks)
    let jsonStr = response;
    
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Try to find JSON object in the response
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      mainIdea: parsed.mainIdea || 'Content analyzed successfully',
      bulletPoints: Array.isArray(parsed.bulletPoints) 
        ? parsed.bulletPoints.slice(0, 5) 
        : ['Key insight extracted from content'],
      keywords: Array.isArray(parsed.keywords) 
        ? parsed.keywords.slice(0, 10) 
        : []
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // Fallback: extract key sentences from the response
    return {
      mainIdea: response.substring(0, 100),
      bulletPoints: [response.substring(0, 200)],
      keywords: []
    };
  }
}

/**
 * Main export: Analyze content from various sources
 */
export async function analyzeContent(
  input: string | File,
  inputType: 'text' | 'pdf' | 'image',
  apiKey: string
): Promise<ContentSummary> {
  try {
    if (inputType === 'text' && typeof input === 'string') {
      // Direct text analysis
      if (input.trim().length < 10) {
        throw new Error('Please provide more content for analysis (at least 10 characters)');
      }
      return await analyzeTextContent(input, apiKey);
    }
    
    if (inputType === 'pdf' && input instanceof File) {
      // Extract text from PDF then analyze
      const extractedText = await extractTextFromPDF(input);
      return await analyzeTextContent(extractedText, apiKey);
    }
    
    if (inputType === 'image' && input instanceof File) {
      // Analyze image directly with Gemini Vision
      const base64 = await imageToBase64(input);
      const mimeType = input.type || 'image/jpeg';
      return await analyzeImageContent(base64, mimeType, apiKey);
    }
    
    throw new Error(`Unsupported input type: ${inputType}`);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
}

/**
 * Fallback: Create a simple summary from text when Gemini fails
 * This allows GPT to still generate captions from raw text
 */
export function createFallbackSummary(text: string): ContentSummary {
  // Extract first 3 sentences as bullet points
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const bulletPoints = sentences.slice(0, 3).map(s => s.trim());
  
  // Extract potential keywords (nouns/important words)
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return {
    mainIdea: bulletPoints[0] || text.substring(0, 100),
    bulletPoints: bulletPoints.length > 0 ? bulletPoints : [text.substring(0, 200)],
    keywords
  };
}
