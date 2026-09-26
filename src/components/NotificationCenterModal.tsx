import React, { useState } from 'react';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Play,
  Sliders,
  History,
  Server,
  Monitor,
  Activity,
  ShieldAlert,
  Bot,
  Repeat,
  Bug,
} from 'lucide-react';
import { IncidentNotification, NotificationSettings, AlertHistoryEntry } from '../types/notification';
import { AlertHistoryView } from './AlertHistoryView';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: IncidentNotification[];
  alertHistory: AlertHistoryEntry[];
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: Partial<NotificationSettings>) => void;
  onCheckNotification: (id: string) => void;
  onSimulateNewIssue: () => void;
  onIncrementRepeat?: (id: string) => void;
  onTrigger5xAutoResolve?: (id: string) => void;
  onTestSound: () => void;
  onClearHistory: () => void;
  onExportCSV: () => void;
  onRefreshHistory: () => void;
  isAlarmSounding: boolean;
  backendOnline: boolean;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  alertHistory,
  settings,
  onUpdateSettings,
  onCheckNotification,
  onSimulateNewIssue,
  onIncrementRepeat,
  onTrigger5xAutoResolve,
  onTestSound,
  onClearHistory,
  onExportCSV,
  onRefreshHistory,
  isAlarmSounding,
  backendOnline,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');

  if (!isOpen) return null;

  const handleRequestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      onUpdateSettings({ browserNotificationsEnabled: perm === 'granted' });
      if (perm === 'granted') {
        new Notification('IncidentFix AI Notifications Enabled', {
          body: 'You will receive immediate alerts when software issues occur.',
        });
      }
    }
  };

  const uncheckedCount = notifications.filter((n) => !n.checked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Incident Notification Software</h3>
                {uncheckedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                    {uncheckedCount} unchecked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Automated alert dispatch, audio escalation, auto-resolve (&gt;5 repeats) & permanent audit log
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

        {/* Execution Mode Selector Bar (Backend Program vs In-App Program) */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              Execution Engine:
            </span>
            <div className="flex p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => onUpdateSettings({ executionMode: 'in_app' })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  settings.executionMode === 'in_app'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>In-App (Browser)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ executionMode: 'backend' })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  settings.executionMode === 'backend'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Backend Program</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backendOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backendOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {settings.executionMode === 'backend'
                ? backendOnline
                  ? 'Backend API Online (/api/alerts)'
                  : 'Connecting to Backend Server...'
                : 'Running In-App Client Engine'}
            </span>
          </div>
        </div>

        {/* Tab Switcher: Alerts vs Alert History */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'alerts'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Active Alerts & Settings</span>
            {uncheckedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {uncheckedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              onRefreshHistory();
            }}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Alert History (Audit Log)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {alertHistory.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">
          {activeTab === 'alerts' ? (
            <div className="space-y-6">
              {/* 🤖 NEW: Auto-Resolve & Bug Checking Settings Card */}
              <div className="bg-purple-950/30 border border-purple-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/60">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                      Autonomous Auto-Resolve & Bug Healer Daemon
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900 text-purple-200 border border-purple-700">
                    &gt; 5 REPEATS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-200 block">Auto-Resolve on Repeats</span>
                      <span className="text-[11px] text-slate-400">Scan & resolve bugs if alert repeats &gt; 5x</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ autoResolveEnabled: !settings.autoResolveEnabled })}
                      className={`p-2 rounded-xl transition ${
                        settings.autoResolveEnabled
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {settings.autoResolveEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Repeat Threshold</span>
                      <span className="font-mono text-purple-300 font-bold">{settings.repeatThreshold} Repeats</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {[3, 5, 8, 10].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onUpdateSettings({ repeatThreshold: t })}
                          className={`flex-1 py-1 rounded text-xs font-mono font-medium transition ${
                            settings.repeatThreshold === t
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {t}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-purple-300/80 flex items-center space-x-1.5 pt-1">
                  <Bug className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    When notification count reaches {settings.repeatThreshold}, the program will automatically diagnose software bugs (connection leaks, deadlocks), apply patches, and auto-resolve the incident.
                  </span>
                </div>
              </div>

              {/* Alert Sound Escalation Rules Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Alert Sound Escalation Rules
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={onTestSound}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>Test Alert Sound</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Sound Enabled Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-200 block">Alert Sound System</span>
                      <span className="text-[11px] text-slate-400">Sound alarm if notification unchecked</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                      className={`p-2 rounded-xl transition ${
                        settings.soundEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Timeout delay */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Unchecked Escalation Delay</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {settings.escalationTimeoutSeconds === 0 ? 'Immediate' : `${settings.escalationTimeoutSeconds}s`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[0, 5, 8, 15].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => onUpdateSettings({ escalationTimeoutSeconds: sec })}
                          className={`flex-1 py-1 rounded text-xs font-mono font-medium transition ${
                            settings.escalationTimeoutSeconds === sec
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {sec === 0 ? '0s' : `${sec}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Notification Integration */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">Desktop browser notifications:</span>
                  <button
                    type="button"
                    onClick={handleRequestBrowserPermission}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition"
                  >
                    {settings.browserNotificationsEnabled ? '✓ Granted' : 'Enable Desktop Alerts'}
                  </button>
                </div>
              </div>

              {/* Quick Simulation Trigger */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
                <div>
                  <span className="text-sm font-bold text-white block">Test Issue Trigger</span>
                  <span className="text-xs text-slate-300">
                    Dispatch an incident notification ({settings.executionMode === 'backend' ? 'via Backend API' : 'In-App Engine'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateNewIssue();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition shrink-0 cursor-pointer"
                >
                  Simulate New Issue
                </button>
              </div>

              {/* Active Notifications Delivery List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Dispatched Alerts & Repeat Counters
                </h4>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active incident notifications.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 rounded-xl border transition ${
                          !notif.checked
                            ? (notif.repeatCount || 1) >= settings.repeatThreshold
                              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50'
                              : isAlarmSounding
                              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                              : 'bg-amber-950/30 border-amber-600/80'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  !notif.checked
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {notif.severity}
                              </span>

                              {/* Repeats pill */}
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300 flex items-center space-x-1">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>Repeats: {notif.repeatCount || 1}/{settings.repeatThreshold}</span>
                              </span>

                              <span className="font-semibold text-sm text-white">{notif.title}</span>
                              <span className="text-xs text-slate-500 font-mono">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            {/* Fast repeat tester */}
                            {!notif.checked && onIncrementRepeat && (
                              <button
                                type="button"
                                onClick={() => onIncrementRepeat(notif.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition"
                                title="Increment repeat count by 1"
                              >
                                +1 Repeat
                              </button>
                            )}

                            {/* Trigger 5x Auto-Resolve */}
                            {!notif.checked && onTrigger5xAutoResolve && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onTrigger5xAutoResolve(notif.id);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold border border-purple-700 transition flex items-center space-x-1"
                                title="Force 5 repeats to trigger autonomous bug check and auto-resolve"
                              >
                                <Bot className="w-3 h-3 text-purple-400" />
                                <span>5x Auto-Resolve</span>
                              </button>
                            )}

                            {!notif.checked ? (
                              <button
                                type="button"
                                onClick={() => onCheckNotification(notif.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
                              >
                                Check
                              </button>
                            ) : (
                              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{notif.autoResolved ? 'Auto-Resolved' : 'Checked'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Permanent Alert History (Audit Log) */
            <AlertHistoryView
              history={alertHistory}
              onClearHistory={onClearHistory}
              onExportCSV={onExportCSV}
              onRefresh={onRefreshHistory}
              executionMode={settings.executionMode}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>IncidentFix AI Audit Software</span>
            <span>•</span>
            <span className="font-mono text-slate-500">Auto-Resolve Daemon: Enabled</span>
          </div>
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
