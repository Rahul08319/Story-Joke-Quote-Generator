import React, { useState, useCallback } from 'react';
import { ContentType, HistoryItem } from './types';
import { generateContent } from './services/geminiService';
import { StoryIcon, JokeIcon, QuoteIcon } from './components/icons';

const App: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.Story);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCurrentContent('');
    try {
      const content = await generateContent(contentType);
      setCurrentContent(content);
      const newItem: HistoryItem = {
        id: new Date().toISOString(),
        type: contentType,
        content: content,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]); // Keep history to 10 items
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [contentType]);

  const getIcon = (type: ContentType) => {
    const style = { marginRight: '12px', flexShrink: 0 };
    switch (type) {
      case ContentType.Story:
        return <StoryIcon style={style} />;
      case ContentType.Joke:
        return <JokeIcon style={style} />;
      case ContentType.Quote:
        return <QuoteIcon style={style} />;
      default:
        return null;
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { fontFamily: 'system-ui, sans-serif', maxWidth: '720px', margin: '0 auto', padding: '2rem' },
    header: { textAlign: 'center', marginBottom: '2rem', color: '#333' },
    controls: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' },
    button: { padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', transition: 'all 0.2s' },
    activeButton: { backgroundColor: '#007bff', color: 'white', borderColor: '#007bff' },
    generateButton: { padding: '12px 24px', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', display: 'block', margin: '2rem auto', transition: 'background-color 0.2s' },
    output: { minHeight: '120px', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9f9f9', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    loading: { textAlign: 'center', fontStyle: 'italic', color: '#888' },
    error: { color: 'red', border: '1px solid #ffc0cb', backgroundColor: '#fff0f1', padding: '1rem', borderRadius: '8px' },
    historySection: { marginTop: '3rem' },
    historyItem: { border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' },
    historyContent: { flex: 1 },
    historyHeader: { display: 'flex', alignItems: 'center', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '0.5rem', color: '#555' },
    historyText: { margin: 0, color: '#333' }
  };

  return (
    <div style={styles.container}>
      <header>
        <h1 style={styles.header}>AI Content Generator</h1>
      </header>
      
      <main>
        <p style={{ textAlign: 'center', color: '#666' }}>Select a content type and click generate!</p>
        <div style={styles.controls}>
          {(Object.values(ContentType)).map(type => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              style={{
                ...styles.button,
                ...(contentType === type ? styles.activeButton : {})
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{...styles.generateButton, ...(isLoading ? { cursor: 'not-allowed', backgroundColor: '#5a6268' } : {})}}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>

        <section style={styles.output}>
          {isLoading && <p style={styles.loading}>Generating content, please wait...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {currentContent && <p>{currentContent}</p>}
          {!isLoading && !error && !currentContent && <p style={{ color: '#aaa' }}>Your generated content will appear here.</p>}
        </section>

        {history.length > 0 && (
          <section style={styles.historySection}>
            <h2>History</h2>
            {history.map(item => (
              <div key={item.id} style={styles.historyItem}>
                {getIcon(item.type)}
                <div style={styles.historyContent}>
                   <div style={styles.historyHeader}>
                    {item.type}
                  </div>
                  <p style={styles.historyText}>{item.content}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
