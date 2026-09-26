import React from 'react';
import { GitCommit, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { Deployment } from '../types/incident';

interface RecentDeploymentsProps {
  deployments: Deployment[];
}

export const RecentDeployments: React.FC<RecentDeploymentsProps> = ({ deployments }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Deployments</h3>
        </div>
        <span className="text-xs text-slate-400">CI/CD Production Log</span>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-72 pr-1">
        {deployments.map((dep) => (
          <div
            key={dep.id}
            className={`p-3 rounded-xl border transition ${
              dep.isSuspect
                ? 'bg-amber-950/20 border-amber-800/80 ring-1 ring-amber-500/20'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {dep.version}
                </span>
                <span className="text-xs font-semibold text-indigo-300">
                  {dep.service}
                </span>
              </div>

              {dep.isSuspect ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>SUSPECT IN INCIDENT</span>
                </span>
              ) : dep.status === 'rolled_back' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  ROLLED BACK
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle className="w-3 h-3" />
                  <span>STABLE</span>
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-300 font-mono line-clamp-1">
              {dep.commitMessage}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{dep.author}</span>
                </span>
                <span className="text-slate-400 font-medium">#{dep.commitHash}</span>
              </div>
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{dep.deployedAt}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
