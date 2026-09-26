import React from 'react';
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { PRESET_INCIDENTS } from '../data/mockMonitoring';

interface IncidentInputProps {
  query: string;
  setQuery: (query: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export const IncidentInput: React.FC<IncidentInputProps> = ({
  query,
  setQuery,
  onAnalyze,
  isAnalyzing,
  disabled,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled && !isAnalyzing) {
      onAnalyze();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="incident-input" className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <span>Enter Incident</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-normal">
              Step 1: Input & Correlate
            </span>
          </label>
          <span className="text-xs text-slate-400">
            Type an incident or select an example
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              id="incident-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled || isAnalyzing}
              placeholder="e.g. Payment API is failing."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
            />
            {query && !disabled && !isAnalyzing && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim() || disabled || isAnalyzing}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Incident...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Incident</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Presets */}
        <div className="pt-2 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Quick Presets:</span>
          {PRESET_INCIDENTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled || isAnalyzing}
              onClick={() => {
                setQuery(preset.query);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs transition ${
                query === preset.query
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 font-medium'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/70 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              “{preset.label}”
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
