import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { 
  Calendar, Clock, TrendingUp, Award, ChevronRight, 
  CheckCircle, Circle, Zap, Flame, BookOpen, 
  Sparkles, Target, Brain, Rocket, BarChart3,
  Activity, Users, MessageCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchDashboardData();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        api.get('/api/users/me/dashboard'),
        api.get('/api/progress/summary')
      ]);
      setStats(statsRes.data);
      setRecentLessons(progressRes.data.completed?.slice(-5) || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakEmoji = () => {
    if (!stats?.streak_days) return '🌱';
    if (stats.streak_days >= 7) return '🔥';
    if (stats.streak_days >= 3) return '⭐';
    return '🌱';
  };

  const getMotivationalMessage = () => {
    const completed = stats?.total_days_completed || 0;
    if (completed === 0) return "Let's start your AI journey today! 🚀";
    if (completed < 10) return "Great start! Keep the momentum going! 💪";
    if (completed < 20) return "You're making excellent progress! 🌟";
    if (completed < 30) return "Almost there! You're doing amazing! 🎯";
    return "You've mastered AI! Time to help others! 🏆";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const currentDay = stats?.current_day || 1;
  const completedCount = stats?.total_days_completed || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">{greeting}</p>
              <h1 className="text-3xl font-bold mb-2">
                {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-sm max-w-md">
                {getMotivationalMessage()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-center">
                <p className="text-2xl font-bold">{completedCount}/30</p>
                <p className="text-xs text-blue-100">Days Complete</p>
              </div>
              <div className="text-5xl">
                {getStreakEmoji()}
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-blue-100">Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{Math.floor((stats?.total_time_saved_minutes || 0) / 60)}h</p>
              <p className="text-xs text-blue-100">Time Saved</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{stats?.streak_days || 0}🔥</p>
              <p className="text-xs text-blue-100">Day Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{Math.round((completedCount / 30) * 100)}%</p>
              <p className="text-xs text-blue-100">Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Lesson Card */}
        <div className="lg:col-span-2">
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 h-full">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-3">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Today's Mission
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Day {currentDay}
                </h2>
                <p className="text-gray-600 mb-4">
                  {completedCount >= 30 
                    ? '🎉 Congratulations! You\'ve completed all 30 days!'
                    : `${30 - completedCount} days remaining in your AI journey`}
                </p>
                {completedCount < 30 && (
               // In the Dashboard component, make sure the "Start Lesson" button uses the correct path
                <button
                onClick={() => navigate('/lesson/today')}
                className="btn-primary inline-flex items-center group"
                >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Lesson
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
                )}
              </div>
              <div className="text-6xl">
                {completedCount >= 30 ? '🏆' : '🚀'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="card flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-blue-600 transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 * (1 - completedCount / 30)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-900">{Math.round((completedCount / 30) * 100)}%</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedCount} of 30 days
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-sm text-gray-600">Lessons Done</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <p className="text-2xl font-bold text-gray-900">{Math.floor((stats?.total_time_saved_minutes || 0) / 60)}h</p>
          <p className="text-sm text-gray-600">Time Saved</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-2xl font-bold text-gray-900">{stats?.streak_days || 0}</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-gray-900">{30 - completedCount}</p>
          <p className="text-sm text-gray-600">Days Left</p>
        </div>
      </div>

      {/* Recent Activity */}
      {recentLessons.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentLessons.map((lesson, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/lesson/${lesson.day}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Day {lesson.day}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(lesson.completed_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {lesson.time_saved && (
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    Saved {lesson.time_saved} min
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}