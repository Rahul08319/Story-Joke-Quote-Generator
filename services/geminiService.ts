import { GoogleGenAI } from "@google/genai";
import { ContentType, GenerationOptions, DailyFeature } from '../types';

// Curated high-fidelity perpetual dataset for offline fallback & instant inspiration
const FALLBACK_STORIES = [
  {
    tone: 'plot-twist',
    text: "The lighthouse keeper spent thirty years guarding the rocky coast from shipwrecks. When the autonomous navigation grid went live in 2026, the coastguard finally visited to thank him. That was when they discovered the light had burned out in 1998, and every ship had simply been following his lantern on the porch."
  },
  {
    tone: 'sci-fi',
    text: "In the early hours of the new cycle, humanity's deepest neural observatory intercepted a repeating cosmic signal from Proxima Centauri. When decrypted, it didn't contain alien mathematics or coordinates. It was an automated receipt confirming that Earth's trial subscription to the universe had been renewed."
  },
  {
    tone: 'whimsical',
    text: "Every morning, an old clockmaker wound up a brass pocket watch that ran sixty seconds ahead of real time. People asked why he refused to fix it. He smiled and said that in a world where everyone scrambles to be on time, he prefers to meet the future one minute before anyone else."
  },
  {
    tone: 'mystery',
    text: "Deep inside the national archive, an archivist found a leather-bound journal cataloging global events with eerie precision. The final entry ended abruptly at midnight with a single handwritten note: 'If you are reading this, remember to look up at the streetlamps.' As she glanced out the window, every streetlamp turned blue."
  },
  {
    tone: 'heartwarming',
    text: "A retired maestro sat on a subway bench softly humming a forgotten melody. A small girl in yellow boots stopped, listened, and started tapping her feet to the cadence. Within minutes, the crowded carriage had fallen into a shared quiet rhythm, reminded that harmony needs no stage."
  },
  {
    tone: 'cyberpunk',
    text: "Rain sizzled against the neon holographic towers of Neo-Kyoto. Kael adjusted his retinal optic filters to locate the black-market chip containing original bird recordings from 2012. Plugging it in, the artificial sky momentarily flickered into dawn."
  }
];

const FALLBACK_JOKES = [
  {
    tone: 'one-liner',
    text: "I told my computer I needed a break, and now it refuses to stop sending me vacation kit pop-ups."
  },
  {
    tone: 'tech',
    text: "There are 10 types of people in the world: those who understand binary, and those who get confused by the other 8."
  },
  {
    tone: 'witty',
    text: "Artificial intelligence is no match for natural stupidity, but at least AI cites its sources."
  },
  {
    tone: 'dad-joke',
    text: "Why don't scientists trust atoms anymore? Because they literally make up everything!"
  },
  {
    tone: 'pun',
    text: "I used to play piano by ear, but now I find using my fingers sounds significantly better."
  },
  {
    tone: 'absurd',
    text: "Parallel lines have so much in common. It's truly a tragedy that they'll never meet."
  }
];

const FALLBACK_QUOTES = [
  {
    tone: 'stoic',
    text: "You have power over your mind, not outside events. Realize this, and you will find timeless strength.",
    author: "Marcus Aurelius"
  },
  {
    tone: 'creativity',
    text: "Creativity is intelligence having fun, turning empty canvases into living horizons.",
    author: "Albert Einstein"
  },
  {
    tone: 'wisdom',
    text: "Simplicity is the ultimate sophistication. When clarity leads, depth follows naturally.",
    author: "Leonardo da Vinci"
  },
  {
    tone: 'ambition',
    text: "The people who are crazy enough to think they can change the world are the ones who do.",
    author: "Steve Jobs"
  },
  {
    tone: 'resilience',
    text: "Do not pray for an easy life, pray for the strength to endure a difficult one and triumph.",
    author: "Bruce Lee"
  },
  {
    tone: 'futuristic',
    text: "The best way to predict the future is to invent it with unrelenting craft and courage.",
    author: "Alan Kay"
  }
];

