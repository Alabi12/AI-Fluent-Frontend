import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { 
  Calendar, Clock, TrendingUp, Award, ChevronRight, 
  CheckCircle, Zap, BookOpen, Sparkles, Target, 
  BarChart3, Users, MessageCircle, PieChart,
  ArrowUpRight, ArrowDownRight, Activity, Briefcase
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes] = await Promise.all([
        api.get('/api/users/me/dashboard')
      ]);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyLabel = (specialty) => {
    const labels = {
      accounting: 'Accounting',
      finance: 'Finance',
      audit: 'Audit & Compliance',
      engineering: 'Engineering',
      legal: 'Legal & Contracts',
      hr: 'Human Resources',
      supply_chain: 'Supply Chain & Logistics',
      sales: 'Sales & Business Development',
      marketing: 'Marketing & Communications',
      it: 'IT & Systems Administration',
      operations: 'Operations & Project Management',
      healthcare: 'Healthcare & Clinical Operations',
    };
    return labels[specialty] || specialty;
  };

  const completedCount = stats?.total_days_completed || 0;
  const totalLessons = 30;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {getSpecialtyLabel(user?.specialty)} • 
            <span className="ml-1">Day {stats?.current_day || 1} of 30</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Completion Rate</p>
            <p className="text-lg font-bold text-gray-900">{progressPercentage}%</p>
          </div>
          <button
            onClick={() => navigate('/lesson/today')}
            className="btn-primary flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Continue Learning
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedCount}</p>
              <p className="text-xs text-gray-500">of {totalLessons} total</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor((stats?.total_time_saved_minutes || 0) / 60)}h
              </p>
              <p className="text-xs text-gray-500">{Math.round((stats?.total_time_saved_minutes || 0) % 60)} minutes</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.streak_days || 0} days
              </p>
              <p className="text-xs text-gray-500">Keep going!</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{progressPercentage}%</p>
              <p className="text-xs text-gray-500">{30 - completedCount} days remaining</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Program Progress</span>
          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Fundamental</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['fundamental', 'intermediate', 'expert'].map((level) => {
          const levelData = stats?.level_progress?.[level] || { total: 10, completed: 0, percentage: 0 };
          const labels = {
            fundamental: 'Fundamental',
            intermediate: 'Intermediate',
            expert: 'Expert'
          };
          const colors = {
            fundamental: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            intermediate: 'text-blue-600 bg-blue-50 border-blue-200',
            expert: 'text-purple-600 bg-purple-50 border-purple-200'
          };
          
          return (
            <div key={level} className={`card p-5 border-l-4 ${colors[level]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{labels[level]}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {levelData.completed}/{levelData.total}
                  </p>
                  <p className="text-xs text-gray-500">{Math.round(levelData.percentage)}% complete</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[level]}`}>
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      {stats?.recent_activity?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recent_activity.map((activity, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/lesson/${activity.day}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Day {activity.day}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {activity.time_saved && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Saved {activity.time_saved} min
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