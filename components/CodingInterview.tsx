'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Question, Answer, InterviewConfig } from '@/types/interview';
import { Play, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodingInterviewProps {
  config: InterviewConfig;
  questions: Question[];
  onAnswer: (answer: Answer) => void;
  onComplete: () => void;
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
}

export default function CodingInterview({
  config,
  questions,
  onAnswer,
  onComplete,
}: CodingInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Set default code template
    const template = getCodeTemplate(language);
    setCode(template);
  }, [currentQuestionIndex, language]);

  const getCodeTemplate = (lang: string) => {
    if (lang === 'javascript') {
      return `// Solve the problem here\nfunction solution() {\n  // Your code here\n  \n}\n\n// Test your solution\nconsole.log(solution());`;
    } else if (lang === 'python') {
      return `# Solve the problem here\ndef solution():\n    # Your code here\n    pass\n\n# Test your solution\nprint(solution())`;
    } else if (lang === 'java') {
      return `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        \n    }\n}`;
    }
    return '';
  };

  const runCode = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: currentQuestion.testCases,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.results);
        const passedCount = data.results.filter((r: TestResult) => r.passed).length;
        toast.success(`${passedCount}/${data.results.length} test cases passed`);
      } else {
        toast.error(data.error || 'Failed to execute code');
      }
    } catch (error) {
      toast.error('Error running code');
      console.error('Code execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('Please write some code');
      return;
    }

    const answerData: Answer = {
      questionId: currentQuestion.id,
      answer: 'Code submitted',
      code: code,
      timestamp: new Date(),
    };

    onAnswer(answerData);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCode('');
      setTestResults([]);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Problem {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <p className="text-sm text-gray-500">
              {currentQuestion.topic} · {currentQuestion.difficulty}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r bg-white overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Problem Statement
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {currentQuestion.question}
            </p>

            {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Examples</h4>
                {currentQuestion.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((testCase, idx) => (
                    <div key={idx} className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Example {idx + 1}:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Input:
                          </span>
                          <pre className="text-sm text-gray-800 mt-1 bg-white p-2 rounded">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Output:
                          </span>
                          <pre className="text-sm text-gray-800 mt-1 bg-white p-2 rounded">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {currentQuestion.constraints && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Constraints</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {currentQuestion.constraints.map((constraint, idx) => (
                    <li key={idx} className="text-sm">
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t bg-white p-4 max-h-48 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-3">Test Results</h4>
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      result.passed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.passed ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        Test Case {idx + 1}
                      </span>
                    </div>
                    {!result.passed && (
                      <div className="text-xs space-y-1 text-gray-700">
                        <p>Input: {result.input}</p>
                        <p>Expected: {result.expectedOutput}</p>
                        <p>Got: {result.actualOutput}</p>
                        {result.error && <p className="text-red-600">{result.error}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white border-t p-4 flex gap-3">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Submit & Next'
                : 'Submit & Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
