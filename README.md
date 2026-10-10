<div align="center">

<img width="1200" height="475" alt="Inspiration Studio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ✨ Story • Joke • Quote Generator
### *Apple Liquid Glass Edition — Powered by Gemini 2.5 Flash & Perpetual Auto-Updating Engine*

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Design](https://img.shields.io/badge/Apple_HIG-Liquid_Glass-0071E3?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com/design/)
[![License: MIT](https://img.shields.io/badge/License-MIT-34C759?style=for-the-badge)](LICENSE)

<p align="center">
  A Cupertino-grade, hyper-realistic inspiration studio that crafts captivating micro-stories, witty humor, and philosophical quotes with fluid Apple spring physics, living color mesh glassmorphism, and perpetual year automation.
</p>

[✨ Explore Live](#-quickstart) • [ Apple Design System](#-apple-design-system--liquid-glass) • [🔄 Perpetual Engine](#-perpetual-auto-updating-engine) • [🚀 Features](#-key-features) • [🛠️ Architecture](#%EF%B8%8F-architecture)

---

</div>

## 🌟 Highlights & Aesthetics

Built adhering to the core tenets of Apple's **Human Interface Guidelines (HIG)** — *Clarity, Deference, and Depth* — and the **Liquid Glass** visual language:

- **💎 Living Multi-Layer Color Mesh Backdrop**: Dynamic GPU-accelerated radial color mesh that gently drifts behind translucent frosted glass, providing real-time luminance variation for authentic backdrop blur.
- **📱 Cupertino Segmented Controls**: Spring-animated sliding capsule selectors with SF Symbols iconography for seamless switching between Stories, Jokes, and Quotes.
- **🎙️ Siri-Style Natural Speech Synthesis**: Listen to any generated story, joke, or quote read aloud with synchronized 5-bar audio waveform equalizers.
- **🎨 Tone & Mood Modulation**: Curate the exact vibe—from *Plot-Twist*, *Sci-Fi*, and *Cyberpunk* to *Dad Jokes*, *Absurd Humor*, *Stoic Philosophy*, and *Future Horizons*.
- **⚡ Dual-Engine Architecture (Online + Intelligent Offline)**: Works instantaneously out of the box with an offline curated bank of realistic stories and jokes, and connects dynamically to Google's `gemini-2.5-flash` model when an API key is provided.
- **🗂️ Apple Bento Share Cards**: Export and copy formatted cards optimized for presentation and social sharing.

---

## 🔄 Perpetual Auto-Updating Engine

This application is built with **zero hardcoded dates** and an automated perpetual engine that stays fresh for the current year and all coming years:

1. **Dynamic Era Calculation**: Temporal context is determined dynamically (`new Date().getFullYear()`), seamlessly updating interface badges, copyright notices, and model prompts year after year.
2. **Dynamic AI Context Injection**: When generating stories or quotes, the current year is injected into Gemini's system instructions, ensuring temporal relevance without stale references.
3. **Daily Featured Inspiration**: A deterministic mathematical rotation algorithm (`(year * 365 + dayOfYear) % dataset.length`) presents a fresh featured story, joke, or quote each day without requiring manual database updates.

```
       Current Date / System Clock
                   │
                   ▼
       ┌───────────────────────────────┐
       │   Perpetual Temporal Anchor   │
       │     new Date().getFullYear()  │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│ UI Badges & Meta │       │ AI Prompt Inject │
│  © 2024–{Year}   │       │  Context: {Year} │
└──────────────────┘       └──────────────────┘
```

---

##  Apple Design System & Liquid Glass

The UI implements authentic Apple HIG design specifications:

| Component | Implementation | Apple HIG Principle |
| :--- | :--- | :--- |
| **Material** | `backdrop-filter: blur(28px) saturate(180%) brightness(103%)` | Depth without separation; chrome defers to content |
| **Specular Edge** | Top-edge light highlight with radial specular sheen | Realistic light refraction at boundary edges |
| **Touch Response** | Micro-spring scaling (`transform: scale(0.975)`) | Tactile and grounded physical feedback |
| **Typography** | SF Pro Display / System Font Stack with optical tracking | Maximum legibility and crisp letter spacing |
| **Adaptive Theming** | System Auto, Cupertino Light, and Midnight Space Gray | Instant theme synchronization |
| **Accessibility** | `@media (prefers-reduced-motion)` & `(prefers-reduced-transparency)` | Respects user accessibility preferences |

---

## 🚀 Key Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INSPIRATION STUDIO                              │
├───────────────────┬────────────────────────────────────────────────────┤
│ 📖 Micro-Stories  │ Plot Twist • Sci-Fi • Whimsical • Mystery • Noir   │
│ 🎭 Witty Jokes    │ One-Liner • Tech & Code • Dad Joke • Pun • Absurd  │
│ 💬 Deep Quotes    │ Stoic • Wisdom • Ambition • Resilience • Future    │
│ 🔊 Siri Voice     │ High-fidelity text-to-speech with audio wave eq    │
│ 📋 One-Click Copy │ Instant clipboard copy with animated toast         │
│ ❤️ Bookmarks      │ LocalStorage persistence with favorites filter     │
│ ⚙️ Engine Modal   │ Seamless Gemini API key entry or smart offline run │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 🛠️ Architecture

```
Story-Joke-Quote-Generator/
├── components/
│   └── icons.tsx              # Cupertino SF Symbols SVG icons
├── services/
│   └── geminiService.ts       # Gemini 2.5 Flash SDK & Perpetual Curated Engine
├── types.ts                   # Strongly-typed models, tones, & history items
├── styles.css                 # Apple Liquid Glass design tokens & keyframes
├── App.tsx                    # Main interactive Cupertino application
├── index.html                 # Apple web app meta tags & viewport fit
├── index.tsx                  # React 19 root bootstrap
├── vite.config.ts             # Vite bundler configuration & environment loader
└── package.json               # Dependencies & build scripts
```

---

## 💻 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Rahul08319/Story-Joke-Quote-Generator.git
cd Story-Joke-Quote-Generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Gemini API (Optional)
The application functions immediately out-of-the-box using the smart offline engine. If you want live Gemini 2.5 Flash AI generation:

Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can also set your API key directly inside the app's Settings modal via the UI).*

### 4. Start local development server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Build for production
```bash
npm run build
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Crafted with precision, Apple HIG craft, and Google Gemini AI by Rahul Kumar</sub>
</div>
