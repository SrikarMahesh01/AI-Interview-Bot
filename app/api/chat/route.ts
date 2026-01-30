import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }

    // Generate AI response using Firebase AI with Gemini Developer API
    const aiResponse = await generateAIContent(
      `You are PrepMind, an intelligent AI assistant specializing in interview preparation and career guidance.

User Query: ${message}

Instructions:
- Provide helpful, detailed, and professional responses
- If asked about interview preparation, offer specific advice, tips, examples, and best practices
- If asked about technical topics, provide clear explanations with examples
- Be conversational, supportive, and encouraging
- Format your response clearly with proper paragraphs and bullet points where appropriate
- Keep responses concise but comprehensive (aim for 200-400 words unless more detail is needed)

Respond to the user's query now:`,
      {
        temperature: 0.8,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      }
    );

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Provide more specific error messages
    const errorMessage = error?.message || 'Failed to generate response';
    const isRateLimitError = errorMessage.includes('quota') || errorMessage.includes('rate limit');
    const isAuthError = errorMessage.includes('auth') || errorMessage.includes('API key');
    
    return NextResponse.json(
      { 
        error: isRateLimitError 
          ? 'API rate limit exceeded. Please try again in a moment.'
          : isAuthError
          ? 'Authentication error. Please check your configuration.'
          : 'Failed to generate response. Please try again.',
        success: false
      },
      { status: 500 }
    );
  }
}
