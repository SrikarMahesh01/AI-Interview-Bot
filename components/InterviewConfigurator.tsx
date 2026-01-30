'use client';

import { useState, useRef, useEffect } from 'react';
import { InterviewConfig, DifficultyLevel, InterviewFormat } from '@/types/interview';
import { DIFFICULTY_LEVELS, INTERVIEW_FORMATS } from '@/lib/constants';
import { ArrowRight, Check, Mic, MicOff } from 'lucide-react';

interface ConfiguratorProps {
  onComplete: (config: InterviewConfig) => void;
  initialDomain?: string;
}

export default function InterviewConfigurator({ onComplete, initialDomain = '' }: ConfiguratorProps) {
  const [step, setStep] = useState(1);
  const [customDomain, setCustomDomain] = useState(initialDomain);
  const [isListening, setIsListening] = useState(false);
  const [interviewType, setInterviewType] = useState<'specific' | 'general'>('general');
  const [specificArea, setSpecificArea] = useState('');
  const [isListeningSpecificArea, setIsListeningSpecificArea] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [selectedFormat, setSelectedFormat] = useState<InterviewFormat>('verbal');
  
  const recognitionRef = useRef<any>(null);
  const specificAreaRecognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if available
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCustomDomain(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Initialize for specific area
      specificAreaRecognitionRef.current = new SpeechRecognition();
      specificAreaRecognitionRef.current.continuous = false;
      specificAreaRecognitionRef.current.interimResults = false;
      specificAreaRecognitionRef.current.lang = 'en-US';

      specificAreaRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpecificArea(transcript);
        setIsListeningSpecificArea(false);
      };

      specificAreaRecognitionRef.current.onerror = () => {
        setIsListeningSpecificArea(false);
      };

      specificAreaRecognitionRef.current.onend = () => {
        setIsListeningSpecificArea(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (specificAreaRecognitionRef.current) {
        specificAreaRecognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const toggleSpecificAreaVoiceInput = () => {
    if (isListeningSpecificArea) {
      specificAreaRecognitionRef.current?.stop();
      setIsListeningSpecificArea(false);
    } else {
      setIsListeningSpecificArea(true);
      specificAreaRecognitionRef.current?.start();
    }
  };

  const handleNext = () => {
    if (step === 1 && customDomain.trim()) {
      setStep(2);
    } else if (step === 2 && (interviewType === 'general' || specificArea.trim())) {
      setStep(3);
    } else if (step === 3 && selectedDifficulty) {
      setStep(4);
    }
  };

  const handleStart = () => {
    const config: InterviewConfig = {
      domain: customDomain,
      difficulty: selectedDifficulty,
      topics: interviewType === 'specific' ? [specificArea] : [customDomain],
      format: selectedFormat,
      interactionMode: selectedFormat === 'verbal' ? 'text' : undefined,
      duration: 30,
      interviewType,
      customDomain,
      specificArea: interviewType === 'specific' ? specificArea : undefined,
    };
    onComplete(config);
  };

  const canProceed = () => {
    if (step === 1) return customDomain.trim() !== '';
    if (step === 2) return interviewType === 'general' || specificArea.trim() !== '';
    if (step === 3) return selectedDifficulty !== '';
    if (step === 4) return selectedFormat !== '';
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s !== 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s !== 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Enter Your Domain'}
              {step === 2 && 'Interview Type'}
              {step === 3 && 'Choose Difficulty'}
              {step === 4 && 'Interview Format'}
            </h2>
          </div>
        </div>

        {/* Step 1: Custom Domain Input */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What domain would you like to be interviewed on?
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Type or speak the domain (e.g., "Python Programming", "React Development", "Machine Learning")
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="Enter domain name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 pr-12"
                />
                <button
                  onClick={toggleVoiceInput}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isListening && (
                <p className="text-sm text-red-500 mt-2 animate-pulse">
                  Listening... Speak now
                </p>
              )}
            </div>

            {/* Examples */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Examples:</p>
              <div className="flex flex-wrap gap-2">
                {['Data Structures', 'Python Programming', 'React.js', 'System Design', 'Machine Learning', 'Web Development'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setCustomDomain(example)}
                    className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Interview Type Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Would you like a general interview or focused on a specific area?
              </label>
              
              <div className="space-y-4">
                <button
                  onClick={() => setInterviewType('general')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    interviewType === 'general'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    General Interview
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cover broad topics across {customDomain}
                  </p>
                </button>

                <button
                  onClick={() => setInterviewType('specific')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    interviewType === 'specific'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Specific Area
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Focus on a particular topic or concept
                  </p>
                </button>
              </div>
            </div>

            {/* Specific Area Input */}
            {interviewType === 'specific' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What specific area would you like to focus on?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={specificArea}
                    onChange={(e) => setSpecificArea(e.target.value)}
                    placeholder="e.g., Recursion, Hooks, Neural Networks..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 pr-12"
                  />
                  <button
                    onClick={toggleSpecificAreaVoiceInput}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      isListeningSpecificArea
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isListeningSpecificArea ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListeningSpecificArea ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isListeningSpecificArea && (
                  <p className="text-sm text-red-500 mt-2 animate-pulse">
                    Listening... Speak now
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Difficulty Level */}
        {step === 3 && (
          <div className="space-y-4">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedDifficulty(level.id as DifficultyLevel)}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  selectedDifficulty === level.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {level.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Interview Format */}
        {step === 4 && (
          <div className="space-y-4">
            {INTERVIEW_FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id as InterviewFormat)}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  selectedFormat === format.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{format.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!canProceed()}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
