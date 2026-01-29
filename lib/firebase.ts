import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: "AIzaSyAJbA8xL9vOT-NcF94S23M7XqSfrjVZ6aY",
  authDomain: "ai-interview-bot-18.firebaseapp.com",
  projectId: "ai-interview-bot-18",
  storageBucket: "ai-interview-bot-18.firebasestorage.app",
  messagingSenderId: "244323944822",
  appId: "1:244323944822:web:96981b8d489c1d71f2d257"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase AI with Gemini Developer API backend
// This uses Firebase's built-in API key - no separate key needed!
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Get Gemini model
export const getGeminiModel = () => {
  return getGenerativeModel(ai, { model: 'gemini-2.0-flash-exp' });
};

// Helper function to generate AI content
export async function generateAIContent(
  prompt: string,
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }
) {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI content');
  }
}

export default app;
