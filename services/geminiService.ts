import { GoogleGenAI } from "@google/genai";
import { FinalAnswer, Source } from '../types';

// Initialize the Gemini AI client
// IMPORTANT: Assumes process.env.API_KEY is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Performs a smart search using the Gemini API with Google Search grounding.
 * @param query The user's search query.
 * @returns A promise that resolves to the final answer and sources.
 */
export const performSmartSearch = async (query: string): Promise<FinalAnswer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    const sources: Source[] = groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web?.uri && web?.title) // Filter out malformed or empty chunks
      .map((web: any) => ({
        title: web.title,
        uri: web.uri,
      })) || [];

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
    
    return {
      text: response.text,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Error performing smart search:", (error as Error).message);
    // Return a user-friendly error message
    return {
      text: "Sorry, I encountered an error while trying to answer your question. Please try again.",
      sources: [],
    };
  }
};