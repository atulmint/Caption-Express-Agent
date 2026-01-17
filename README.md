# CaptionCraft AI - Adobe Express Add-On

> AI-powered social media caption generator that uses Gemini for content understanding and GPT for caption generation.

![CaptionCraft AI](https://img.shields.io/badge/Adobe%20Express-Add--on-FF0000?style=for-the-badge&logo=adobe)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)

## 🚀 Features

### Input Sources
- **Text Input**: Describe your content, product, or idea
- **PDF Upload**: Extract content from PDF documents
- **Image Upload**: AI analyzes images to understand context

### Platform-Specific Captions
- **Instagram**: Engaging captions with hashtags (5-10 per post)
- **YouTube**: SEO-optimized descriptions
- **LinkedIn**: Professional thought leadership content

### Tone Options
- **Professional**: Clear, authoritative language
- **Fun**: Light-hearted, playful content
- **GenZ**: Trendy slang and meme culture
- **Motivational**: Inspiring and empowering

### Language Support
- **English**: Standard modern English
- **Hinglish**: Hindi-English mix popular in India

### AI Pipeline
1. **Gemini API**: Extracts and summarizes content into 3-5 key bullet points
2. **GPT API**: Generates platform-optimized captions with:
   - 3 unique caption variations
   - 2 hook lines per caption
   - 1 call-to-action
   - Relevant hashtags (for Instagram)

### Adobe Express Integration
- **One-click insert**: Add captions directly to your design canvas
- **Copy to clipboard**: Quick copy for use elsewhere
- **Regenerate**: Get new variations instantly

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Adobe Express account (for testing)
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

1. **Clone/Download the project**
   ```bash
   cd captioncraft-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add icons** (optional for local testing)
   
   Create two PNG icons in `src/assets/`:
   - `icon-24.png` (24x24 pixels)
   - `icon-48.png` (48x48 pixels)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Load in Adobe Express**
   - Go to [Adobe Express](https://express.adobe.com)
   - Open Developer Tools (F12)
   - Enable add-on development mode
   - Load from URL: `https://localhost:5241`

## 🔧 Development

### Project Structure
```
captioncraft-ai/
├── src/
│   ├── ui/
│   │   ├── index.tsx      # React entry point
│   │   ├── App.tsx        # Main application component
│   │   └── styles.css     # Custom styling
│   ├── sandbox/
│   │   └── code.ts        # Document sandbox (text insertion)
│   ├── services/
│   │   ├── geminiService.ts  # Gemini API integration
│   │   └── gptService.ts     # OpenAI GPT integration
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   └── assets/            # Add-on icons
├── manifest.json          # Adobe Express add-on manifest
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

### API Keys

API keys are securely stored using Adobe Express's client storage API, which persists per-user/per-addon. Keys are saved locally and never sent to external servers (except to the respective AI APIs).

## 🎨 Usage Guide

### Quick Start (2-minute demo)

1. **Open Adobe Express** and create a new design
2. **Load the add-on** from the add-ons panel
3. **Enter your API keys** (saved for future use)
4. **Type or upload content** describing what you want to post about
5. **Select platform, tone, and language**
6. **Click "Generate Captions"** ✨
7. **Review the 3 generated captions** with hook lines and CTAs
8. **Click "Insert"** to add your favorite caption to the design

### Pro Tips

- **Start with a clear description**: The more context you provide, the better the captions
- **Use images for visual content**: Gemini Vision can understand photos and graphics
- **Experiment with tones**: The same content can work differently across platforms
- **Regenerate for variety**: Click the refresh button on any caption to get a new version

## 🔒 Security

- API keys are stored locally using Adobe's secure client storage
- Keys are only sent to their respective APIs (Gemini/OpenAI)
- No data is stored on external servers
- All communication uses HTTPS

## 🐛 Troubleshooting

### "Could not extract sufficient text from PDF"
- The PDF may be image-based (scanned). Try using the image upload instead, or copy-paste the text directly.

### "Gemini API error"
- Check your API key is valid
- Ensure you have quota remaining
- The fallback will use GPT-only mode with text input

### "Failed to insert text"
- Make sure you have a design open in Adobe Express
- Try refreshing the page and reloading the add-on

### Captions aren't appearing in the design
- Check if you're on an artboard/page
- The text is inserted at 10% from left, 40% from top by default

## 📄 License

MIT License - feel free to modify and distribute!

## 🙏 Acknowledgments

- Built with the [Adobe Express Add-on SDK](https://developer.adobe.com/express/add-ons/)
- AI powered by [Google Gemini](https://ai.google.dev/) and [OpenAI GPT](https://openai.com/)
- UI components from [Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/)

---

**Made with ❤️ for the Adobe Express community**
