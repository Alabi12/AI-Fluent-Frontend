import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, ChevronRight, Calendar, 
  Loader2, RefreshCw, Copy, CheckCircle,
  Target, Wrench, Lightbulb, Rocket, 
  GraduationCap, Clock, Zap, BookOpen,
  Brain, Compass, Sparkles, Briefcase, MessageSquare,
  ArrowRight, FileText, Award
} from 'lucide-react';

export default function Lesson() {
  const { day } = useParams();
  const { token, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeSaved, setTimeSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchLesson();
  }, [day, token, isAuthenticated]);

  const fetchLesson = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      if (day === 'today' || !day) {
        endpoint = '/api/lessons/today';
      } else if (day && !isNaN(parseInt(day))) {
        const dayNum = parseInt(day);
        if (dayNum >= 1 && dayNum <= 30) {
          endpoint = `/api/lessons/${dayNum}`;
        } else {
          toast.error('Invalid day number.');
          navigate('/lesson/today');
          return;
        }
      } else {
        navigate('/lesson/today');
        return;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data) {
        setLesson(response.data);
        
        try {
          const progressRes = await api.get('/api/progress/summary');
          const completedLesson = progressRes.data.completed?.find(l => l.day === response.data.day);
          if (completedLesson) {
            setCompleted(true);
            setNotes(completedLesson.notes || '');
            setTimeSaved(completedLesson.time_saved || '');
          }
        } catch (err) {
          console.warn('Could not fetch progress:', err);
        }
      } else {
        setError('No lesson data received');
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to load lesson';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lesson) return;
    
    setIsCompleting(true);
    try {
      await api.post(`/api/progress/${lesson.id}/complete`, {
        completed: true,
        notes: notes,
        time_saved_minutes: timeSaved ? parseInt(timeSaved) : null
      });
      setCompleted(true);
      toast.success('🎉 Lesson completed! Great work!');
      
      if (lesson.day < 30) {
        setTimeout(() => {
          if (window.confirm('Move to next lesson?')) {
            navigate(`/lesson/${lesson.day + 1}`);
          }
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to save progress: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setIsCompleting(false);
    }
  };

  const copyPrompt = () => {
    if (lesson?.prompt_text) {
      navigator.clipboard.writeText(lesson.prompt_text);
      toast.success('📋 Prompt copied to clipboard!');
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchLesson();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-primary"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleRetry} 
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Lesson Available</h2>
        <p className="text-gray-500 text-sm mb-6">
          Lessons aren't set up for <strong>{user?.specialty || 'your specialty'}</strong>
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const progress = (lesson.day / 30) * 100;
  const levelColors = {
    fundamental: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-blue-100 text-blue-700',
    expert: 'bg-purple-100 text-purple-700'
  };
  const levelColor = levelColors[lesson.level] || levelColors.fundamental;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Day {lesson.day} of 30</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                Day {lesson.day}
              </span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${levelColor}`}>
                {lesson.level}
              </span>
              {completed && (
                <span className="text-xs font-medium bg-emerald-500/30 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
              )}
              <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                {lesson.estimated_time_minutes || 30} min
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-3">{lesson.title}</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">{lesson.objective}</p>
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center min-w-[100px]">
            <p className="text-xs text-white/80">Tool of the Day</p>
            <p className="font-semibold text-sm">{lesson.tool}</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Core Concept */}
          {lesson.concept && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Core Concept</h3>
                  <p className="text-gray-700 text-sm mt-1">{lesson.concept}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Points */}
          {lesson.key_points && lesson.key_points.length > 0 && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Key Points</h3>
                  <ul className="mt-2 space-y-1.5">
                    {lesson.key_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Real World Example */}
          {lesson.real_world_example && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Real World Example</h3>
                  <p className="text-gray-700 text-sm mt-1">{lesson.real_world_example}</p>
                </div>
              </div>
            </div>
          )}

          {/* Practice Exercise */}
          {lesson.practice_exercise && (
            <div className="card p-5 border-l-4 border-emerald-500">
              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Practice Exercise</h3>
                  <p className="text-gray-700 text-sm mt-1">{lesson.practice_exercise}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Section */}
          {lesson.prompt_text && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Prompt</h3>
                </div>
                <button
                  onClick={copyPrompt}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-gray-700"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lesson.prompt_text}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Tool Information */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Tool</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{lesson.tool}</p>
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Task</h4>
                <p className="text-sm text-gray-700 mt-1">{lesson.task_description || 'Use this tool for today\'s lesson'}</p>
              </div>
            </div>
          </div>

          {/* Common Pitfalls */}
          {lesson.common_pitfalls && (
            <div className="card p-5 border-l-4 border-amber-500">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Common Pitfalls</h3>
                  <p className="text-sm text-gray-600 mt-1">{lesson.common_pitfalls}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mastery Tip */}
          {lesson.mastery_tip && (
            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Mastery Tip</h3>
                  <p className="text-sm text-gray-700 mt-1">{lesson.mastery_tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reflection Question */}
          {lesson.reflection_question && (
            <div className="card p-5 border-l-4 border-purple-500">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Reflection</h3>
                  <p className="text-sm text-gray-600 mt-1">{lesson.reflection_question}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reflection & Completion Section */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Reflection</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
              What did you learn today?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="input-field"
              placeholder="Write your professional insights..."
              disabled={completed}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                Time saved (min)
              </label>
              <input
                type="number"
                value={timeSaved}
                onChange={(e) => setTimeSaved(e.target.value)}
                className="input-field"
                placeholder="e.g., 5"
                disabled={completed}
                min="0"
                max="60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                Confidence Level
              </label>
              <select
                className="input-field"
                disabled={completed}
                defaultValue=""
              >
                <option value="">Select</option>
                <option value="1">1 - Need practice</option>
                <option value="2">2 - Getting there</option>
                <option value="3">3 - Comfortable</option>
                <option value="4">4 - Confident</option>
                <option value="5">5 - Mastered</option>
              </select>
            </div>
          </div>
        </div>

        {!completed && (
          <button 
            onClick={handleComplete} 
            className="mt-6 w-full btn-primary flex items-center justify-center gap-2"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Mark Lesson Complete
              </>
            )}
          </button>
        )}

        {completed && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-medium text-center">
            ✅ Lesson completed
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 flex-wrap">
        <button
          onClick={() => {
            if (lesson.day > 1) {
              navigate(`/lesson/${lesson.day - 1}`);
            }
          }}
          disabled={lesson.day <= 1}
          className="btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          <Calendar className="w-4 h-4 mr-2 inline" />
          Dashboard
        </button>

        <button
          onClick={() => {
            if (lesson.day < 30) {
              navigate(`/lesson/${lesson.day + 1}`);
            }
          }}
          disabled={lesson.day >= 30}
          className="btn-primary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}