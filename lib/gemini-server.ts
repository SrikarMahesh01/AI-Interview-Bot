// Server-side only Gemini AI integration
// This file should only be imported in API routes (server-side)

import app from './firebase';
import { getAI, getGenerativeModel, VertexAIBackend } from 'firebase/ai';

// Initialize Vertex AI
const ai = getAI(app, {
  backend: new VertexAIBackend({
    location: 'us-central1',
  }),
});

// Helper function to get a generative model
export const getGeminiModel = (modelName: string = 'gemini-2.0-flash-exp') => {
  return getGenerativeModel(ai, { model: modelName });
};

// Helper function to generate AI content
export async function generateAIContent(
  prompt: string,
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    model?: string;
  }
) {
  try {
    const model = getGeminiModel(config?.model);
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxOutputTokens ?? 2048,
        topP: config?.topP ?? 0.95,
        topK: config?.topK ?? 40,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Vertex AI Error:', error);
    throw new Error('Failed to generate AI content');
  }
}

// Helper function to generate streaming AI content
export async function* generateStreamingContent(
  prompt: string,
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    model?: string;
  }
) {
  try {
    const model = getGeminiModel(config?.model);
    
    const result = await model.generateContentStream({
      contents: [{ 
        role: 'user', 
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxOutputTokens ?? 2048,
        topP: config?.topP ?? 0.95,
        topK: config?.topK ?? 40,
      },
    });
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error('Vertex AI Streaming Error:', error);
    throw new Error('Failed to generate streaming content');
  }
}
