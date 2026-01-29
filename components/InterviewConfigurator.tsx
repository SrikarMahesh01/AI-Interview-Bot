'use client';

import { useState } from 'react';
import { InterviewConfig, DifficultyLevel, InterviewFormat } from '@/types/interview';
import { DOMAINS, DIFFICULTY_LEVELS, INTERVIEW_FORMATS } from '@/lib/constants';
import { ArrowRight, Check } from 'lucide-react';

interface ConfiguratorProps {
  onComplete: (config: InterviewConfig) => void;
}

export default function InterviewConfigurator({ onComplete }: ConfiguratorProps) {
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<InterviewFormat>('verbal');

  const currentDomain = DOMAINS.find((d) => d.id === selectedDomain);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedDomain) {
      setStep(2);
    } else if (step === 2 && selectedDifficulty) {
      setStep(3);
    } else if (step === 3 && selectedTopics.length > 0) {
      setStep(4);
    }
  };

  const handleStart = () => {
    const config: InterviewConfig = {
      domain: selectedDomain,
      difficulty: selectedDifficulty,
      topics: selectedTopics,
      format: selectedFormat,
      interactionMode: selectedFormat === 'verbal' ? 'text' : undefined,
      duration: 30,
    };
    onComplete(config);
  };

  const canProceed = () => {
    if (step === 1) return selectedDomain !== '';
    if (step === 2) return selectedDifficulty !== '';
    if (step === 3) return selectedTopics.length > 0;
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
              {step === 1 && 'Select Domain'}
              {step === 2 && 'Choose Difficulty'}
              {step === 3 && 'Pick Topics'}
              {step === 4 && 'Interview Format'}
            </h2>
          </div>
        </div>

        {/* Step 1: Domain Selection */}
        {step === 1 && (
          <div className="space-y-4">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  selectedDomain === domain.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {domain.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {domain.topics.length} topics available
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Difficulty Level */}
        {step === 2 && (
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

        {/* Step 3: Topic Selection */}
        {step === 3 && currentDomain && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Select at least one topic (you can select multiple)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {currentDomain.topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTopics.includes(topic)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {topic}
                    </span>
                    {selectedTopics.includes(topic) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
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
