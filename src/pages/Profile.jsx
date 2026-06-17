import { useAuthStore } from '../store/authStore';
import { 
  User, Mail, Briefcase, Calendar, Award, Clock, CheckCircle,
  Edit2, Settings, LogOut, Shield, Sparkles, Zap, Target,
  TrendingUp, BookOpen, Star, Medal, LayoutDashboard
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
      const response = await api.get('/api/users/me/dashboard');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center gap-6 flex-wrap">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl border border-white/20">
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user?.full_name}</h1>
            <p className="text-blue-100">{user?.email}</p>
            <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm mt-2">
              <Briefcase className="w-3 h-3 mr-1" />
              {specialtyLabels[user?.specialty] || user?.specialty}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-sm font-medium hover:bg-red-500/40 transition-colors"
            >
              <LogOut className="w-4 h-4 inline mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-1">📚</div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_days_completed || 0}</p>
          <p className="text-sm text-gray-600">Lessons Done</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">⏱️</div>
          <p className="text-2xl font-bold text-gray-900">{Math.floor((stats?.total_time_saved_minutes || 0) / 60)}h</p>
          <p className="text-sm text-gray-600">Time Saved</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-2xl font-bold text-gray-900">{stats?.streak_days || 0}</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">🏆</div>
          <p className="text-2xl font-bold text-gray-900">{Math.round((stats?.total_days_completed || 0) / 30 * 100)}%</p>
          <p className="text-sm text-gray-600">Complete</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{user?.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Specialty</p>
              <p className="font-medium text-gray-900 capitalize">{specialtyLabels[user?.specialty]}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          {user?.last_login_at && (
            <div className="md:col-span-2 flex items-center gap-4 p-4 bg-green-50 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-green-600">Last Active</p>
                <p className="font-medium text-gray-900">
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
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl text-center hover:scale-105 transition-transform"
        >
          <LayoutDashboard className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Dashboard</p>
        </button>
        <button 
          onClick={() => navigate('/lesson/today')}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl text-center hover:scale-105 transition-transform"
        >
          <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Today's Lesson</p>
        </button>
        <button 
          onClick={() => navigate('/prompts')}
          className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl text-center hover:scale-105 transition-transform"
        >
          <Star className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Prompt Library</p>
        </button>
        <button 
          onClick={() => window.open('/api/docs', '_blank')}
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl text-center hover:scale-105 transition-transform"
        >
          <Settings className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">API Docs</p>
        </button>
      </div>
    </div>
  );
}