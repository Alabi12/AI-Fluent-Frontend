import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Save, Copy, Trash2, Plus, Zap, Search, 
  Filter, X, Clock, Star, StarOff, Sparkles,
  Grid3x3, List, Bookmark
} from 'lucide-react';

export default function PromptLibrary() {
  const { user } = useAuthStore();
  const [prompts, setPrompts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [newPrompt, setNewPrompt] = useState({ 
    title: '', 
    prompt_text: '', 
    tool: 'ChatGPT' 
  });

  const tools = ['ChatGPT', 'Gemini', 'Copilot', 'Perplexity', 'Otter', 'Canva'];
  const toolColors = {
    'ChatGPT': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Gemini': 'bg-blue-100 text-blue-700 border-blue-200',
    'Copilot': 'bg-purple-100 text-purple-700 border-purple-200',
    'Perplexity': 'bg-orange-100 text-orange-700 border-orange-200',
    'Otter': 'bg-pink-100 text-pink-700 border-pink-200',
    'Canva': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await api.get('/api/prompts/');
      setPrompts(response.data);
    } catch (error) {
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    if (!newPrompt.title.trim() || !newPrompt.prompt_text.trim()) {
      toast.error('Title and prompt text are required');
      return;
    }

    try {
      const response = await api.post('/api/prompts/', newPrompt);
      setPrompts([response.data, ...prompts]);
      toast.success('✨ Prompt saved!');
      setNewPrompt({ title: '', prompt_text: '', tool: 'ChatGPT' });
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to save prompt');
    }
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard!');
  };

  const deletePrompt = async (id) => {
    if (!window.confirm('Delete this prompt?')) return;
    
    try {
      await api.delete(`/api/prompts/${id}`);
      setPrompts(prompts.filter(p => p.id !== id));
      toast.success('Prompt deleted');
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  const toggleFavorite = async (id, currentFavorite) => {
    try {
      await api.put(`/api/prompts/${id}`, { is_favorite: !currentFavorite });
      setPrompts(prompts.map(p => 
        p.id === id ? { ...p, is_favorite: !currentFavorite } : p
      ));
      toast.success(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.prompt_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTool = !filterTool || p.tool === filterTool;
    return matchesSearch && matchesTool;
  });

  const favoritePrompts = filteredPrompts.filter(p => p.is_favorite);
  const regularPrompts = filteredPrompts.filter(p => !p.is_favorite);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
          <p className="text-gray-500 mt-1">Save and reuse your best prompts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? 'Cancel' : 'New Prompt'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Create New Prompt
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label-field">Title</label>
              <input
                type="text"
                placeholder="e.g., Email Drafting Template"
                value={newPrompt.title}
                onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Prompt Text</label>
              <textarea
                placeholder="Write your prompt here..."
                value={newPrompt.prompt_text}
                onChange={(e) => setNewPrompt({ ...newPrompt, prompt_text: e.target.value })}
                rows="3"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Tool</label>
              <select
                value={newPrompt.tool}
                onChange={(e) => setNewPrompt({ ...newPrompt, tool: e.target.value })}
                className="input-field"
              >
                {tools.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={savePrompt} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Prompt
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
            className="input-field max-w-48"
          >
            <option value="">All Tools</option>
            {tools.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-1 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {(searchTerm || filterTool) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterTool(''); }}
              className="btn-secondary flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Prompt Stats */}
      {prompts.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
          <span>📚 {prompts.length} prompts</span>
          <span>⭐ {prompts.filter(p => p.is_favorite).length} favorites</span>
          <span>🔄 {prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0)} total uses</span>
        </div>
      )}

      {/* Prompt List */}
      {filteredPrompts.length === 0 ? (
        <div className="card text-center py-16">
          {prompts.length === 0 ? (
            <>
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-500">No saved prompts yet</p>
              <p className="text-gray-400 mt-1">Click "New Prompt" to save your first one</p>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-500">No prompts match your filters</p>
              <button
                onClick={() => { setSearchTerm(''); setFilterTool(''); }}
                className="text-blue-600 hover:underline mt-2"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={copyPrompt}
              onDelete={deletePrompt}
              onFavorite={toggleFavorite}
              toolColors={toolColors}
            />
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => (
            <PromptListItem
              key={prompt.id}
              prompt={prompt}
              onCopy={copyPrompt}
              onDelete={deletePrompt}
              onFavorite={toggleFavorite}
              toolColors={toolColors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Prompt Card Component (Grid View)
function PromptCard({ prompt, onCopy, onDelete, onFavorite, toolColors }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{prompt.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${toolColors[prompt.tool] || 'bg-gray-100 text-gray-700'}`}>
              {prompt.tool}
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl mt-2 font-mono text-sm text-gray-700 whitespace-pre-wrap break-words">
            {prompt.prompt_text}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>Used {prompt.usage_count || 0} times</span>
            <span>•</span>
            <span>Saved {new Date(prompt.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => onCopy(prompt.prompt_text)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFavorite(prompt.id, prompt.is_favorite)}
            className={`p-2 rounded-lg transition-colors ${prompt.is_favorite ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
            title={prompt.is_favorite ? 'Remove favorite' : 'Add favorite'}
          >
            {prompt.is_favorite ? <Star className="w-4 h-4 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Prompt List Item Component
function PromptListItem({ prompt, onCopy, onDelete, onFavorite, toolColors }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => onFavorite(prompt.id, prompt.is_favorite)}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${prompt.is_favorite ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`}
          >
            {prompt.is_favorite ? <Star className="w-4 h-4 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${toolColors[prompt.tool] || 'bg-gray-100 text-gray-700'}`}>
                {prompt.tool}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{prompt.prompt_text}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>Used {prompt.usage_count || 0} times</span>
              <span>•</span>
              <span>Saved {new Date(prompt.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onCopy(prompt.prompt_text)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}