import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ContentType, HistoryItem, ThemeMode, StoryTone, JokeTone, QuoteTone, DailyFeature } from './types';
import { generateContent, getDailyFeaturedContent } from './services/geminiService';
import {
  StoryIcon,
  JokeIcon,
  QuoteIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  VolumeIcon,
  StopIcon,
  HeartIcon,
  ShareIcon,
  SunIcon,
  MoonIcon,
  SystemThemeIcon,
  SettingsIcon,
  CalendarIcon,
  TrashIcon,
  KeyIcon,
  SlidersIcon,
  RefreshIcon
} from './components/icons';

const TONES_BY_TYPE: Record<ContentType, { id: string; label: string }[]> = {
  [ContentType.Story]: [
    { id: 'plot-twist', label: 'Plot Twist' },
    { id: 'sci-fi', label: 'Sci-Fi' },
    { id: 'whimsical', label: 'Whimsical' },
    { id: 'mystery', label: 'Mystery' },
    { id: 'heartwarming', label: 'Heartwarming' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
  ],
  [ContentType.Joke]: [
    { id: 'one-liner', label: 'One-Liner' },
    { id: 'witty', label: 'Witty' },
    { id: 'tech', label: 'Tech & Code' },
    { id: 'dad-joke', label: 'Dad Joke' },
    { id: 'pun', label: 'Pun' },
    { id: 'absurd', label: 'Absurd' },
  ],
  [ContentType.Quote]: [
    { id: 'stoic', label: 'Stoic' },
    { id: 'wisdom', label: 'Deep Wisdom' },
    { id: 'ambition', label: 'Ambition' },
    { id: 'creativity', label: 'Creativity' },
    { id: 'resilience', label: 'Resilience' },
    { id: 'futuristic', label: 'Future Horizons' },
  ],
};

const App: React.FC = () => {
  // Perpetual Dynamic Year calculation
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Application States
  const [contentType, setContentType] = useState<ContentType>(ContentType.Story);
  const [selectedTone, setSelectedTone] = useState<string>('plot-twist');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Theme state: 'system' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('apple_generator_theme') as ThemeMode) || 'system';
  });

  // Settings & Custom API Key
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('apple_gemini_api_key') || '';
  });
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');

  // Share Card Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // History & Favorites state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('apple_generator_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyTab, setHistoryTab] = useState<'all' | 'favorites'>('all');

  // Daily Featured Item
  const [dailyFeature, setDailyFeature] = useState<DailyFeature | null>(null);

  // Update default tone when content type changes
  useEffect(() => {
    const defaultTone = TONES_BY_TYPE[contentType][0].id;
    setSelectedTone(defaultTone);
  }, [contentType]);

  // Load Daily Featured Content on mount
  useEffect(() => {
    setDailyFeature(getDailyFeaturedContent());
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apple_generator_history', JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history to localStorage", e);
    }
  }, [history]);

  // Handle Theme switching and system synchronization
  useEffect(() => {
    localStorage.setItem('apple_generator_theme', themeMode);
    const applyTheme = () => {
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', themeMode);
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Speech synthesis stop on unmount or content change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Main Generation Handler
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCopied(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const content = await generateContent(contentType, {
        tone: selectedTone,
        customTopic: customTopic.trim() || undefined,
        currentYear,
        apiKey: userApiKey,
      });

      setCurrentContent(content);

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: contentType,
        content: content,
        timestamp: Date.now(),
        tone: selectedTone,
        year: currentYear,
        isFavorite: false,
      };

      setHistory(prev => [newItem, ...prev.filter(item => item.content !== content)].slice(0, 25));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [contentType, selectedTone, customTopic, currentYear, userApiKey]);

  // Copy to clipboard
  const handleCopy = useCallback(async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Siri-like Speech Synthesis (Read Aloud)
  const handleSpeak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  // Toggle Favorite
  const handleToggleFavorite = useCallback((id: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  }, []);

  // Clear History
  const handleClearHistory = useCallback(() => {
    if (confirm("Clear all generation history?")) {
      setHistory([]);
    }
  }, []);

  // Filtered history list
  const filteredHistory = useMemo(() => {
    if (historyTab === 'favorites') {
      return history.filter(item => item.isFavorite);
    }
    return history;
  }, [history, historyTab]);

  // Save custom API key
  const handleSaveApiKey = useCallback(() => {
    const trimmed = tempApiKey.trim();
    setUserApiKey(trimmed);
    localStorage.setItem('apple_gemini_api_key', trimmed);
    setShowSettingsModal(false);
  }, [tempApiKey]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Dynamic Multi-layer Liquid Glass Living Mesh Backdrop */}
      <div className="apple-living-backdrop" aria-hidden="true" />

      {/* Floating Cupertino Navigation Bar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 apple-glass !rounded-none !border-x-0 !border-t-0 mb-6 sm:mb-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight">Inspiration Studio</h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {currentYear}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 hidden sm:block">
                Story, Joke & Quote Generator • Apple Liquid Glass Edition
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Pill */}
            <div className="apple-segmented-group !p-1 text-xs">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-full transition-all ${themeMode === 'light' ? 'bg-white dark:bg-white/20 shadow-sm text-amber-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                title="Light Mode"
              >
                <SunIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded-full transition-all ${themeMode === 'system' ? 'bg-white dark:bg-white/20 shadow-sm text-blue-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                title="System Auto"
              >
                <SystemThemeIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-full transition-all ${themeMode === 'dark' ? 'bg-white dark:bg-white/20 shadow-sm text-indigo-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                title="Dark Mode"
              >
                <MoonIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => {
                setTempApiKey(userApiKey);
                setShowSettingsModal(true);
              }}
              className="p-2 rounded-full apple-btn-secondary apple-button-interactive"
              title="API Key & Engine Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Dynamic Daily Featured Inspiration Card */}
        {dailyFeature && (
          <div className="mb-6 sm:mb-8 apple-glass p-4 sm:p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{dailyFeature.tag}</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Perpetual Daily Rotation
              </span>
            </div>
            <p className="text-sm sm:text-base italic font-normal text-gray-800 dark:text-gray-200">
              {dailyFeature.content}
            </p>
            {dailyFeature.attribution && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1 font-medium">
                — {dailyFeature.attribution}
              </p>
            )}
          </div>
        )}

        {/* Primary Interactive Generator Section */}
        <div className="apple-glass p-6 sm:p-8 rounded-3xl mb-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              What would you like to create?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Select your medium and tone to generate captivating stories, witty humor, and profound quotes.
            </p>
          </div>

          {/* Cupertino Segmented Control (Story / Joke / Quote) */}
          <div className="flex justify-center mb-6">
            <div className="apple-segmented-group w-full max-w-md grid grid-cols-3">
              <button
                type="button"
                onClick={() => setContentType(ContentType.Story)}
                className={`apple-segment-item apple-button-interactive ${contentType === ContentType.Story ? 'active' : ''}`}
              >
                <StoryIcon className="w-4 h-4" />
                <span>Story</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType(ContentType.Joke)}
                className={`apple-segment-item apple-button-interactive ${contentType === ContentType.Joke ? 'active' : ''}`}
              >
                <JokeIcon className="w-4 h-4" />
                <span>Joke</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType(ContentType.Quote)}
                className={`apple-segment-item apple-button-interactive ${contentType === ContentType.Quote ? 'active' : ''}`}
              >
                <QuoteIcon className="w-4 h-4" />
                <span>Quote</span>
              </button>
            </div>
          </div>

          {/* Tone Filter Capsules */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Aesthetic Tone & Style
              </span>
              <button
                type="button"
                onClick={() => setShowAdvanced(prev => !prev)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <SlidersIcon className="w-3 h-3" />
                {showAdvanced ? "Hide Prompt Refinement" : "Custom Topic / Prompt"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {TONES_BY_TYPE[contentType].map(tone => {
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all apple-button-interactive border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                        : 'bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    {tone.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Custom Topic Refinement */}
          {showAdvanced && (
            <div className="mb-6 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 apple-animate-spring">
              <label htmlFor="custom-topic" className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Optional Topic, Keyword or Subject (e.g. "Mars expedition", "Coffee addiction", "Stoic resilience")
              </label>
              <input
                id="custom-topic"
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Enter subject or theme..."
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className={`apple-btn-prominent apple-button-interactive px-8 py-3.5 flex items-center gap-2.5 text-base shadow-lg ${
                isLoading ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshIcon className="w-5 h-5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
                </>
              )}
            </button>
          </div>

          {/* Display Output Card */}
          <section className="relative min-h-[160px] rounded-2xl p-6 sm:p-7 bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10 shadow-inner flex flex-col justify-between">
            {isLoading && (
              <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-gray-800 max-w-xs">
                  <div className="w-full h-full apple-shimmer-glow rounded-full" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Crafting a refined {contentType} for {currentYear}...
                </p>
              </div>
            )}

            {error && !isLoading && (
              <div className="my-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <p className="font-semibold mb-1">Notice</p>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && currentContent && (
              <div className="apple-animate-spring">
                <div className="text-base sm:text-lg leading-relaxed font-normal text-gray-900 dark:text-gray-100 whitespace-pre-line mb-6">
                  {currentContent}
                </div>

                {/* Card Action Controls (Speak, Copy, Favorite, Share) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    {/* Read Aloud Voice Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentContent)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 apple-button-interactive border ${
                        isSpeaking
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'apple-btn-secondary'
                      }`}
                      title={isSpeaking ? "Stop listening" : "Listen (Siri Natural Voice)"}
                    >
                      {isSpeaking ? (
                        <>
                          <StopIcon className="w-3.5 h-3.5" />
                          <span>Stop</span>
                          <span className="apple-equalizer ml-1">
                            <span className="apple-eq-bar" />
                            <span className="apple-eq-bar" />
                            <span className="apple-eq-bar" />
                          </span>
                        </>
                      ) : (
                        <>
                          <VolumeIcon className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(currentContent)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 apple-btn-secondary apple-button-interactive"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Share Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-full apple-btn-secondary apple-button-interactive"
                      title="Share Card Preview"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && !currentContent && (
              <div className="my-auto py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Choose your style above and click Generate to begin.</p>
              </div>
            )}
          </section>
        </div>

        {/* History & Favorites Section */}
        {history.length > 0 && (
          <div className="apple-glass p-6 sm:p-8 rounded-3xl shadow-lg mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold tracking-tight">Recent Inspirations</h3>
                <div className="apple-segmented-group !p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setHistoryTab('all')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      historyTab === 'all' ? 'bg-white dark:bg-white/20 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}
                  >
                    All ({history.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('favorites')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      historyTab === 'favorites' ? 'bg-white dark:bg-white/20 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}
                  >
                    Favorites ({history.filter(h => h.isFavorite).length})
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                title="Clear history"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:border-blue-400/30 transition-all flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.type === ContentType.Story && <StoryIcon className="w-4 h-4" />}
                    {item.type === ContentType.Joke && <JokeIcon className="w-4 h-4" />}
                    {item.type === ContentType.Quote && <QuoteIcon className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        {item.type}
                      </span>
                      {item.tone && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                          {item.tone}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 mb-2 font-normal">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.content)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <CopyIcon className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.content)}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <VolumeIcon className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(item.id)}
                        className={`text-xs ml-auto flex items-center gap-1 font-medium ${
                          item.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <HeartIcon className="w-3.5 h-3.5" filled={item.isFavorite} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <p className="text-center py-8 text-sm text-gray-400">
                  {historyTab === 'favorites' ? "No favorite items bookmarked yet." : "No history recorded."}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Perpetual Footer */}
        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-6 border-t border-black/5 dark:border-white/10">
          <p className="font-semibold mb-1">
            © 2024–{currentYear} Story • Joke • Quote Generator
          </p>
          <p className="text-[11px] opacity-75">
            Engineered with Apple HIG, Liquid Glass materials, and Gemini 2.5 Flash intelligence.
          </p>
        </footer>
      </main>

      {/* Settings Modal (API Key & Engine Selection) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="apple-glass max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/80 dark:border-white/15 apple-animate-spring">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                <KeyIcon className="w-5 h-5 text-blue-500" />
                <span>Engine & API Settings</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              By default, this application uses a rich built-in curation engine that operates smoothly without any API key. If you want live, real-time Gemini generation on custom topics, you can enter your Gemini API key below.
            </p>

            <div className="mb-4">
              <label htmlFor="modal-api-key" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Gemini API Key
              </label>
              <input
                id="modal-api-key"
                type="password"
                value={tempApiKey}
                onChange={e => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Saved securely in your browser's LocalStorage. Never shared.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold apple-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-full text-xs font-semibold apple-btn-prominent"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Bento Card Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="apple-glass max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/80 dark:border-white/15 apple-animate-spring">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-base flex items-center gap-2">
                <ShareIcon className="w-4 h-4 text-blue-500" />
                Apple Bento Card Preview
              </span>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Aesthetic Bento Preview Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl mb-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-4 opacity-80">
                <span>Inspiration Studio • {currentYear}</span>
                <span className="capitalize">{contentType}</span>
              </div>
              <p className="text-base sm:text-lg font-medium leading-relaxed mb-4">
                {currentContent}
              </p>
              <div className="text-[11px] opacity-75 text-right">
                Curated for {currentYear} & Beyond
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopy(`${currentContent}\n\n— Created with Inspiration Studio (${currentYear})`);
                  setShowShareModal(false);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold apple-btn-prominent w-full"
              >
                Copy Shareable Card Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
