import React, { useState } from 'react';
import {
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Wrench,
  Layers,
  AlertOctagon,
  TestTube,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult, IncidentState } from '../types/incident';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  incidentState: IncidentState;
  onApproveFix: (simulateFailure: boolean) => void;
  onRejectFix?: () => void;
  onOpenSandbox?: () => void;
  onOpenEvidence?: () => void;
  onOpenRCA?: () => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  incidentState,
  onApproveFix,
  onRejectFix,
  onOpenSandbox,
  onOpenEvidence,
  onOpenRCA,
}) => {
  const [simulateFailure, setSimulateFailure] = useState(false);
  const isAwaitingApproval = incidentState === 'analysis_ready' || incidentState === 'awaiting_approval';
  const isApplying = incidentState === 'applying_fix' || incidentState === 'verifying';

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Incident Analysis & Recommended Solution</h2>
            <p className="text-xs text-slate-400">Correlation synthesized from telemetry, deployments, and logs</p>
          </div>
        </div>

        {/* Quick Inspection Buttons */}
        <div className="flex items-center space-x-2">
          {onOpenEvidence && (
            <button
              type="button"
              onClick={onOpenEvidence}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Evidence</span>
            </button>
          )}

          {onOpenRCA && (
            <button
              type="button"
              onClick={onOpenRCA}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Whys RCA</span>
            </button>
          )}

          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
            AI Diagnostic Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Possible Cause & Why? */}
        <div className="space-y-5">
          {/* Possible Cause */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center space-x-1.5">
              <span>Possible Cause</span>
            </div>
            <p className="text-base sm:text-lg font-semibold text-white leading-snug">
              “{analysis.primaryCause}”
            </p>
          </div>

          {/* Why? */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why?</span>
            </div>
            <ul className="space-y-2.5">
              {analysis.whyExplanation.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Other possible causes */}
          {analysis.otherCauses && analysis.otherCauses.length > 0 && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Other possible causes</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {analysis.otherCauses.map((other, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-slate-600">•</span>
                    <span>{other}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Solution & Approval */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            {/* Recommended Solution */}
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Recommended Solution</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mb-2">
                “{analysis.recommendedSolution.title}”
              </p>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {analysis.recommendedSolution.description}
              </p>

              {/* Solution Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-emerald-900/40 font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Service:</span>
                  <span className="text-emerald-300 font-medium">{analysis.recommendedSolution.targetService}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Version:</span>
                  <span className="text-emerald-300 font-medium">{analysis.recommendedSolution.targetVersion || 'stable'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Safety Level:</span>
                  <span className="text-emerald-300 font-medium flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{analysis.recommendedSolution.safetyLevel}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expected Downtime:</span>
                  <span className="text-emerald-300 font-medium">{analysis.recommendedSolution.estimatedDowntime}</span>
                </div>
              </div>
            </div>

            {/* Approval Guardrail Notice */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-300">Human-In-The-Loop Safety Guard:</span>{' '}
                The app must wait for your explicit approval before any changes are applied to production.
              </div>
            </div>
          </div>

          {/* User Approval Action Area */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            {/* Simulation toggle for testing unresolved flow */}
            <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Simulation test mode:</span>
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  disabled={!isAwaitingApproval}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-800"
                />
                <span className="text-[11px]">Simulate "⚠️ Incident Still Active" (Unresolved)</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Optional Sandbox Dry-Run Button */}
              {onOpenSandbox && (
                <button
                  type="button"
                  onClick={onOpenSandbox}
                  disabled={!isAwaitingApproval || isApplying}
                  className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-teal-950 text-teal-300 hover:text-teal-200 text-xs sm:text-sm font-bold border border-slate-700 hover:border-teal-700 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Test rollback in isolated staging sandbox first"
                >
                  <TestTube className="w-4 h-4 text-teal-400" />
                  <span>Sandbox Dry-Run</span>
                </button>
              )}

              {/* Primary Approve Fix Button */}
              <button
                type="button"
                onClick={() => onApproveFix(simulateFailure)}
                disabled={!isAwaitingApproval || isApplying}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve Fix</span>
              </button>

              {onRejectFix && (
                <button
                  type="button"
                  onClick={onRejectFix}
                  disabled={!isAwaitingApproval || isApplying}
                  className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                >
                  Dismiss / Manual Action
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
