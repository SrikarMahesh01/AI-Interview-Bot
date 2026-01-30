'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InterviewSession } from '@/types/interview';
import { ArrowLeft, Calendar, Award, TrendingUp, Target, Clock, BarChart3 } from 'lucide-react';

interface UserAnalyticsProps {
  onBack: () => void;
}

export default function UserAnalytics({ onBack }: UserAnalyticsProps) {
  const { user, userProfile } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      const sessionsRef = collection(db, 'interviews');
      const q = query(
        sessionsRef,
        where('userId', '==', user.uid),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as InterviewSession)
      );
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce(
          (sum, s) => sum + (s.overallEvaluation?.overallScore || 0),
          0
        ) / completedSessions.length
      : 0;

  const thisMonthSessions = sessions.filter(
    (s) => new Date(s.startTime).getMonth() === new Date().getMonth()
  );

  // Calculate domain statistics
  const domainStats: { [key: string]: { count: number; avgScore: number } } = {};
  completedSessions.forEach((session) => {
    const domain = session.config.customDomain || session.config.domain;
    if (!domainStats[domain]) {
      domainStats[domain] = { count: 0, avgScore: 0 };
    }
    domainStats[domain].count++;
    domainStats[domain].avgScore += session.overallEvaluation?.overallScore || 0;
  });

  Object.keys(domainStats).forEach((domain) => {
    domainStats[domain].avgScore = Math.round(
      domainStats[domain].avgScore / domainStats[domain].count
    );
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold shadow-lg">
              <span className="text-black">
                {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Your Analytics
              </h1>
              <p className="text-gray-400">{userProfile?.displayName || user?.email}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 rounded-2xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Interviews</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">{completedSessions.length}</div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-2xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Avg Score</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{Math.round(avgScore)}%</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 rounded-2xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">{thisMonthSessions.length}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 rounded-2xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400">Best Score</span>
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {completedSessions.length > 0
                    ? Math.max(
                        ...completedSessions.map((s) => s.overallEvaluation?.overallScore || 0)
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Domain Performance */}
            {Object.keys(domainStats).length > 0 && (
              <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-300 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold">Performance by Domain</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(domainStats).map(([domain, stats]) => (
                    <div key={domain} className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-200">{domain}</span>
                        <span className="text-sm text-gray-400">{stats.count} interviews</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.avgScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-400">{stats.avgScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              {completedSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No interview history yet</p>
              ) : (
                <div className="space-y-3">
                  {completedSessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#252525] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-200">
                              {session.config.customDomain || session.config.domain}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                              {session.config.difficulty}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.startTime).toLocaleDateString()} •{' '}
                            {session.questions.length} questions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            {Math.round(session.overallEvaluation?.overallScore || 0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
