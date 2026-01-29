'use client';

import { useState, useEffect, useRef } from 'react';
import { Question, Answer, InterviewConfig } from '@/types/interview';
import { Mic, MicOff, Volume2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface VerbalInterviewProps {
  config: InterviewConfig;
  questions: Question[];
  onAnswer: (answer: Answer) => void;
  onComplete: () => void;
}

export default function VerbalInterview({
  config,
  questions,
  onAnswer,
  onComplete,
}: VerbalInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Initialize speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
          if (finalTranscript) {
            setAnswer((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
      }
    }

    // Speak first question
    if (currentQuestionIndex === 0) {
      speakQuestion(questions[0].question);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakQuestion = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answerData: Answer = {
      questionId: currentQuestion.id,
      answer: answer.trim(),
      timestamp: new Date(),
    };

    onAnswer(answerData);
    setAnswer('');
    setTranscript('');

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      speakQuestion(questions[nextIndex].question);
    } else {
      onComplete();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">
                {currentQuestion.topic} · {currentQuestion.difficulty}
              </p>
              <p className="text-lg text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
            <button
              onClick={() => speakQuestion(currentQuestion.question)}
              disabled={isSpeaking}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Replay question"
            >
              <Volume2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] resize-none"
            placeholder="Type your answer here or use voice input..."
          />
          {transcript && (
            <p className="text-sm text-blue-600 mt-2">
              Listening: {transcript}
            </p>
          )}
        </div>

        {/* Voice Controls */}
        {config.interactionMode === 'speech' && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={toggleRecording}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Voice Input
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {currentQuestionIndex < questions.length - 1
              ? 'Next Question'
              : 'Complete Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
