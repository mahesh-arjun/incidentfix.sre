import React from 'react';
import {
  Bot,
  Repeat,
  Bug,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Server,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import { IncidentNotification, NotificationSettings } from '../types/notification';

interface AutoResolveWatchdogBarProps {
  notification: IncidentNotification | null;
  settings: NotificationSettings;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onIncrementRepeat: () => void;
  onTrigger5xAutoResolve: () => void;
  onInspectBugs: () => void;
  isResolved: boolean;
}

export const AutoResolveWatchdogBar: React.FC<AutoResolveWatchdogBarProps> = ({
  notification,
  settings,
  isStreaming,
  onToggleStreaming,
  onIncrementRepeat,
  onTrigger5xAutoResolve,
  onInspectBugs,
  isResolved,
}) => {
  const repeatCount = notification ? notification.repeatCount || 1 : 0;
  const threshold = settings.repeatThreshold || 5;
  const isThresholdMet = repeatCount > threshold;
  const progressPercent = Math.min(100, Math.round((repeatCount / (threshold + 1)) * 100));

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${
      isResolved
        ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg'
        : isThresholdMet
        ? 'bg-purple-950/40 border-purple-500/80 ring-2 ring-purple-500/40 shadow-xl'
        : 'bg-slate-900/90 border-slate-800 shadow-lg'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Daemon Description & Repeat Progress */}
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isResolved
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : isThresholdMet
              ? 'bg-purple-500 text-white animate-pulse'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {isResolved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-bold text-sm text-white tracking-tight flex items-center space-x-1.5">
                <span>Autonomous Auto-Resolve & Bug Healer Program</span>
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isResolved
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : isThresholdMet
                  ? 'bg-purple-950 text-purple-200 border-purple-500 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {isResolved
                  ? 'AUTONOMOUSLY RESOLVED'
                  : isThresholdMet
                  ? 'THRESHOLD (>5) HIT • HEALING'
                  : `ACTIVE WATCHDOG (> ${threshold} REPEATS)`}
              </span>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950 text-slate-400 border border-slate-800 flex items-center space-x-1">
                {settings.executionMode === 'backend' ? (
                  <>
                    <Server className="w-3 h-3 text-cyan-400" />
                    <span>Backend Program</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3 text-emerald-400" />
                    <span>In-App Engine</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              When notifications repeat &gt; 5 times, the program inspects code bugs (connection leaks, pool deadlocks), applies fixes, and auto-resolves the incident.
            </p>

            {/* Repeat Meter */}
            {!isResolved && (
              <div className="pt-1.5 flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-xs font-mono">
                  <Repeat className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-300">
                    Repeats: <strong className={isThresholdMet ? 'text-purple-300 text-sm' : 'text-cyan-400'}>{repeatCount}</strong> / {threshold}
                  </span>
                </div>

                <div className="w-36 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isThresholdMet
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.max(10, progressPercent)}%` }}
                  />
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  {repeatCount > threshold ? 'Triggering Auto-Resolve' : `${Math.max(0, threshold + 1 - repeatCount)} repeats left`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 self-end lg:self-center shrink-0 flex-wrap gap-y-2">
          {!isResolved && (
            <>
              {/* +1 Repeat Button */}
              <button
                type="button"
                onClick={onIncrementRepeat}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
                title="Increment notification repeat count by 1"
              >
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                <span>+1 Repeat</span>
              </button>

              {/* Force 5x Auto-Resolve Button */}
              <button
                type="button"
                onClick={onTrigger5xAutoResolve}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-600/80 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Simulate exceeding 5 repeats to trigger autonomous bug check and auto-resolution"
              >
                <Zap className="w-3.5 h-3.5 text-purple-300" />
                <span>Simulate &gt;5x Auto-Resolve</span>
              </button>

              {/* Periodic Repeat Stream Toggle */}
              <button
                type="button"
                onClick={onToggleStreaming}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                  isStreaming
                    ? 'bg-amber-950/80 text-amber-200 border-amber-500 ring-1 ring-amber-500/50 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title={isStreaming ? 'Stop auto-repeating stream' : 'Start periodic auto-repeating stream (every 2.2s)'}
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-3 h-3 text-amber-400" />
                    <span>Auto-Repeat ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-slate-400" />
                    <span>Auto-Repeat Stream</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Inspect Software Bugs Button */}
          <button
            type="button"
            onClick={onInspectBugs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/70 text-xs font-medium transition cursor-pointer"
            title="Inspect detected software bugs and automated fix pipeline"
          >
            <Bug className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect Bugs (3)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
