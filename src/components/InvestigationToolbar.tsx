import React from 'react';
import {
  FileText,
  Sparkles,
  TestTube,
  Award,
  ShieldCheck,
  ChevronRight,
  Bot,
} from 'lucide-react';

interface InvestigationToolbarProps {
  onOpenEvidence: () => void;
  onOpenRCA: () => void;
  onOpenSandbox: () => void;
  onOpenAuditEvaluation: () => void;
  onOpenAutoResolve?: () => void;
  hasAnalyzed: boolean;
  isResolved: boolean;
}

export const InvestigationToolbar: React.FC<InvestigationToolbarProps> = ({
  onOpenEvidence,
  onOpenRCA,
  onOpenSandbox,
  onOpenAuditEvaluation,
  onOpenAutoResolve,
  hasAnalyzed,
  isResolved,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            SRE Deep Investigation & Safety Tools
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400 border border-slate-700">
            Forensics, Sandbox & Auto-Resolve Active
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Forensic verification, dry-run simulation, audit evaluations & autonomous bug healer
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Collect Evidence */}
        <button
          type="button"
          onClick={onOpenEvidence}
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">SHA-256</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center justify-between">
              <span>Collect Evidence</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
              Logs, git diffs & metrics package
            </p>
          </div>
        </button>

        {/* 2. Root Cause Analysis */}
        <button
          type="button"
          onClick={onOpenRCA}
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">5-WHYS</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition flex items-center justify-between">
              <span>Root Cause Analysis</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
              Causal ladder & blast radius
            </p>
          </div>
        </button>

        {/* 3. Sandbox Action (Dry-Run) */}
        <button
          type="button"
          onClick={onOpenSandbox}
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-teal-500/50 hover:bg-teal-950/20 transition flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 group-hover:scale-105 transition">
              <TestTube className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-teal-400 font-bold">DRY-RUN</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-teal-300 transition flex items-center justify-between">
              <span>Sandbox Action</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
              Simulated rollback & soak test
            </p>
          </div>
        </button>

        {/* 4. Audit Trail Evaluation */}
        <button
          type="button"
          onClick={onOpenAuditEvaluation}
          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/50 hover:bg-purple-950/20 transition flex flex-col justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold">GRADE A+</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-300 transition flex items-center justify-between">
              <span>Audit Evaluation</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
              SLA, compliance & post-mortem
            </p>
          </div>
        </button>

        {/* 5. Auto-Resolve & Bug Healer Daemon */}
        {onOpenAutoResolve && (
          <button
            type="button"
            onClick={onOpenAutoResolve}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-fuchsia-500/50 hover:bg-fuchsia-950/20 transition flex flex-col justify-between text-left group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 group-hover:scale-105 transition">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-fuchsia-400 font-bold">&gt;5 REPEATS</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition flex items-center justify-between">
                <span>Auto-Resolve Daemon</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                Check bugs & auto-resolve
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
