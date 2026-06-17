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
  Brain, Compass, Sparkles, 
  Briefcase, MessageSquare
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
        // Ensure we have a valid lesson object
        const lessonData = response.data;
        setLesson({
          id: lessonData.id || 0,
          day: lessonData.day || 1,
          title: lessonData.title || 'Lesson',
          objective: lessonData.objective || 'Learning objective',
          tool: lessonData.tool || 'ChatGPT',
          prompt_text: lessonData.prompt_text || '',
          task_description: lessonData.task_description || '',
          concept: lessonData.concept || '',
          key_points: Array.isArray(lessonData.key_points) ? lessonData.key_points : [],
          real_world_example: lessonData.real_world_example || '',
          practice_exercise: lessonData.practice_exercise || '',
          reflection_question: lessonData.reflection_question || '',
          common_pitfalls: lessonData.common_pitfalls || '',
          mastery_tip: lessonData.mastery_tip || '',
          level: lessonData.level || 'fundamental',
          level_description: lessonData.level_description || '',
          estimated_time_minutes: lessonData.estimated_time_minutes || 30,
          video_url: lessonData.video_url || null,
          sample_file_url: lessonData.sample_file_url || null
        });
        
        // Check if already completed
        try {
          const progressRes = await api.get('/api/progress/summary');
          const completedLesson = progressRes.data.completed?.find(l => l.day === lessonData.day);
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
      } else if (error.response?.status === 404) {
        setError('Lesson not found. Please try again.');
      } else {
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to load lesson';
        // Handle validation error objects
        if (typeof errorMessage === 'object') {
          setError('Invalid response from server. Please try again.');
        } else {
          setError(errorMessage);
        }
        toast.error('Failed to load lesson');
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Lesson Not Found</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleRetry} 
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">No Lesson Available</h2>
        <p className="text-gray-600 mb-2">
          Lessons aren't set up for <strong>{user?.specialty || 'your specialty'}</strong>
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const progress = (lesson.day / 30) * 100;
  const levelColors = {
    fundamental: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    expert: 'bg-purple-100 text-purple-700'
  };
  const levelColor = levelColors[lesson.level] || levelColors.fundamental;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Day {lesson.day} of 30</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                Day {lesson.day}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${levelColor}`}>
                {lesson.level}
              </span>
              {completed && (
                <span className="text-sm font-medium bg-green-500/30 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
              <span className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                {lesson.estimated_time_minutes || 30} min
              </span>
            </div>
            <h1 className="text-3xl font-bold mt-3">{lesson.title}</h1>
            <p className="text-blue-100 mt-2 max-w-2xl">{lesson.objective}</p>
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-center min-w-[100px]">
            <p className="text-xs text-white/80">Tool of the Day</p>
            <p className="font-semibold">{lesson.tool}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Learning Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Description */}
          {lesson.level_description && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)} Level:</span> {lesson.level_description}
              </p>
            </div>
          )}

          {/* Core Concept */}
          {lesson.concept && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Core Concept</h3>
                  <p className="text-gray-700 mt-1 text-lg">{lesson.concept}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Points */}
          {lesson.key_points && lesson.key_points.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Key Learning Points</h3>
                  <ul className="mt-2 space-y-2">
                    {lesson.key_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Real World Example</h3>
                  <p className="text-gray-700 mt-1">{lesson.real_world_example}</p>
                </div>
              </div>
            </div>
          )}

          {/* Practice Exercise */}
          {lesson.practice_exercise && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Practice Exercise</h3>
                  <p className="text-gray-700 mt-1">{lesson.practice_exercise}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Section */}
          {lesson.prompt_text && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Your Prompt</h3>
                </div>
                <button
                  onClick={copyPrompt}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {lesson.prompt_text}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Tool Guide & Tips */}
        <div className="space-y-6">
          {/* Tool Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Tool: {lesson.tool}</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Task</h4>
                <p className="text-sm text-gray-600">{lesson.task_description || 'Use this tool for today\'s lesson'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Quick Start</h4>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                  <li>Open {lesson.tool}</li>
                  <li>Type your request clearly</li>
                  <li>Review and refine the response</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Common Pitfalls */}
          {lesson.common_pitfalls && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">Common Pitfalls to Avoid</h3>
              </div>
              <p className="text-sm text-gray-700">{lesson.common_pitfalls}</p>
            </div>
          )}

          {/* Mastery Tip */}
          {lesson.mastery_tip && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Mastery Tip</h3>
              </div>
              <p className="text-sm text-gray-700">{lesson.mastery_tip}</p>
            </div>
          )}

          {/* Reflection Question */}
          {lesson.reflection_question && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Reflection Question</h3>
              </div>
              <p className="text-sm text-gray-700">{lesson.reflection_question}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reflection Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Your Reflection</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you learn today?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Write your thoughts about today's lesson..."
              disabled={completed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time saved (minutes)
            </label>
            <input
              type="number"
              value={timeSaved}
              onChange={(e) => setTimeSaved(e.target.value)}
              className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., 5"
              disabled={completed}
              min="0"
              max="60"
            />
            <p className="text-xs text-gray-400 mt-1">
              How many minutes did this AI tool save you?
            </p>
          </div>
        </div>

        {!completed && (
          <button 
            onClick={handleComplete} 
            className="mt-6 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Mark Lesson Complete
              </>
            )}
          </button>
        )}

        {completed && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700 text-center font-medium">
            ✅ Lesson completed! Great job!
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
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            if (lesson.day < 30) {
              navigate(`/lesson/${lesson.day + 1}`);
            }
          }}
          disabled={lesson.day >= 30}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}