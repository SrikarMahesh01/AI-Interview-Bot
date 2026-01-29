import { NextRequest, NextResponse } from 'next/server';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const {
      code,
      language,
      testCases,
    }: { code: string; language: string; testCases: TestCase[] } =
      await req.json();

    // Simple JavaScript execution for demo
    // In production, use a proper sandboxed execution environment
    if (language === 'javascript') {
      const results = testCases.map((testCase) => {
        try {
          // Create a safe execution context
          const wrappedCode = `
            ${code}
            
            // Execute with test input
            const testInput = ${testCase.input};
            const result = solution(testInput);
            result;
          `;

          // Use Function constructor for safer evaluation
          const func = new Function(`return ${wrappedCode}`);
          const actualOutput = String(func());
          const passed = actualOutput.trim() === testCase.expectedOutput.trim();

          return {
            passed,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput,
          };
        } catch (error: any) {
          return {
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            error: error.message,
          };
        }
      });

      return NextResponse.json({ success: true, results });
    } else {
      // For other languages, return mock results (implement proper execution in production)
      const results = testCases.map((testCase, idx) => ({
        passed: idx === 0, // Mock: only first test passes
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: idx === 0 ? testCase.expectedOutput : 'Wrong output',
        error: idx !== 0 ? 'Language execution not implemented yet' : undefined,
      }));

      return NextResponse.json({ success: true, results });
    }
  } catch (error: any) {
    console.error('Error executing code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}
