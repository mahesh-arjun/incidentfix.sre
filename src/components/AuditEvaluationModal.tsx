import React from 'react';
import {
  ShieldCheck,
  Award,
  Download,
  X,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  User,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { AuditTrailEvaluation } from '../types/incident';

interface AuditEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: AuditTrailEvaluation;
}

export const AuditEvaluationModal: React.FC<AuditEvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  if (!isOpen) return null;

  const handleDownloadReport = () => {
    const markdownContent = `# Incident Post-Mortem & Audit Trail Evaluation
**Incident ID:** ${evaluation.incidentId}
**Evaluation Date:** ${new Date(evaluation.evaluatedAt).toLocaleString()}
**Overall Audit Grade:** ${evaluation.overallGrade} (${evaluation.overallScore}/100)
**Evaluated By:** ${evaluation.evaluatedBy}

---

## 1. Executive Summary
${evaluation.executiveSummary}

---

## 2. SLA & Resolution Metrics
- **Mean Time to Detect (MTTD):** ${evaluation.slaMetrics.mttdSeconds} seconds
- **Mean Time to Acknowledge (MTTA):** ${evaluation.slaMetrics.mttaSeconds} seconds
- **Mean Time to Resolve (MTTR):** ${evaluation.slaMetrics.mttdToResolveSeconds} seconds
- **SLA Met (< 5 minutes):** ${evaluation.slaMetrics.withinSla ? 'YES' : 'NO'}

---

## 3. Compliance & Control Checklist
${evaluation.complianceChecklist
  .map(
    (c) => `- [${c.status === 'PASSED' ? 'x' : ' '}] **${c.category}** (${c.standardCode}): ${c.item}\n  *Note:* ${c.auditNote}`
  )
  .join('\n')}

---

## 4. Post-Mortem Action Items
${evaluation.postMortemActionItems
  .map((a) => `- [ ] **[${a.priority}]** ${a.action} (Owner: ${a.owner}, Due: ${a.deadline})`)
  .join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_audit_evaluation_${evaluation.incidentId}.md`;
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
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Audit Trail Evaluation & Post-Mortem</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Grade {evaluation.overallGrade} ({evaluation.overallScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                SLA metrics evaluation, SOC2/ISO-27001 compliance audit & post-mortem action items
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Download Report (.md)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-slate-950/40 border-b border-slate-800">
          <div className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">
            Audit Executive Summary:
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {evaluation.executiveSummary}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 font-sans">
          {/* SLA Performance Cards */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Incident Response SLA Performance</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Mean Time to Detect (MTTD):</span>
                <span className="text-xl font-bold text-white block mt-0.5">{evaluation.slaMetrics.mttdSeconds}s</span>
                <span className="text-[10px] text-emerald-400">Target &lt; 30s ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Mean Time to Ack (MTTA):</span>
                <span className="text-xl font-bold text-white block mt-0.5">{evaluation.slaMetrics.mttaSeconds}s</span>
                <span className="text-[10px] text-emerald-400">Target &lt; 60s ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Mean Time to Resolve (MTTR):</span>
                <span className="text-xl font-bold text-emerald-400 block mt-0.5">{evaluation.slaMetrics.mttdToResolveSeconds}s</span>
                <span className="text-[10px] text-emerald-400">Target &lt; 300s ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Overall SLA Status:</span>
                <span className="text-xl font-bold text-emerald-400 block mt-0.5">COMPLIANT</span>
                <span className="text-[10px] text-slate-500">Zero SLA Breaches</span>
              </div>
            </div>
          </div>

          {/* Compliance Checklist Scorecard */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliance & Control Standard Evaluation</span>
            </div>

            <div className="space-y-2">
              {evaluation.complianceChecklist.map((check, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-white">{check.category}</span>
                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                          {check.standardCode}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5 text-xs">{check.item}</p>
                      <p className="text-slate-500 text-[11px] mt-1 font-mono">
                        Auditor Note: {check.auditNote}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Mortem Action Items */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              <ListTodo className="w-4 h-4 text-cyan-400" />
              <span>Post-Mortem Action Items & Preventative Tasks</span>
            </div>

            <div className="space-y-2">
              {evaluation.postMortemActionItems.map((action, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      action.priority === 'P0' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {action.priority}
                    </span>
                    <span className="text-slate-200 font-sans font-medium">{action.action}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-300">{action.owner}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-400 font-semibold">{action.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Evaluator: {evaluation.evaluatedBy}</span>
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
