'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  InterviewConfig,
  Question,
  Answer,
  InterviewSession,
  OverallEvaluation,
} from '@/types/interview';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import InterviewConfigurator from '@/components/InterviewConfigurator';
import VerbalInterview from '@/components/VerbalInterview';
import CodingInterview from '@/components/CodingInterview';
import InterviewFeedback from '@/components/InterviewFeedback';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

type InterviewStage = 'config' | 'loading' | 'interview' | 'evaluating' | 'feedback';

export default function InterviewPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  
  const [stage, setStage] = useState<InterviewStage>('config');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [overallEvaluation, setOverallEvaluation] = useState<OverallEvaluation | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleConfigComplete = async (interviewConfig: InterviewConfig) => {
    setConfig(interviewConfig);
    setStage('loading');

    try {
      // Generate questions using AI
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: interviewConfig }),
      });

      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);

        // Create session in Firestore
        const session: InterviewSession = {
          id: `session_${Date.now()}`,
          userId: user!.uid,
          config: interviewConfig,
          questions: data.questions,
          answers: [],
          startTime: new Date(),
          status: 'in-progress',
        };

        await setDoc(doc(db, 'interviews', session.id), session);
        setSessionId(session.id);
        setStage('interview');
      } else {
        toast.error('Failed to generate questions');
        setStage('config');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
      setStage('config');
    }
  };

  const handleAnswer = async (answer: Answer) => {
    try {
      // Evaluate answer using AI
      const question = questions.find((q) => q.id === answer.questionId);
      
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, question }),
      });

      const data = await response.json();

      if (data.success) {
        answer.evaluation = data.evaluation;
      }

      const updatedAnswers = [...answers, answer];
      setAnswers(updatedAnswers);

      // Update session in Firestore
      await updateDoc(doc(db, 'interviews', sessionId), {
        answers: updatedAnswers,
      });
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setAnswers([...answers, answer]);
    }
  };

  const handleInterviewComplete = async () => {
    setStage('evaluating');

    try {
      // Generate overall evaluation
      const response = await fetch('/api/overall-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, questions }),
      });

      const data = await response.json();

      if (data.success) {
        setOverallEvaluation(data.evaluation);

        // Update session in Firestore
        await updateDoc(doc(db, 'interviews', sessionId), {
          overallEvaluation: data.evaluation,
          endTime: new Date(),
          status: 'completed',
        });

        // Update user profile with session ID
        await updateDoc(doc(db, 'users', user!.uid), {
          interviewHistory: arrayUnion(sessionId),
        });

        setStage('feedback');
      } else {
        toast.error('Failed to generate evaluation');
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  const handleStartNew = () => {
    setStage('config');
    setConfig(null);
    setQuestions([]);
    setAnswers([]);
    setSessionId('');
    setOverallEvaluation(null);
  };

  const handleViewHistory = () => {
    router.push('/dashboard');
  };

  if (stage === 'config') {
    return <InterviewConfigurator onComplete={handleConfigComplete} />;
  }

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Generating your personalized interview...</p>
        </div>
      </div>
    );
  }

  if (stage === 'interview' && config) {
    return config.format === 'verbal' ? (
      <VerbalInterview
        config={config}
        questions={questions}
        onAnswer={handleAnswer}
        onComplete={handleInterviewComplete}
      />
    ) : (
      <CodingInterview
        config={config}
        questions={questions}
        onAnswer={handleAnswer}
        onComplete={handleInterviewComplete}
      />
    );
  }

  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (stage === 'feedback' && overallEvaluation) {
    return (
      <InterviewFeedback
        evaluation={overallEvaluation}
        onStartNew={handleStartNew}
        onViewHistory={handleViewHistory}
      />
    );
  }

  return null;
}
