import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Terminal, Check, Activity, ArrowRight, Award, FileText } from 'lucide-react';
import { IncidentState, SystemMetrics } from '../types/incident';

interface FixExecutionProgressProps {
  incidentState: IncidentState;
  currentStepIndex: number;
  steps: string[];
  statusMessage: string;
  metrics: SystemMetrics;
  onReset: () => void;
  onApplySecondaryFix?: () => void;
  onOpenAuditEvaluation?: () => void;
  onOpenEvidence?: () => void;
}

export const FixExecutionProgress: React.FC<FixExecutionProgressProps> = ({
  incidentState,
  currentStepIndex,
  steps,
  statusMessage,
  metrics,
  onReset,
  onApplySecondaryFix,
  onOpenAuditEvaluation,
  onOpenEvidence,
}) => {
  const isApplying = incidentState === 'applying_fix';
  const isVerifying = incidentState === 'verifying';
  const isResolved = incidentState === 'resolved';
  const isUnresolved = incidentState === 'unresolved';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Active Application / Verification in Progress */}
      {(isApplying || isVerifying) && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 animate-spin">
              <Loader2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isVerifying ? 'Verifying System Telemetry' : 'Applying Safe Remediation'}
              </h3>
              <p className="text-xs text-slate-400">
                {isVerifying ? 'Automated health probe verification in progress...' : 'Executing safe rollback pipeline...'}
              </p>
            </div>
          </div>

          {/* Prompt required exact message banner */}
          {isVerifying && (
            <div className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-700/80 flex items-center justify-between text-indigo-200">
              <div className="flex items-center space-x-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                </span>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
                  Fix completed. Checking system...
                </span>
              </div>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">polling metrics</span>
            </div>
          )}

          {/* Sequential Step Progress */}
          <div className="space-y-3 font-mono text-xs">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition ${
                    isDone
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                      : isCurrent
                      ? 'bg-cyan-950/40 border-cyan-700 text-cyan-200 font-semibold shadow-inner'
                      : 'bg-slate-950/30 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="text-slate-600">{idx + 1}</span>
                    )}
                  </div>
                  <span className="flex-1">{step}</span>
                  {isDone && <span className="text-emerald-400 text-[10px] uppercase font-bold">Done</span>}
                  {isCurrent && <span className="text-cyan-400 text-[10px] uppercase font-bold animate-pulse">Running</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome: ✅ Incident Resolved */}
      {isResolved && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <span>✅ Incident Resolved</span>
                  </h2>
                  <p className="text-sm text-emerald-300/90 mt-1 font-medium">
                    The safe rollback was applied and verified. All system health indicators have returned to normal.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-2">
                {onOpenAuditEvaluation && (
                  <button
                    type="button"
                    onClick={onOpenAuditEvaluation}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-200 font-bold text-xs sm:text-sm transition cursor-pointer shadow-md"
                  >
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Audit Evaluation (Grade A+)</span>
                  </button>
                )}

                {onOpenEvidence && (
                  <button
                    type="button"
                    onClick={onOpenEvidence}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Evidence Vault</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-700/30 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Start New Incident</span>
                </button>
              </div>
            </div>

            {/* Post-Resolution Telemetry Comparison */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/40 font-mono text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-900/40">
                <span className="text-slate-400 text-[11px] block">Error Rate</span>
                <span className="text-emerald-400 font-bold text-base">{metrics.errorRate.toFixed(2)}%</span>
                <span className="text-[10px] text-emerald-300 block">▼ Baseline restored</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-900/40">
                <span className="text-slate-400 text-[11px] block">Latency (p95)</span>
                <span className="text-emerald-400 font-bold text-base">{metrics.responseTimeMs}ms</span>
                <span className="text-[10px] text-emerald-300 block">▼ Optimal (&lt; 50ms)</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-900/40">
                <span className="text-slate-400 text-[11px] block">DB Connections</span>
                <span className="text-emerald-400 font-bold text-base">{metrics.databaseConnections} / {metrics.maxDatabaseConnections}</span>
                <span className="text-[10px] text-emerald-300 block">▼ Unblocked</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-900/40">
                <span className="text-slate-400 text-[11px] block">Verification Status</span>
                <span className="text-emerald-400 font-bold text-base">PASSED</span>
                <span className="text-[10px] text-emerald-300 block">100% probes OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outcome: ⚠️ Incident Still Active */}
      {isUnresolved && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-rose-950/50 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/40">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 mt-1">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <span>⚠️ Incident Still Active</span>
                  </h2>
                  <p className="text-sm text-rose-300/90 mt-1 font-medium">
                    The rollback was executed, but post-fix telemetry shows the error rate remains elevated at {metrics.errorRate.toFixed(1)}%.
                  </p>
                  <p className="text-xs text-slate-300 mt-2">
                    Cause: Lingering zombie database connection locks from the prior build are still exhausting the pool.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                {onApplySecondaryFix && (
                  <button
                    type="button"
                    onClick={onApplySecondaryFix}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/30 transition cursor-pointer"
                  >
                    <span>Apply Secondary Fix: Flush DB Pool</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Unresolved telemetry details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-rose-800/40 font-mono text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-rose-900/40">
                <span className="text-slate-400 text-[11px] block">Active Error Rate</span>
                <span className="text-rose-400 font-bold text-base">{metrics.errorRate.toFixed(1)}%</span>
                <span className="text-[10px] text-rose-400 block">Above 1% threshold</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-rose-900/40">
                <span className="text-slate-400 text-[11px] block">Stuck Connections</span>
                <span className="text-rose-400 font-bold text-base">{metrics.databaseConnections} / {metrics.maxDatabaseConnections}</span>
                <span className="text-[10px] text-rose-400 block">Needs connection purge</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-rose-900/40">
                <span className="text-slate-400 text-[11px] block">Health Check</span>
                <span className="text-rose-400 font-bold text-base">FAILING (500)</span>
                <span className="text-[10px] text-rose-400 block">Synthetic tests timed out</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
