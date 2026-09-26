import React from 'react';
import { ShieldAlert, RefreshCw, Bell, Volume2, VolumeX, BellRing, Server, Monitor } from 'lucide-react';
import { IncidentState } from '../types/incident';

interface HeaderProps {
  incidentState: IncidentState;
  onReset: () => void;
  systemName?: string;
  uncheckedNotificationsCount: number;
  isAlarmSounding: boolean;
  soundEnabled: boolean;
  executionMode: 'in_app' | 'backend';
  onToggleExecutionMode: () => void;
  onToggleSound: () => void;
  onOpenNotificationCenter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidentState,
  onReset,
  systemName = 'production-us-east-1',
  uncheckedNotificationsCount,
  isAlarmSounding,
  soundEnabled,
  executionMode,
  onToggleExecutionMode,
  onToggleSound,
  onOpenNotificationCenter,
}) => {
  const isHealthy = incidentState === 'resolved' || incidentState === 'idle';
  const isBusy = incidentState === 'analyzing' || incidentState === 'applying_fix' || incidentState === 'verifying';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">IncidentFix AI</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700/80">
                SRE Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Automated incident diagnosis & safe remediation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Execution Engine Selector Button (Backend Program vs In-App Program) */}
          <button
            type="button"
            onClick={onToggleExecutionMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              executionMode === 'backend'
                ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={`Current engine: ${executionMode === 'backend' ? 'Backend Program' : 'In-App Program'}. Click to toggle.`}
          >
            {executionMode === 'backend' ? (
              <>
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Backend Program</span>
                <span className="sm:hidden">Backend</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">In-App Program</span>
                <span className="sm:hidden">In-App</span>
              </>
            )}
          </button>

          {/* Notification Software Bell */}
          <button
            type="button"
            onClick={onOpenNotificationCenter}
            className={`relative p-2 rounded-xl border transition flex items-center space-x-1.5 ${
              isAlarmSounding
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/50 animate-bounce'
                : uncheckedNotificationsCount > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Open Notification Software Center & Alert History"
          >
            {isAlarmSounding ? (
              <BellRing className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}

            {uncheckedNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white border-2 border-slate-900 shadow">
                {uncheckedNotificationsCount}
              </span>
            )}
            <span className="text-xs font-semibold hidden md:inline">Alerts</span>
          </button>

          {/* Quick Sound Mute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-rose-950/40 border-rose-900 text-rose-400'
            }`}
            title={soundEnabled ? 'Alert sound enabled. Click to mute' : 'Alert sound muted. Click to enable'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Environment & Live Heartbeat */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs hidden lg:flex">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className="text-slate-300 font-mono">{systemName}</span>
            <span className="text-slate-500">|</span>
            <span className={`font-semibold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isHealthy ? 'OPERATIONAL' : 'INCIDENT ACTIVE'}
            </span>
          </div>

          {/* Reset / New Incident Button */}
          <button
            onClick={onReset}
            disabled={isBusy}
            title="Reset to fresh incident state"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
