import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Bot, Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SPECIALTIES = [
  { value: 'accounting', label: 'Accounting' },
  { value: 'finance', label: 'Finance' },
  { value: 'audit', label: 'Audit & Compliance' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'legal', label: 'Legal & Contracts' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'supply_chain', label: 'Supply Chain & Logistics' },
  { value: 'sales', label: 'Sales & Business Development' },
  { value: 'marketing', label: 'Marketing & Communications' },
  { value: 'it', label: 'IT & Systems Administration' },
  { value: 'operations', label: 'Operations & Project Management' },
  { value: 'healthcare', label: 'Healthcare & Clinical Operations' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    specialty: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await register(formData);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Account created successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-professional-lg p-8 border border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-sm mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join AI-Fluent</h1>
            <p className="text-gray-500 text-sm mt-1">Professional AI Mastery Programme</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must contain uppercase, lowercase, number, and special character</p>
            </div>

            <div>
              <label className="label-field">Professional Specialty</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="select-field pl-10"
                  required
                >
                  <option value="">Select your area</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Creating account...
                </span>
              ) : (
                'Create Professional Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            Sign In
          </Link>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-6 text-xs text-gray-400">
            <span>30 Days</span>
            <span>•</span>
            <span>30 Min/Day</span>
            <span>•</span>
            <span>AI Mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
}