// Helper to construct dynamic year-aware AI prompts
const getPrompt = (contentType: ContentType, options?: GenerationOptions): string => {
  const currentYear = options?.currentYear || new Date().getFullYear();
  const tone = options?.tone ? `in a "${options.tone}" tone/style` : '';
  const customTopic = options?.customTopic ? `focused on the theme or topic: "${options.customTopic}"` : '';

  switch (contentType) {
    case ContentType.Story:
      return `Write a captivating, realistic micro-story (about 3-4 sentences long) ${tone} ${customTopic}. Ensure it has evocative imagery and a thought-provoking, surprising conclusion. Current temporal context: ${currentYear}. Do not include markdown headers or commentary, output only the story.`;
    case ContentType.Joke:
      return `Tell a witty, clever, and hilarious joke ${tone} ${customTopic}. It should be fresh, modern, and memorable for an audience in ${currentYear}. Safe for work. Return only the joke text without preamble.`;
    case ContentType.Quote:
      return `Generate a profound, original, and deeply resonant quote ${tone} ${customTopic}. It should inspire someone navigating ${currentYear} and the coming years. Include an attribution or philosophical context if fitting (e.g. "— Philosophy of Modern Craft"). Output only the quote and optional attribution.`;
    default:
      throw new Error("Invalid content type");
  }
};

// Main generator with automatic fallback and dynamic year logic
export const generateContent = async (
  contentType: ContentType,
  options?: GenerationOptions
): Promise<string> => {
  // Check API key: custom user key -> vite env GEMINI_API_KEY -> process.env.API_KEY
  const apiKey =
    options?.apiKey?.trim() ||
    (typeof process !== 'undefined' && process.env?.API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    '';

  // If API key is available, attempt live generation via Gemini
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = getPrompt(contentType, options);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn("Live Gemini API generation encountered an issue, gracefully falling back to curated engine:", error);
      // Fall through to smart offline fallback
    }
  }

  // Smart Curated Generator Fallback
  return generateCuratedFallback(contentType, options);
};

// Generates high quality offline content tailored by tone and year
export const generateCuratedFallback = (
  contentType: ContentType,
  options?: GenerationOptions
): string => {
  const currentYear = options?.currentYear || new Date().getFullYear();
  const tone = options?.tone?.toLowerCase();

  if (contentType === ContentType.Story) {
    let pool = FALLBACK_STORIES;
    if (tone) {
      const filtered = FALLBACK_STORIES.filter(s => s.tone.toLowerCase().includes(tone) || tone.includes(s.tone.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    return item.text.replace(/2026/g, `${currentYear}`);
  }

  if (contentType === ContentType.Joke) {
    let pool = FALLBACK_JOKES;
    if (tone) {
      const filtered = FALLBACK_JOKES.filter(j => j.tone.toLowerCase().includes(tone) || tone.includes(j.tone.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    return item.text;
  }

  if (contentType === ContentType.Quote) {
    let pool = FALLBACK_QUOTES;
    if (tone) {
      const filtered = FALLBACK_QUOTES.filter(q => q.tone.toLowerCase().includes(tone) || tone.includes(q.tone.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    return `"${item.text}" — ${item.author}`;
  }

  return "Inspiration awaits on the horizon.";
};

// Dynamic Daily Featured item — updates automatically every single day and year!
export const getDailyFeaturedContent = (): DailyFeature => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dateKey = `${year}-${now.getMonth() + 1}-${now.getDate()}`;

  // Deterministically alternate between Story, Joke, and Quote based on day
  const typeIndex = dayOfYear % 3;
  if (typeIndex === 0) {
    const item = FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];
    return {
      type: ContentType.Quote,
      content: `"${item.text}"`,
      attribution: item.author,
      tag: `Quote of the Day (${year})`,
      dateKey,
    };
  } else if (typeIndex === 1) {
    const item = FALLBACK_STORIES[dayOfYear % FALLBACK_STORIES.length];
    return {
      type: ContentType.Story,
      content: item.text.replace(/2026/g, `${year}`),
      tag: `Story of the Day (${year})`,
      dateKey,
    };
  } else {
    const item = FALLBACK_JOKES[dayOfYear % FALLBACK_JOKES.length];
    return {
      type: ContentType.Joke,
      content: item.text,
      tag: `Daily Chuckle (${year})`,
      dateKey,
    };
  }
};
