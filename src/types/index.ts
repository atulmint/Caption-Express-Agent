// Platform types for social media captions
export type Platform = 'instagram' | 'youtube' | 'linkedin';

// Tone types for caption generation
export type Tone = 'professional' | 'fun' | 'genz' | 'motivational';

// Language types
export type Language = 'english' | 'hinglish';

// Input source types
export type InputSource = 'text' | 'pdf' | 'image';

// Caption generation result from GPT
export interface CaptionResult {
  id: string;
  caption: string;
  hookLines: string[];
  cta: string;
  hashtags: string[];
}

// Summary result from Gemini
export interface ContentSummary {
  bulletPoints: string[];
  mainIdea: string;
  keywords: string[];
}

// API Configuration
export interface ApiConfig {
  geminiApiKey: string;
  openaiApiKey: string;
}

// Caption generation request
export interface CaptionRequest {
  content: string;
  platform: Platform;
  tone: Tone;
  language: Language;
  summary?: ContentSummary;
}

// App state
export interface AppState {
  inputSource: InputSource;
  textInput: string;
  uploadedFile: File | null;
  platform: Platform;
  tone: Tone;
  language: Language;
  isLoading: boolean;
  captions: CaptionResult[];
  error: string | null;
  summary: ContentSummary | null;
}

// Document sandbox API interface
export interface DocumentSandboxApi {
  insertTextIntoCanvas(text: string): Promise<void>;
}
