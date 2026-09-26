import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  AlertTriangle,
  GitCommit,
  GitPullRequest,
  Database,
  Layers,
  Activity,
  Terminal,
} from 'lucide-react';
import { ForensicEvidencePackage } from '../types/incident';

interface EvidenceVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: ForensicEvidencePackage;
}

export const EvidenceVaultModal: React.FC<EvidenceVaultModalProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'git' | 'metrics' | 'dependencies'>('all');

  if (!isOpen) return null;

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(evidence.checksum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(evidence, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_evidence_${evidence.incidentId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Forensic Evidence Vault</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {evidence.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographic evidence collection with integrity seal & git diffs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cryptographic Checksum Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Integrity Checksum:</span>
            <span className="text-emerald-300 truncate select-all">{evidence.checksum}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyChecksum}
              className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 text-[11px]">Collected: {new Date(evidence.collectedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center space-x-4 bg-slate-900/60">
          {(['all', 'git', 'metrics', 'dependencies'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all'
                ? 'All Forensics'
                : tab === 'git'
                ? 'Git & Code Diff'
                : tab === 'metrics'
                ? 'Telemetry Deltas'
                : 'Dependency Map'}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Section: Git Commit Forensics & Diff */}
          {(activeTab === 'all' || activeTab === 'git') && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <GitCommit className="w-4 h-4 text-indigo-400" />
                  <span>Suspect Code Change & Deployment PR</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {evidence.gitForensics.changedFilesCount} files modified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Commit Hash:</span>
                  <span className="text-indigo-300 font-bold">#{evidence.gitForensics.commitHash}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Author:</span>
                  <span className="text-slate-200">{evidence.gitForensics.author}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Deployed At:</span>
                  <span className="text-slate-200">{evidence.gitForensics.deployTimestamp}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-medium">
                <strong className="text-white">Pull Request:</strong> {evidence.gitForensics.pullRequest}
              </div>

              {/* Code Diff Highlight */}
              <div className="mt-2">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Regression Diff Snippet (Sequelize Connection Leak):
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-rose-950/60 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border-l-4 border-l-rose-500">
                  {evidence.gitForensics.diffSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* Section: Telemetry & Metric Anomalies */}
          {(activeTab === 'all' || activeTab === 'metrics') && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-300 pb-2 border-b border-slate-800">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Forensic Metric Anomalies (Baseline vs Incident Peak)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidence.metricAnomalies.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 font-sans">{m.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {m.severity}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-slate-400 text-[11px] mt-2">
                      <span>Baseline: <strong className="text-slate-300">{m.baseline}</strong></span>
                      <span>Peak: <strong className="text-rose-400">{m.incidentPeak}</strong></span>
                    </div>
                    <div className="mt-1 text-right text-[11px] font-bold text-rose-400">
                      Delta: {m.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Critical Log Traces */}
          {activeTab === 'all' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-300 pb-2 border-b border-slate-800">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Correlated Stack Traces</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {evidence.criticalLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2">
                    <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
                    <span className="text-rose-400 font-bold shrink-0">[{log.service}]</span>
                    <span className="text-slate-300 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Dependency Health Map */}
          {(activeTab === 'all' || activeTab === 'dependencies') && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-300 pb-2 border-b border-slate-800">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Upstream & Downstream Dependency Health Map</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {evidence.dependencyHealth.map((dep, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        dep.status === 'HEALTHY' ? 'bg-emerald-400' : dep.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span className="text-white font-bold">{dep.name}</span>
                      <span className="text-slate-500 text-[11px]">({dep.type})</span>
                    </div>

                    <div className="flex items-center space-x-4 text-[11px]">
                      <span className="text-slate-400">{dep.connectionsUsed}</span>
                      <span className="text-indigo-300 font-bold">{dep.latencyMs}ms</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        dep.status === 'HEALTHY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {dep.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forensic Evidence Immutable • Verified</span>
          </span>
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
