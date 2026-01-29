'use client';

import { OverallEvaluation } from '@/types/interview';
import { Trophy, TrendingUp, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';

interface FeedbackProps {
  evaluation: OverallEvaluation;
  onStartNew: () => void;
  onViewHistory: () => void;
}

export default function InterviewFeedback({
  evaluation,
  onStartNew,
  onViewHistory,
}: FeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Completed!
            </h1>
            <p className="text-gray-600">Here's your performance summary</p>
          </div>

          <div className="flex justify-center mb-6">
            <div
              className={`${getScoreBgColor(
                evaluation.overallScore
              )} rounded-full w-32 h-32 flex items-center justify-center`}
            >
              <div className="text-center">
                <p className={`text-4xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                  {Math.round(evaluation.overallScore)}
                </p>
                <p className="text-sm text-gray-600">out of 100</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Performance Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {evaluation.performanceSummary}
            </p>
          </div>
        </div>

        {/* Topic-wise Scores */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Topic-wise Performance
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(evaluation.topicWiseScores).map(([topic, score]) => (
              <div key={topic}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{topic}</span>
                  <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                    {Math.round(score)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      score >= 80
                        ? 'bg-green-600'
                        : score >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-3">
              {evaluation.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2" />
                  <span className="text-sm text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Recommendations for Improvement
            </h2>
          </div>
          <ul className="space-y-3">
            {evaluation.recommendations.map((recommendation, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onViewHistory}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            View History
          </button>
          <button
            onClick={onStartNew}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}
