import React, { useState } from 'react';
import {
  History,
  Download,
  Trash2,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  User,
  Server,
  Monitor,
  ShieldCheck,
  RefreshCw,
  Bot,
  Bug,
} from 'lucide-react';
import { AlertHistoryEntry, AlertHistoryEventType } from '../types/notification';

interface AlertHistoryViewProps {
  history: AlertHistoryEntry[];
  onClearHistory: () => void;
  onExportCSV: () => void;
  onRefresh: () => void;
  executionMode: 'in_app' | 'backend';
}

export const AlertHistoryView: React.FC<AlertHistoryViewProps> = ({
  history,
  onClearHistory,
  onExportCSV,
  onRefresh,
  executionMode,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((entry) => {
    const matchesFilter = filterType === 'ALL' || entry.eventType === filterType;
    const matchesSearch =
      searchTerm === '' ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.details && entry.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.actor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventBadge = (type: AlertHistoryEventType) => {
    switch (type) {
      case 'TRIGGERED':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'TRIGGERED',
          classes: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'ALARM_SOUNDED':
        return {
          icon: <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
          label: 'ALARM SOUNDED',
          classes: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'ACKNOWLEDGED':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'ACKNOWLEDGED',
          classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'SILENCED':
        return {
          icon: <VolumeX className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'SILENCED',
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
        };
      case 'AUTO_RESOLVE_TRIGGERED':
        return {
          icon: <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />,
          label: 'AUTO-RESOLVE TRIGGERED',
          classes: 'bg-purple-950/80 text-purple-300 border-purple-800',
        };
      case 'BUG_CHECK_RESOLVED':
        return {
          icon: <Bug className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'BUGS RESOLVED',
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
        };
      case 'RESOLVED':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />,
          label: 'RESOLVED',
          classes: 'bg-teal-950/80 text-teal-300 border-teal-800',
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
          label: type,
          classes: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Permanent Alert Audit Trail
          </h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400">
            {filteredHistory.length} events
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono border bg-slate-900 text-slate-300 border-slate-700 flex items-center space-x-1">
            {executionMode === 'backend' ? (
              <>
                <Server className="w-3 h-3 text-cyan-400" />
                <span>Backend Daemon Store</span>
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3 text-emerald-400" />
                <span>In-App Local Store</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh history"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={history.length === 0}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
            title="Export permanent CSV log for compliance"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs transition disabled:opacity-50"
            title="Clear permanent audit history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit events by title, service, actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto p-0.5 bg-slate-950 rounded-lg border border-slate-800">
          {(['ALL', 'TRIGGERED', 'ALARM_SOUNDED', 'ACKNOWLEDGED', 'SILENCED'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'ALARM_SOUNDED' ? 'SOUNDED' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline / Table */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-900 text-slate-500 text-xs">
            No audit records match the selected filter.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const badge = getEventBadge(item.eventType);

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition text-xs font-mono"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[10px] font-bold ${badge.classes}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-slate-200 font-bold font-sans">{item.title}</span>
                    <span className="text-indigo-400 text-[11px]">[{item.service}]</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestampFormatted}</span>
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-2 text-slate-300 font-sans text-xs flex items-center justify-between">
                  <span>{item.message}</span>
                  {item.timeToAcknowledgeSeconds !== undefined && (
                    <span className="text-emerald-400 font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900">
                      TTACK: {item.timeToAcknowledgeSeconds}s
                    </span>
                  )}
                </div>

                {item.details && (
                  <div className="mt-1.5 text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    {item.details}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Actor: <strong className="text-slate-300 font-medium">{item.actor}</strong></span>
                  </span>

                  <span className="flex items-center space-x-1 font-mono">
                    <span>Engine:</span>
                    <span className={item.executionMode === 'backend' ? 'text-cyan-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {item.executionMode === 'backend' ? 'Backend Program' : 'In-App Program'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
