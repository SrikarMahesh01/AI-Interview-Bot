import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/firebase';
import { Answer, Question, OverallEvaluation } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const {
      answers,
      questions,
    }: { answers: Answer[]; questions: Question[] } = await req.json();

    // Prepare evaluation data
    const qaData = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return {
        question: question?.question,
        topic: question?.topic,
        answer: answer.answer,
        code: answer.code,
        score: answer.evaluation?.score || 0,
      };
    });

    const prompt = `You are an expert technical interviewer providing final interview feedback.

Interview Data:
${JSON.stringify(qaData, null, 2)}

Provide a comprehensive overall evaluation including:
1. Overall score (weighted average, out of 100)
2. Topic-wise scores (for each unique topic)
3. 3-5 key strengths across all answers
4. 3-5 key weaknesses or areas for improvement
5. 5-7 specific, actionable recommendations for skill development
6. A detailed performance summary (3-4 sentences)

Return ONLY a valid JSON object in this exact format:
{
  "overallScore": 85,
  "topicWiseScores": {
    "Topic Name": 90,
    "Another Topic": 80
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4", "rec 5"],
  "performanceSummary": "detailed summary text"
}`;

    const text = await generateAIContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2000,
    });

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const evaluation: OverallEvaluation = JSON.parse(jsonText);

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error generating overall evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate evaluation' },
      { status: 500 }
    );
  }
}
