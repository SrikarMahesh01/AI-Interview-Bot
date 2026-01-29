import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/firebase';
import { Answer, Question } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const { answer, question }: { answer: Answer; question: Question } =
      await req.json();

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question.question}
Topic: ${question.topic}
Difficulty: ${question.difficulty}
Type: ${question.type}

${question.type === 'verbal' ? `Candidate's Answer: ${answer.answer}` : `Candidate's Code:\n${answer.code}`}

${
  question.expectedAnswer
    ? `Expected Answer Outline: ${question.expectedAnswer}`
    : ''
}

Evaluate the response and provide:
1. A score out of 100
2. Detailed feedback (2-3 sentences)
3. 2-3 specific strengths
4. 2-3 specific weaknesses or areas for improvement
5. 2-3 actionable suggestions

${
  question.type === 'coding'
    ? 'For code: Evaluate correctness, efficiency, readability, and best practices.'
    : 'For verbal: Evaluate clarity, depth of understanding, communication, and completeness.'
}

Return ONLY a valid JSON object in this exact format:
{
  "score": 85,
  "feedback": "detailed feedback text",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const text = await generateAIContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 1000,
    });

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const evaluation = JSON.parse(jsonText);

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
