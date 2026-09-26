import React, { useState } from 'react';
import {
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  Clock,
  User,
  Activity,
  Check,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { IncidentLifecycleEvent, LifecycleStage, IncidentState } from '../types/incident';

interface IncidentLifecycleTimelineProps {
  events: IncidentLifecycleEvent[];
  incidentId?: string;
  incidentTitle: string;
  serviceName: string;
  incidentState: IncidentState;
  startTime?: number;
  endTime?: number;
}

export const IncidentLifecycleTimeline: React.FC<IncidentLifecycleTimelineProps> = ({
  events,
  incidentId = 'INC-2026-0926-01',
  incidentTitle,
  serviceName,
  incidentState,
  startTime,
  endTime,
}) => {
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const getStageIcon = (stage: LifecycleStage, status: IncidentLifecycleEvent['status']) => {
    if (status === 'in_progress') {
      return <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />;
    }
    if (status === 'failed') {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }

    switch (stage) {
      case 'Triggered':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'Analyzed':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'Approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Applied':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'Resolved':
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
    }
  };

  // Calculate total duration if resolved or ongoing
  const calculateTotalDuration = () => {
    if (!startTime) return null;
    const end = endTime || Date.now();
    const durationSeconds = Math.max(1, Math.round((end - startTime) / 1000));
    if (durationSeconds < 60) return `${durationSeconds}s`;
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const totalDuration = calculateTotalDuration();

  const getStageStatusColor = (status: IncidentLifecycleEvent['status']) => {
    switch (status) {
      case 'completed':
        return {
          nodeBg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20',
          line: 'bg-emerald-500',
          badge: 'bg-emerald-950 text-emerald-400 border-emerald-800',
        };
      case 'in_progress':
        return {
          nodeBg: 'bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-4 ring-cyan-500/30 animate-pulse',
          line: 'bg-gradient-to-r from-emerald-500 to-cyan-500',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse',
        };
      case 'failed':
        return {
          nodeBg: 'bg-rose-950/90 border-rose-500 text-rose-200 ring-4 ring-rose-500/30',
          line: 'bg-rose-600',
          badge: 'bg-rose-950 text-rose-400 border-rose-800',
        };
      case 'pending':
        return {
          nodeBg: 'bg-slate-900 border-slate-700/80 text-slate-500',
          line: 'bg-slate-800',
          badge: 'bg-slate-800 text-slate-500 border-slate-700',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-teal-500/20 border border-indigo-500/30 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Incident Lifecycle Timeline
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {incidentId}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800/80">
                [{serviceName}]
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Visual audit trail: Triggered → Analyzed → Approved → Applied → Resolved
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          {totalDuration && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500">Lifecycle Duration:</span>
              <span className="text-emerald-400 font-bold">{totalDuration}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition flex items-center space-x-1"
            title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Horizontal Timeline Track */}
      {isExpanded && (
        <div className="mt-6">
          {/* Scrollable Container on small screens */}
          <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
            <div className="min-w-[760px] relative">
              {/* Connecting Horizontal Line across nodes */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-slate-800 z-0">
                {/* Dynamic colored progress segment based on completed steps */}
                {(() => {
                  const completedIndex = events.map((e) => e.status).lastIndexOf('completed');
                  const inProgressIndex = events.findIndex((e) => e.status === 'in_progress');
                  const activeTarget = inProgressIndex !== -1 ? inProgressIndex : completedIndex;
                  const percent = activeTarget >= 0 ? (activeTarget / (events.length - 1)) * 100 : 0;
                  return (
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 transition-all duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  );
                })()}
              </div>

              {/* 5 Milestone Events (Triggered, Analyzed, Approved, Applied, Resolved) */}
              <div className="grid grid-cols-5 gap-3 relative z-10">
                {events.map((evt, idx) => {
                  const colors = getStageStatusColor(evt.status);
                  const isSelected = selectedStage === evt.stage;

                  return (
                    <div
                      key={evt.stage}
                      onClick={() => setSelectedStage(isSelected ? null : evt.stage)}
                      className={`flex flex-col cursor-pointer transition-all duration-200 group ${
                        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      {/* Top Node & Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition shadow-lg ${colors.nodeBg}`}
                        >
                          {getStageIcon(evt.stage, evt.status)}
                        </div>

                        {/* Step Number & Label */}
                        <div className="mt-2 text-center">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                            Stage 0{idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition">
                            {evt.label}
                          </span>
                        </div>
                      </div>

                      {/* Event Card Summary */}
                      <div
                        className={`mt-2.5 p-3 rounded-xl border transition-all flex flex-col justify-between flex-1 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                            : evt.status === 'completed'
                            ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            : evt.status === 'in_progress'
                            ? 'bg-cyan-950/30 border-cyan-800'
                            : evt.status === 'failed'
                            ? 'bg-rose-950/30 border-rose-800'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        {/* Status & Elapsed Time */}
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${colors.badge}`}
                          >
                            {evt.status === 'in_progress' ? 'RUNNING' : evt.status}
                          </span>
                          {evt.timeElapsed && (
                            <span className="text-slate-400 font-semibold">{evt.timeElapsed}</span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 my-1">
                          {evt.description}
                        </p>

                        {/* Actor & Metrics Metadata */}
                        <div className="pt-2 mt-auto border-t border-slate-900 text-[10px] text-slate-500 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="truncate flex items-center space-x-1">
                              <User className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{evt.actor}</span>
                            </span>
                            {evt.timestamp && (
                              <span className="font-mono text-slate-400 shrink-0">{evt.timestamp}</span>
                            )}
                          </div>

                          {evt.metricsSnapshot && (
                            <div className="font-mono text-slate-400 flex items-center justify-between text-[10px]">
                              <span>Err: {evt.metricsSnapshot.errorRate}%</span>
                              <span>{evt.metricsSnapshot.responseTimeMs}ms</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Stage Expanded Detail Audit Inspector */}
          {selectedStage && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-xs animate-in fade-in duration-200">
              {(() => {
                const stageData = events.find((e) => e.stage === selectedStage);
                if (!stageData) return null;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-bold text-white text-sm">
                          Audit Stage Record: {stageData.label} ({stageData.stage})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStage(null)}
                        className="text-slate-500 hover:text-slate-300 text-xs"
                      >
                        ✕ Close Detail
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 font-mono text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500 block">Actor / Author:</span>
                        <span className="text-slate-200 font-semibold">{stageData.actor}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Execution Timestamp:</span>
                        <span className="text-slate-200">{stageData.timestamp || 'Pending execution'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Relative Elapsed:</span>
                        <span className="text-indigo-400 font-bold">{stageData.timeElapsed || '0s'}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-slate-300 text-xs leading-relaxed">
                      <strong className="text-slate-400 block mb-0.5">Audit Log & State Details:</strong>
                      <p className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-sans">
                        {stageData.details || stageData.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
