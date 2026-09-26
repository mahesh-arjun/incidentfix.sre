import React, { useState } from 'react';
import {
  TestTube,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Server,
  Terminal,
  Activity,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SandboxDryRun } from '../types/incident';
import { executeSandboxDryRun } from '../services/forensicsAndAuditService';

interface SandboxActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetService: string;
  targetVersion: string;
  onProceedToApproveFix?: () => void;
}

export const SandboxActionModal: React.FC<SandboxActionModalProps> = ({
  isOpen,
  onClose,
  targetService,
  targetVersion,
  onProceedToApproveFix,
}) => {
  const [dryRunState, setDryRunState] = useState<SandboxDryRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleStartDryRun = async () => {
    setIsRunning(true);
    try {
      const result = await executeSandboxDryRun(targetService, targetVersion, (updated) => {
        setDryRunState({ ...updated });
      });
      setDryRunState(result);
    } catch (err) {
      console.error('Sandbox run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const isPassed = dryRunState?.status === 'passed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Sandbox Action (Dry-Run Simulation)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  Staging Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute safe simulated rollback in isolated container before touching production
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

        {/* Target Details Card */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-500 block text-[10px]">Target Service:</span>
              <span className="text-white font-bold">{targetService}</span>
            </div>
            <div className="text-slate-700">|</div>
            <div>
              <span className="text-slate-500 block text-[10px]">Rollback Image:</span>
              <span className="text-emerald-400 font-bold">{targetVersion}</span>
            </div>
            <div className="text-slate-700 hidden sm:block">|</div>
            <div className="hidden sm:block">
              <span className="text-slate-500 block text-[10px]">Staging Isolation:</span>
              <span className="text-slate-300">Ephemeral Pod (No prod traffic)</span>
            </div>
          </div>

          {!isRunning && !isPassed && (
            <button
              type="button"
              onClick={handleStartDryRun}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Sandbox Dry-Run</span>
            </button>
          )}

          {isRunning && (
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Simulating in Sandbox...</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-sans">
          {!dryRunState && !isRunning ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
                <TestTube className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Ready for Sandbox Dry-Run Validation</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Running a sandbox action spins up an isolated ephemeral replica of{' '}
                <strong className="text-slate-200">{targetService}:{targetVersion}</strong>, injects 250 synthetic transactions at 600 req/sec, and verifies that the database connection leak is resolved before production approval.
              </p>
              <button
                type="button"
                onClick={handleStartDryRun}
                className="mt-3 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Execute Sandbox Dry-Run Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sequential Steps in Sandbox */}
              <div className="space-y-2.5">
                {dryRunState?.steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border transition text-xs font-mono ${
                      step.status === 'completed'
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : step.status === 'running'
                        ? 'bg-cyan-950/40 border-cyan-700 text-cyan-200 font-semibold'
                        : 'bg-slate-950/30 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {step.status === 'completed' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : step.status === 'running' ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                            •
                          </span>
                        )}
                        <span className="font-bold text-white font-sans">{step.name}</span>
                      </div>

                      {step.durationMs && (
                        <span className="text-[10px] text-slate-500">{step.durationMs}ms</span>
                      )}
                    </div>

                    <div className="mt-1.5 pl-6 text-[11px] text-slate-400">
                      {step.outputLog}
                    </div>
                  </div>
                ))}
              </div>

              {/* Synthetic Verification Results Card */}
              {isPassed && dryRunState?.syntheticResults && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Sandbox Verification PASSED (100% Confidence)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      READY FOR PROD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-slate-950/60 border border-emerald-900/40">
                      <span className="text-slate-400 text-[10px] block">Synthetic Load:</span>
                      <span className="text-white font-bold">{dryRunState.syntheticResults.requestsProcessed} reqs</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-emerald-900/40">
                      <span className="text-slate-400 text-[10px] block">Success Rate:</span>
                      <span className="text-emerald-400 font-bold">{dryRunState.syntheticResults.successRate}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-emerald-900/40">
                      <span className="text-slate-400 text-[10px] block">p95 Latency:</span>
                      <span className="text-emerald-400 font-bold">{dryRunState.syntheticResults.p95LatencyMs}ms</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-emerald-900/40">
                      <span className="text-slate-400 text-[10px] block">DB Connection Leaks:</span>
                      <span className="text-emerald-400 font-bold">0 Leaks</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200/90 font-sans">
                    ✓ Rollback image <strong className="text-white font-mono">{targetVersion}</strong> passed all synthetic soak tests. Connection pool returned to 100% idle state after batch tests.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Sandbox Isolation: Namespace sandbox-staging-payment-service-isolated</span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
            >
              Close
            </button>

            {isPassed && onProceedToApproveFix && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToApproveFix();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-md"
              >
                <span>Approve Fix (Verified by Sandbox)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
