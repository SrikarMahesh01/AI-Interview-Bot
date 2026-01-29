import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/firebase';
import { InterviewConfig, Question } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const { config }: { config: InterviewConfig } = await req.json();

    const model = getGeminiModel();

    const prompt = `You are an expert technical interviewer. Generate ${
      config.format === 'verbal' ? '5' : '3'
    } interview questions based on the following configuration:

Domain: ${config.domain}
Difficulty: ${config.difficulty}
Topics: ${config.topics.join(', ')}
Format: ${config.format}

For ${config.format === 'verbal' ? 'verbal/conceptual' : 'coding'} questions:
${
  config.format === 'verbal'
    ? '- Focus on theoretical understanding, problem-solving approach, and conceptual knowledge\n- Include scenario-based and experience-based questions\n- Questions should assess deep understanding'
    : '- Provide clear problem statements with examples\n- Include at least 2 test cases for each problem (1 visible, 1+ hidden)\n- Add constraints and edge cases\n- Problems should be practical and test coding skills'
}

Return ONLY a valid JSON array of questions in this exact format:
[
  {
    "id": "unique-id",
    "question": "the question text",
    "type": "${config.format}",
    "difficulty": "${config.difficulty}",
    "topic": "specific topic from the list",
    ${
      config.format === 'coding'
        ? `"testCases": [
      {"input": "test input", "expectedOutput": "expected output", "isHidden": false},
      {"input": "test input 2", "expectedOutput": "expected output 2", "isHidden": true}
    ],
    "constraints": ["constraint 1", "constraint 2"]`
        : '"expectedAnswer": "brief expected answer outline"'
    }
  }
]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const questions: Question[] = JSON.parse(jsonText);

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
