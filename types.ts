export enum ContentType {
  Story = 'story',
  Joke = 'joke',
  Quote = 'quote',
}

export interface HistoryItem {
  id: string;
  type: ContentType;
  content: string;
  timestamp: number;
}
