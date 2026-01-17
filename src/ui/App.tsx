/**
 * CaptionCraft AI - Main Application Component
 * 
 * AI-powered social media caption generator for Adobe Express
 * Uses Gemini for content understanding and GPT for caption generation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Theme } from '@swc-react/theme';
import addOnUISdk from 'https://express.adobe.com/static/add-on-sdk/sdk.js';

import { 
  Platform, 
  Tone, 
  Language, 
  InputSource, 
  CaptionResult, 
  ContentSummary,
  DocumentSandboxApi
} from '../types';
import { analyzeContent, createFallbackSummary } from '../services/geminiService';
import { generateCaptions, regenerateSingleCaption } from '../services/gptService';

// Icons as SVG components for clean UI
const TextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M9 15h6M9 11h6"/>
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17,8 12,3 7,8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const InsertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Platform data
const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' }
];

// Tone data
const TONES: { value: Tone; label: string; icon: string }[] = [
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'fun', label: 'Fun', icon: '🎉' },
  { value: 'genz', label: 'GenZ', icon: '🔥' },
  { value: 'motivational', label: 'Motivational', icon: '💪' }
];

// Language data
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'english', label: '🇬🇧 English' },
  { value: 'hinglish', label: '🇮🇳 Hinglish' }
];

const App: React.FC = () => {
  // State management
  const [inputSource, setInputSource] = useState<InputSource>('text');
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone] = useState<Tone>('fun');
  const [language, setLanguage] = useState<Language>('english');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  // API Keys state
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showApiKeys, setShowApiKeys] = useState(true);
  
  // SDK state
  const [sdkReady, setSdkReady] = useState(false);
  const sandboxProxyRef = useRef<DocumentSandboxApi | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Adobe SDK
  useEffect(() => {
    const initSdk = async () => {
      try {
        await addOnUISdk.ready;
        console.log('Adobe Express SDK ready');
        
        // Get the sandbox proxy for document operations
        const { runtime } = addOnUISdk.instance;
        if (runtime.apiProxy) {
          sandboxProxyRef.current = await runtime.apiProxy('documentSandbox') as DocumentSandboxApi;
        }
        
        setSdkReady(true);
        
        // Load saved API keys from client storage
        const clientStorage = addOnUISdk.instance.clientStorage;
        const savedGeminiKey = await clientStorage.getItem('geminiApiKey') as string;
        const savedOpenaiKey = await clientStorage.getItem('openaiApiKey') as string;
        
        if (savedGeminiKey) setGeminiKey(savedGeminiKey);
        if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
        if (savedGeminiKey && savedOpenaiKey) setShowApiKeys(false);
        
      } catch (err) {
        console.error('SDK initialization error:', err);
      }
    };
    
    initSdk();
  }, []);

  // Save API keys when changed
  const saveApiKeys = useCallback(async () => {
    if (sdkReady) {
      const clientStorage = addOnUISdk.instance.clientStorage;
      await clientStorage.setItem('geminiApiKey', geminiKey);
      await clientStorage.setItem('openaiApiKey', openaiKey);
      showToast('API keys saved!');
    }
  }, [geminiKey, openaiKey, sdkReady]);

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validPdfTypes = ['application/pdf'];
    
    if (inputSource === 'image' && !validImageTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    if (inputSource === 'pdf' && !validPdfTypes.includes(file.type)) {
      setError('Please select a valid PDF file');
      return;
    }
    
    setUploadedFile(file);
    setError(null);
  }, [inputSource]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Main generation function
  const handleGenerate = useCallback(async () => {
    // Validate inputs
    if (!geminiKey || !openaiKey) {
      setError('Please enter both API keys');
      setShowApiKeys(true);
      return;
    }
    
    if (inputSource === 'text' && !textInput.trim()) {
      setError('Please enter some text content');
      return;
    }
    
    if ((inputSource === 'pdf' || inputSource === 'image') && !uploadedFile) {
      setError(`Please upload a ${inputSource.toUpperCase()} file`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCaptions([]);
    setSummary(null);
    
    try {
      // Step 1: Analyze content with Gemini
      setLoadingStep('Analyzing content with AI...');
      
      let contentSummary: ContentSummary;
      const input = inputSource === 'text' ? textInput : uploadedFile!;
      
      try {
        contentSummary = await analyzeContent(input, inputSource, geminiKey);
      } catch (geminiError) {
        // Fallback if Gemini fails
        console.warn('Gemini failed, using fallback:', geminiError);
        if (inputSource === 'text') {
          contentSummary = createFallbackSummary(textInput);
        } else {
          throw new Error('Could not analyze file. Please try with text input instead.');
        }
      }
      
      setSummary(contentSummary);
      
      // Step 2: Generate captions with GPT
      setLoadingStep('Crafting perfect captions...');
      
      const generatedCaptions = await generateCaptions({
        content: textInput,
        platform,
        tone,
        language,
        summary: contentSummary
      }, openaiKey);
      
      setCaptions(generatedCaptions);
      showToast('Captions generated! ✨');
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [inputSource, textInput, uploadedFile, platform, tone, language, geminiKey, openaiKey]);

  // Copy caption to clipboard
  const handleCopy = useCallback(async (caption: CaptionResult) => {
    let fullText = caption.caption;
    
    // Add hashtags for Instagram
    if (platform === 'instagram' && caption.hashtags.length > 0) {
      fullText += '\n\n' + caption.hashtags.map(h => `#${h}`).join(' ');
    }
    
    try {
      await navigator.clipboard.writeText(fullText);
      showToast('Caption copied! 📋');
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy to clipboard');
    }
  }, [platform]);

  // Insert caption into Adobe Express canvas
  const handleInsert = useCallback(async (caption: CaptionResult) => {
    if (!sandboxProxyRef.current) {
      setError('Adobe Express connection not available');
      return;
    }
    
    try {
      let textToInsert = caption.caption;
      
      // Add hashtags for Instagram
      if (platform === 'instagram' && caption.hashtags.length > 0) {
        textToInsert += '\n\n' + caption.hashtags.map(h => `#${h}`).join(' ');
      }
      
      const success = await sandboxProxyRef.current.insertTextIntoCanvas(textToInsert);
      
      if (success) {
        showToast('Caption added to design! 🎨');
      } else {
        setError('Failed to insert text. Make sure a design is open.');
      }
    } catch (err) {
      console.error('Insert error:', err);
      setError('Failed to insert caption');
    }
  }, [platform]);

  // Regenerate a single caption
  const handleRegenerate = useCallback(async (captionId: string) => {
    if (!summary) return;
    
    const captionIndex = captions.findIndex(c => c.id === captionId);
    if (captionIndex === -1) return;
    
    try {
      // Show loading on specific card
      const updatedCaptions = [...captions];
      updatedCaptions[captionIndex] = {
        ...updatedCaptions[captionIndex],
        caption: '⏳ Regenerating...'
      };
      setCaptions(updatedCaptions);
      
      const newCaption = await regenerateSingleCaption(
        { content: textInput, platform, tone, language, summary },
        openaiKey,
        captions.map(c => c.caption)
      );
      
      updatedCaptions[captionIndex] = newCaption;
      setCaptions(updatedCaptions);
      showToast('Caption regenerated! 🔄');
      
    } catch (err) {
      console.error('Regeneration error:', err);
      setError('Failed to regenerate caption');
    }
  }, [captions, summary, textInput, platform, tone, language, openaiKey]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Check if can generate
  const canGenerate = (inputSource === 'text' && textInput.trim().length > 0) ||
    ((inputSource === 'pdf' || inputSource === 'image') && uploadedFile !== null);

  return (
    <Theme theme="express" color="dark" scale="medium">
      <div className="captioncraft-container">
        {/* Header */}
        <header className="header">
          <h1>CaptionCraft AI</h1>
          <p className="tagline">AI-powered captions for social media</p>
        </header>

        {/* API Keys Section */}
        {showApiKeys && (
          <div className="api-key-section">
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔑 API Keys</span>
              {geminiKey && openaiKey && (
                <button 
                  className="action-button" 
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                  onClick={() => setShowApiKeys(false)}
                >
                  Hide
                </button>
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label className="api-key-label">Gemini API Key</label>
              <input
                type="password"
                className="api-key-input"
                placeholder="Enter your Gemini API key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label className="api-key-label">OpenAI API Key</label>
              <input
                type="password"
                className="api-key-input"
                placeholder="Enter your OpenAI API key"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
            <button 
              className="action-button primary" 
              style={{ width: '100%', marginTop: '8px' }}
              onClick={saveApiKeys}
            >
              Save Keys
            </button>
          </div>
        )}

        {!showApiKeys && (
          <button 
            className="action-button" 
            style={{ width: '100%', marginBottom: '16px', padding: '8px' }}
            onClick={() => setShowApiKeys(true)}
          >
            🔑 Update API Keys
          </button>
        )}

        {/* Input Source Tabs */}
        <section className="section">
          <div className="section-title">Input Source</div>
          <div className="input-tabs">
            <button
              className={`tab-button ${inputSource === 'text' ? 'active' : ''}`}
              onClick={() => { setInputSource('text'); setUploadedFile(null); }}
            >
              <TextIcon /> Text
            </button>
            <button
              className={`tab-button ${inputSource === 'pdf' ? 'active' : ''}`}
              onClick={() => { setInputSource('pdf'); setUploadedFile(null); }}
            >
              <PdfIcon /> PDF
            </button>
            <button
              className={`tab-button ${inputSource === 'image' ? 'active' : ''}`}
              onClick={() => { setInputSource('image'); setUploadedFile(null); }}
            >
              <ImageIcon /> Image
            </button>
          </div>

          {/* Text Input */}
          {inputSource === 'text' && (
            <div className="text-input-wrapper">
              <textarea
                className="text-input"
                placeholder="Describe your content, product, or idea...&#10;&#10;Example: We just launched our new eco-friendly water bottle that keeps drinks cold for 24 hours. Made from recycled ocean plastic!"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                maxLength={2000}
              />
              <span className="char-count">{textInput.length}/2000</span>
            </div>
          )}

          {/* File Upload */}
          {(inputSource === 'pdf' || inputSource === 'image') && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={inputSource === 'pdf' ? '.pdf' : 'image/*'}
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              
              {!uploadedFile ? (
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadIcon />
                  <p>Drag & drop or click to upload</p>
                  <p className="file-types">
                    {inputSource === 'pdf' ? 'PDF files only' : 'JPEG, PNG, GIF, WebP'}
                  </p>
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-icon">
                    {inputSource === 'pdf' ? <PdfIcon /> : <ImageIcon />}
                  </div>
                  <div className="file-info">
                    <div className="file-name">{uploadedFile.name}</div>
                    <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
                  </div>
                  <button
                    className="remove-file"
                    onClick={() => setUploadedFile(null)}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Platform Selector */}
        <section className="section">
          <div className="section-title">Platform</div>
          <div className="selector-grid">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                className={`selector-button ${platform === p.value ? 'active' : ''}`}
                onClick={() => setPlatform(p.value)}
              >
                <span className="icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tone Selector */}
        <section className="section">
          <div className="section-title">Tone</div>
          <div className="selector-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {TONES.map(t => (
              <button
                key={t.value}
                className={`selector-button ${tone === t.value ? 'active' : ''}`}
                onClick={() => setTone(t.value)}
              >
                <span className="icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Language Selector */}
        <section className="section">
          <div className="section-title">Language</div>
          <div className="language-grid">
            {LANGUAGES.map(l => (
              <button
                key={l.value}
                className={`selector-button ${language === l.value ? 'active' : ''}`}
                onClick={() => setLanguage(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner" style={{ width: '18px', height: '18px' }} />
              Generating...
            </>
          ) : (
            <>
              <SparkleIcon /> Generate Captions
            </>
          )}
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Creating magic...</p>
            <p className="loading-step">{loadingStep}</p>
          </div>
        )}

        {/* Summary Section */}
        {summary && !isLoading && (
          <div className="summary-section">
            <div className="summary-title">📊 Content Analysis</div>
            <ul className="summary-bullets">
              {summary.bulletPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results Section */}
        {captions.length > 0 && !isLoading && (
          <section className="results-section">
            <div className="results-header">
              <h3>✨ Generated Captions</h3>
            </div>

            {captions.map((caption, index) => (
              <div key={caption.id} className="caption-card">
                <div className="caption-label">Caption {index + 1}</div>
                
                {/* Hook Lines */}
                {caption.hookLines.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    {caption.hookLines.map((hook, i) => (
                      <div key={i} className="hook-line">
                        💡 {hook}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Main Caption */}
                <p className="caption-text">{caption.caption}</p>
                
                {/* CTA */}
                {caption.cta && (
                  <div className="cta">
                    <div className="cta-label">Call to Action</div>
                    {caption.cta}
                  </div>
                )}
                
                {/* Hashtags (Instagram only) */}
                {platform === 'instagram' && caption.hashtags.length > 0 && (
                  <div className="hashtags">
                    {caption.hashtags.map((tag, i) => (
                      <span key={i} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <div className="card-actions">
                  <button
                    className="action-button primary"
                    onClick={() => handleInsert(caption)}
                  >
                    <InsertIcon /> Insert
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleCopy(caption)}
                  >
                    <CopyIcon /> Copy
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleRegenerate(caption.id)}
                  >
                    <RefreshIcon />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Toast Notification */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </Theme>
  );
};

export default App;
