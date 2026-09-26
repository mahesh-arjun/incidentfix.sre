import React, { useState } from 'react';
import { Terminal, Filter, Search, Copy, Check } from 'lucide-react';
import { LogEntry } from '../types/incident';

interface RecentLogsProps {
  logs: LogEntry[];
}

export const RecentLogs: React.FC<RecentLogsProps> = ({ logs }) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopy = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'WARN':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'INFO':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Logs</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32 sm:w-40"
            />
          </div>

          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
            {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFilterLevel(level)}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  filterLevel === level
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy logs to clipboard"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Console Body */}
      <div className="mt-3 flex-1 overflow-y-auto max-h-72 font-mono text-xs space-y-1.5 pr-1 bg-slate-950/80 p-3 rounded-xl border border-slate-900">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No logs matching criteria
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed transition ${
                log.level === 'ERROR'
                  ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-rose-500'
                  : log.level === 'WARN'
                  ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-2 border-amber-500'
                  : 'hover:bg-slate-900/60 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${getLevelBadge(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-indigo-400 text-[11px] font-semibold">[{log.service}]</span>
              </div>
              <span className={`flex-1 break-all ${
                log.level === 'ERROR' ? 'text-rose-200' : log.level === 'WARN' ? 'text-amber-200' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
