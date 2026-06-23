import { useAuthStore } from '../store/authStore';
import { 
  User, Mail, Briefcase, Calendar, Award, Clock, CheckCircle,
  Settings, LogOut, Sparkles, Target, TrendingUp,
  BookOpen, Star, LayoutDashboard
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const specialtyLabels = {
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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/users/me/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedCount = stats?.total_lessons_completed || 0;
  const progressPercentage = Math.round((completedCount / 30) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl font-bold shadow-xl border border-white/20">
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            <p className="text-blue-100 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {specialtyLabels[user?.specialty] || user?.specialty}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs">
                <Award className="w-3 h-3 mr-1" />
                {progressPercentage}% Complete
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-medium hover:bg-red-500/40 transition-colors"
            >
              <LogOut className="w-4 h-4 inline mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-stat text-center">
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-xs text-gray-500">Lessons Done</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor((stats?.total_time_saved_minutes || 0) / 60)}h
          </p>
          <p className="text-xs text-gray-500">Time Saved</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.current_streak || 0}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="card-stat text-center">
          <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Specialty</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {specialtyLabels[user?.specialty] || user?.specialty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          {user?.last_login_at && (
            <div className="md:col-span-2 flex items-center gap-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-emerald-600">Last Active</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-4 bg-white rounded-xl border border-gray-200/80 text-center hover:shadow-md transition-all"
        >
          <LayoutDashboard className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Dashboard</p>
        </button>
        <button 
          onClick={() => navigate('/lesson/today')}
          className="p-4 bg-white rounded-xl border border-gray-200/80 text-center hover:shadow-md transition-all"
        >
          <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Today's Lesson</p>
        </button>
        <button 
          onClick={() => navigate('/prompts')}
          className="p-4 bg-white rounded-xl border border-gray-200/80 text-center hover:shadow-md transition-all"
        >
          <Star className="w-5 h-5 text-amber-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Prompt Library</p>
        </button>
        <button 
          onClick={() => window.open('/api/docs', '_blank')}
          className="p-4 bg-white rounded-xl border border-gray-200/80 text-center hover:shadow-md transition-all"
        >
          <Settings className="w-5 h-5 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">API Docs</p>
        </button>
      </div>
    </div>
  );
}