'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InterviewSession } from '@/types/interview';
import { MessageSquare, Menu, X, User, LogOut, Mic, MicOff, Search, BarChart3 } from 'lucide-react';
import UserAnalytics from './UserAnalytics';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userProfile, logout } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update final transcript if we have new final results
        if (newFinalTranscript) {
          setFinalTranscript((prev) => prev + newFinalTranscript);
        }

        // Display both final and interim results in real-time
        setSearchQuery((prev) => {
          // If we have new final results, use the updated final transcript
          const currentFinal = newFinalTranscript ? finalTranscript + newFinalTranscript : finalTranscript;
          return (currentFinal + interimTranscript).trim();
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still listening
          try {
            recognitionRef.current?.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return sessionDate.toLocaleDateString();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setFinalTranscript('');
      setSearchQuery('');
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsGenerating(true);
      setAiResponse('');
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: searchQuery }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        setAiResponse(data.response);
        toast.success('Response generated!');
      } catch (error) {
        console.error('AI Error:', error);
        toast.error('Failed to generate response');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (showAnalytics) {
    return <UserAnalytics onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar Menu - Fixed */}
      <div className="w-64 bg-[#2a2a2a] border-r border-gray-300 flex flex-col">
        {/* Site Name Header */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-lg font-bold text-white">PrepMind</h2>
        </div>

        {/* Previous Interviews */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="text-xs text-gray-500 px-3 py-2 font-semibold">Previous Sessions</div>
          
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : completedSessions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No interviews yet</div>
          ) : (
            <div className="space-y-1">
              {completedSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left px-3 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-all duration-200 group hover:scale-105 transform"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-400 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 truncate">
                        {session.config.customDomain || session.config.domain}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {formatDate(session.startTime)} • <span className="text-green-400">{Math.round(session.overallEvaluation?.overallScore || 0)}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Footer with Popup Menu */}
        <div className="p-4 border-t border-gray-300 relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-full hover:bg-[#1a1a1a] transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="text-black font-bold text-sm">
                  {(userProfile?.displayName || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium truncate">
                  {userProfile?.displayName || user?.email}
                </div>
              </div>
            </div>
          </button>

          {/* User Menu Popup */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#1a1a1a] border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
              <button
                onClick={() => {
                  setShowAnalytics(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              <div className="border-t border-gray-700"></div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
            {/* Main Heading */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold mb-3 text-white">
                What kind of interview do you want?
              </h1>
              <p className="text-gray-400 text-base">
                Choose your domain and start practicing with AI-powered interviews
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <form onSubmit={handleSearch} className="w-full max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter domain (e.g., Python, React, System Design...)"
                    className="w-full bg-[#2a2a2a] text-white pl-11 pr-12 py-3 rounded-full border border-gray-300 focus:border-blue-500 focus:outline-none transition-all text-sm placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {isListening && (
                  <p className="text-xs text-red-400 mt-2 text-center animate-pulse">
                    Listening... Speak your domain now
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Type or speak your query and press Enter
                </p>
              </form>
            </div>

            {/* AI Response Display */}
            {isGenerating && (
              <div className="mt-8 bg-[#2a2a2a] rounded-2xl p-6 border border-gray-300 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div className="text-gray-400">Generating response...</div>
                </div>
              </div>
            )}

            {aiResponse && !isGenerating && (
              <div className="mt-8 bg-[#2a2a2a] rounded-2xl p-6 border border-gray-300">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-2">PrepMind AI</div>
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {aiResponse}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAiResponse('');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-[#1a1a1a] hover:bg-[#3a3a3a] text-gray-300 rounded-full text-sm transition-all duration-200"
                >
                  Clear Response
                </button>
              </div>
            )}

            {/* Quick Stats */}
            {completedSessions.length > 0 && !aiResponse && (
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 rounded-2xl p-6 text-center border border-blue-600/30 hover:border-blue-500/50 transition-all hover:scale-105 transform">
                  <div className="text-3xl font-bold text-blue-400">{completedSessions.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Interviews</div>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-2xl p-6 text-center border border-gray-300 hover:border-green-500/50 transition-all hover:scale-105 transform">
                  <div className="text-3xl font-bold text-green-400">
                    {Math.round(
                      completedSessions.reduce((sum, s) => sum + (s.overallEvaluation?.overallScore || 0), 0) /
                        completedSessions.length
                    )}%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Avg Score</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 rounded-2xl p-6 text-center border border-gray-300 hover:border-purple-500/50 transition-all hover:scale-105 transform">
                  <div className="text-3xl font-bold text-purple-400">
                    {sessions.filter((s) => new Date(s.startTime).getMonth() === new Date().getMonth()).length}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">This Month</div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
