
import { GoogleGenAI } from "@google/genai";
import { ContentType } from '../types';

const getPrompt = (contentType: ContentType): string => {
  switch (contentType) {
    case ContentType.Story:
      return "Write a very short story, about 3-4 sentences long, with a surprising or thought-provoking ending.";
    case ContentType.Joke:
      return "Tell me a clever one-liner joke. It should be safe for all audiences.";
    case ContentType.Quote:
      return "Generate a single, powerful motivational quote that is original and insightful.";
    default:
      throw new Error("Invalid content type");
  }
};

export const generateContent = async (contentType: ContentType): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = getPrompt(contentType);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content from AI. Please try again.");
  }
};
