# Caption Express Agent - Adobe Express Add-On

> AI-powered social media caption generator that uses Gemini for content understanding and GPT for caption generation.

# Caption Express Agent

AI-powered social media caption generator built as an **Adobe Express Add-on**, designed to create clean, platform-optimized captions with a native Adobe-style UI.

![Adobe Express](https://img.shields.io/badge/Adobe%20Express-Add--on-FF0000?style=for-the-badge&logo=adobe)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-API-000000?style=for-the-badge)

---

## ✨ Overview

**Caption Express Agent** helps creators, marketers, and designers instantly generate high-quality social media captions directly inside **Adobe Express**.

The add-on focuses on:
- Adobe Express–native UI/UX
- Fast caption generation using **Groq-powered LLaMA models**
- Platform-specific tone and formatting
- Clean, minimal, professional design (no AI gimmicks)

---

## 🚀 Features

### Input Types
- **Text Input** – Describe your content, event, product, or idea
- **Image Upload** – Use images as creative context for captions

### Supported Platforms
- **Instagram** – Engaging captions with relevant hashtags
- **YouTube** – Clear and descriptive captions
- **LinkedIn** – Professional, polished captions

### Instant Caption Generation
Caption Express Agent analyzes your content and generates platform-optimized captions instantly. Choose your platform and tone—Instagram hooks, YouTube SEO, or LinkedIn polish. No prompt engineering.

---

### Tone Options
- **Pro** – Professional and brand-safe
- **Fun** – Light and engaging
- **GenZ** – Casual and trendy
- **Motivational** – Inspiring and positive

---

### Language Support
- **English**
- **Hinglish** (Hindi + English mix)

---

## 🧠 AI Architecture

The add-on uses a **Groq-powered LLaMA model pipeline** for fast and reliable caption generation.

- **Groq API**
  - Model: `llama-3.1-8b-instant`
- Optimized for:
  - Low latency
  - Clean, human-like outputs
  - Real-time usage inside Adobe Express

> No Gemini or OpenAI APIs are used in the current version.

---

## 🎨 UI & UX Principles

- Designed to visually match **Adobe Express**
- White + mint color theme
- Minimal Lucide icons
- Subtle black hover states
- Clear spacing and typography
- Emoji usage kept minimal and optional

---

## 📦 Installation & Development (All Steps)

### Prerequisites
- Node.js 18+
- npm or yarn
- Adobe Express account (Developer Mode enabled)
- Groq API key → https://console.groq.com

---

### Setup & Run

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
AUTO CAPTION/
├── dist/
│   ├── assets/
│   ├── code.js
│   ├── index.html
│   ├── index.js
│   └── manifest.json
├── icon/
│   ├── fun.jpg
│   ├── genz.jpg
│   ├── motive.png
│   └── pro.jpg
├── node_modules/
├── src/
│   ├── assets/
│   ├── sandbox/
│   │   └── code.ts
│   ├── services/
│   │   ├── geminiService.ts   (legacy / unused)
│   │   └── gptService.ts      (legacy / unused)
│   ├── types/
│   │   ├── adobe-sdk.d.ts
│   │   └── index.ts
│   └── ui/
│       ├── App.tsx
│       ├── index.tsx
│       └── styles.css
├── index.html
├── manifest.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── webpack.config.js
└── README.md

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


## 📄 License

MIT License - feel free to modify and distribute!

## 🙏 Acknowledgments

- Built with the [Adobe Express Add-on SDK](https://developer.adobe.com/express/add-ons/)
- contentReference[oaicite:0]{index=0}** for providing high-performance AI inference and enabling fast,       low-latency caption generation using LLaMA models.
- Lucide React for clean, minimal iconography aligned with modern UI standards.
- Adobe Spectrum Design System for UI/UX inspiration and design consistency.


---

**Made with ❤️ for the Adobe Express community**
