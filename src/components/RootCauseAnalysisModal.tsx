import React from 'react';
import {
  Sparkles,
  X,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowDown,
  ShieldAlert,
  GitBranch,
} from 'lucide-react';
import { RootCauseAnalysisDetail } from '../types/incident';

interface RootCauseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  rca: RootCauseAnalysisDetail;
}

export const RootCauseAnalysisModal: React.FC<RootCauseAnalysisModalProps> = ({
  isOpen,
  onClose,
  rca,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Root Cause Analysis (RCA Engine)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {rca.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                5-Whys causal hierarchy, fault mechanism & impact blast radius
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

        {/* RCA Summary Card */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950/40 border-b border-slate-800">
          <div className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">
            Confirmed Root Mechanism:
          </div>
          <p className="text-base sm:text-lg font-bold text-white leading-snug">
            “{rca.rootMechanism}”
          </p>
          <p className="text-xs text-slate-300 mt-2">
            Identified by correlating CI/CD commit #8f3e2a1 with PostgreSQL pool acquisition timeouts and upstream gateway drops.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 font-sans">
          {/* 5-Whys Causal Ladder */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>5-Whys Systematic Causal Breakdown</span>
            </div>

            <div className="space-y-3 pt-1">
              {rca.fiveWhys.map((why, idx) => (
                <div key={why.step} className="relative">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition">
                    <div className="flex items-center justify-between text-xs font-mono text-indigo-400 mb-1">
                      <span className="font-bold uppercase tracking-wider">
                        {why.step === 5 ? '🎯 ROOT CAUSE (WHY 5)' : `WHY LEVEL 0${why.step}`}
                      </span>
                      <span className="text-[11px] text-slate-500">{why.evidenceLink}</span>
                    </div>

                    <div className="font-semibold text-slate-200 text-xs sm:text-sm mb-1.5 font-sans">
                      Q: {why.whyQuestion}
                    </div>

                    <div className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <strong className="text-white">Answer: </strong>
                      {why.answer}
                    </div>
                  </div>

                  {idx < rca.fiveWhys.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="w-4 h-4 text-indigo-500/60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Impact Radius Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-300 pb-2 border-b border-slate-800">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>Blast Radius & Service Impact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Services Affected:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {rca.impactRadius.affectedServices.map((svc) => (
                    <span key={svc} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold text-[10px]">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Failed Transactions:</span>
                <span className="text-rose-400 font-bold text-base block mt-0.5">
                  ~{rca.impactRadius.failedTransactionsEstimate} orders
                </span>
                <span className="text-[10px] text-slate-500">During 14m window</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Latency Degradation:</span>
                <span className="text-amber-400 font-bold text-base block mt-0.5">
                  1,420ms (p99)
                </span>
                <span className="text-[10px] text-slate-500">+3,086% over baseline</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 font-sans bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200">Customer Impact: </strong>
              {rca.impactRadius.userImpactDescription}
            </p>
          </div>

          {/* Preventative Measures */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Preventative Safeguards</span>
            </div>

            <ul className="space-y-2">
              {rca.preventativeMeasures.map((measure, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>IncidentFix RCA Engine • Formatted for SRE Incident Review</span>
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
