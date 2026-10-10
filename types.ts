export enum ContentType {
  Story = 'story',
  Joke = 'joke',
  Quote = 'quote',
}

export type StoryTone = 'plot-twist' | 'sci-fi' | 'whimsical' | 'mystery' | 'heartwarming' | 'cyberpunk';
export type JokeTone = 'one-liner' | 'pun' | 'dad-joke' | 'tech' | 'witty' | 'absurd';
export type QuoteTone = 'stoic' | 'wisdom' | 'ambition' | 'creativity' | 'resilience' | 'futuristic';

export type Tone = StoryTone | JokeTone | QuoteTone;

export interface HistoryItem {
  id: string;
  type: ContentType;
  content: string;
  timestamp: number;
  tone?: string;
  isFavorite?: boolean;
  year?: number;
  authorOrTag?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface DailyFeature {
  type: ContentType;
  content: string;
  attribution?: string;
  tag: string;
  dateKey: string;
}

export interface GenerationOptions {
  tone?: string;
  customTopic?: string;
  currentYear?: number;
  apiKey?: string;
}
