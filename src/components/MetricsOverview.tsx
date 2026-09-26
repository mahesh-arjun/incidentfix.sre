import React from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle2, Zap, Database } from 'lucide-react';
import { SystemMetrics, IncidentState } from '../types/incident';

interface MetricsOverviewProps {
  metrics: SystemMetrics;
  incidentState: IncidentState;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, incidentState }) => {
  const isHighError = metrics.errorRate > 1.0;
  const isHighLatency = metrics.responseTimeMs > 200;

  const getStatusBadge = () => {
    switch (incidentState) {
      case 'idle':
        return {
          label: 'Standby / Monitoring',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'analyzing':
        return {
          label: 'Diagnosing Root Cause...',
          bg: 'bg-amber-950/60 text-amber-300 border-amber-800 animate-pulse',
          dot: 'bg-amber-400',
        };
      case 'analysis_ready':
      case 'awaiting_approval':
        return {
          label: 'Awaiting Fix Approval',
          bg: 'bg-orange-950/60 text-orange-300 border-orange-800',
          dot: 'bg-orange-400',
        };
      case 'applying_fix':
        return {
          label: 'Applying Safe Remediation...',
          bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800 animate-pulse',
          dot: 'bg-cyan-400',
        };
      case 'verifying':
        return {
          label: 'Checking System Health...',
          bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-800 animate-pulse',
          dot: 'bg-indigo-400',
        };
      case 'resolved':
        return {
          label: 'Incident Resolved',
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
          dot: 'bg-emerald-400',
        };
      case 'unresolved':
        return {
          label: 'Incident Still Active',
          bg: 'bg-rose-950/60 text-rose-300 border-rose-800',
          dot: 'bg-rose-400',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Incident Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Incident Status</span>
          <AlertTriangle className={`w-4 h-4 ${incidentState === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div className="mt-1">
          <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-semibold ${statusBadge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span className="truncate">{statusBadge.label}</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 truncate">
          {incidentState === 'resolved' ? 'All telemetry normalized' : 'Automated tracking enabled'}
        </div>
      </div>

      {/* Error Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Error Rate</span>
          <Activity className={`w-4 h-4 ${isHighError ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${isHighError ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.errorRate.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isHighError ? 'CRITICAL' : 'NORMAL'}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>SLA Target: &lt; 0.10%</span>
          <span className={isHighError ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
            {isHighError ? '▲ +18.36%' : '▼ Normalized'}
          </span>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Response Time (p95)</span>
          <Clock className={`w-4 h-4 ${isHighLatency ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${isHighLatency ? 'text-amber-400' : 'text-emerald-400'}`}>
              {metrics.responseTimeMs}
            </span>
            <span className="text-xs text-slate-400 font-medium">ms</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target: &lt; 100ms</span>
          <span className={isHighLatency ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
            {isHighLatency ? 'Latency Spike' : 'Healthy'}
          </span>
        </div>
      </div>

      {/* DB Connection Pool / Throughput */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>DB Connection Pool</span>
          <Database className={`w-4 h-4 ${metrics.databaseConnections > 160 ? 'text-rose-400' : 'text-emerald-400'}`} />
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${metrics.databaseConnections > 160 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.databaseConnections}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {metrics.maxDatabaseConnections}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{metrics.throughputRps} req/s</span>
          <span className={metrics.databaseConnections > 160 ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
            {metrics.databaseConnections > 160 ? '99% Exhausted' : 'Normal load'}
          </span>
        </div>
      </div>
    </div>
  );
};
