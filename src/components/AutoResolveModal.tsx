import React from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Bug,
  ShieldCheck,
  Terminal,
  Activity,
  X,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { AutoResolveProgramState } from '../types/notification';

interface AutoResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AutoResolveProgramState | null;
  onViewAudit?: () => void;
}

export const AutoResolveModal: React.FC<AutoResolveModalProps> = ({
  isOpen,
  onClose,
  state,
  onViewAudit,
}) => {
  if (!isOpen || !state) return null;

  const isCompleted = state.stage === 'AUTO_RESOLVED';

  const getStageBadge = () => {
    switch (state.stage) {
      case 'THRESHOLD_REACHED':
        return { label: 'Repeat Threshold (5+) Hit', color: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'CHECKING_BUGS':
        return { label: 'Scanning Software Bugs...', color: 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse' };
      case 'APPLYING_BUG_FIXES':
        return { label: 'Applying Autonomous Patches...', color: 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse' };
      case 'VERIFYING':
        return { label: 'Verifying Bug Clearance...', color: 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse' };
      case 'AUTO_RESOLVED':
        return { label: 'Autonomous Auto-Resolve Complete', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      default:
        return { label: 'Processing', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const badge = getStageBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Auto-Resolve & Bug Healer Daemon</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Triggered automatically because notification repeated &gt; 5 times (Count: {state.repeatCount})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Banner */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Daemon Autonomous Healing Pipeline</span>
            </span>
            <span className="text-cyan-400 font-bold">{state.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${state.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Bugs Detected & Resolved Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Bug className="w-4 h-4 text-rose-400" />
                <span>Automated Software Bug Inspection & Resolution</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {state.bugs.filter((b) => b.status === 'RESOLVED').length} / {state.bugs.length} Bugs Fixed
              </span>
            </div>

            <div className="space-y-2.5">
              {state.bugs.map((bug) => (
                <div
                  key={bug.id}
                  className={`p-3.5 rounded-xl border transition text-xs ${
                    bug.status === 'RESOLVED'
                      ? 'bg-emerald-950/20 border-emerald-800/80 text-slate-200'
                      : bug.status === 'FIXING'
                      ? 'bg-cyan-950/30 border-cyan-700 text-cyan-200 animate-pulse'
                      : 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      {bug.status === 'RESOLVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : bug.status === 'FIXING' ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm font-sans">
                            {bug.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {bug.category}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                          {bug.component}
                        </span>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                          {bug.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        bug.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : bug.status === 'FIXING'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {bug.status}
                    </span>
                  </div>

                  {bug.status === 'RESOLVED' && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-900/40 text-[11px] font-mono text-emerald-300 flex items-center space-x-1.5">
                      <span className="font-bold uppercase text-[10px] text-emerald-400">Fix Applied:</span>
                      <span>{bug.fixApplied}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Daemon Log Console */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Daemon Healing Execution Log</span>
            </div>

            <div className="space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto pr-1">
              {state.log.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.includes('[SUCCESS]') || line.includes('[COMPLETE]')
                      ? 'text-emerald-400 font-semibold'
                      : line.includes('[CRITICAL]') || line.includes('[DETECTED]')
                      ? 'text-rose-300'
                      : line.includes('[RESOLVED]')
                      ? 'text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Completion Banner */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border-2 border-emerald-500/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">✅ Incident Autonomously Resolved</h4>
                  <p className="text-xs text-emerald-300/90 font-medium">
                    All 3 software bugs checked & resolved. Metrics verified back to healthy baseline (0.02% error rate).
                  </p>
                </div>
              </div>

              {onViewAudit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewAudit();
                  }}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition shrink-0 cursor-pointer"
                >
                  <span>View Audit Evaluation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Auto-Resolve Watchdog Daemon Active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
