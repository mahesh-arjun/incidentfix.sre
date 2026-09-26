import React from 'react';
import { BellRing, Volume2, VolumeX, CheckCircle, Sparkles, Clock, Bot, Repeat } from 'lucide-react';
import { IncidentNotification } from '../types/notification';

interface NotificationBannerProps {
  notification: IncidentNotification | null;
  secondsRemaining: number;
  isAlarmSounding: boolean;
  soundEnabled: boolean;
  onCheckNotification: () => void;
  onToggleSound: () => void;
  onTestSound: () => void;
  onIncrementRepeat?: () => void;
  onTriggerAutoResolve?: () => void;
  repeatThreshold?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  secondsRemaining,
  isAlarmSounding,
  soundEnabled,
  onCheckNotification,
  onToggleSound,
  onTestSound,
  onIncrementRepeat,
  onTriggerAutoResolve,
  repeatThreshold = 5,
}) => {
  if (!notification || notification.checked) return null;

  const repeatCount = notification.repeatCount || 1;
  const isThresholdMet = repeatCount >= repeatThreshold;

  return (
    <div
      role="alert"
      className={`border-b transition-all duration-300 relative z-20 ${
        isThresholdMet
          ? 'bg-purple-950/95 border-purple-500 shadow-xl shadow-purple-950/60 ring-2 ring-purple-500/50'
          : isAlarmSounding
          ? 'bg-rose-950/95 border-rose-500 shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/50'
          : 'bg-amber-950/90 border-amber-600/80 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left section: Icon + Message */}
          <div className="flex items-start sm:items-center space-x-3">
            <div
              className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                isThresholdMet
                  ? 'bg-purple-500 text-white animate-pulse ring-4 ring-purple-500/30'
                  : isAlarmSounding
                  ? 'bg-rose-500 text-white animate-bounce ring-4 ring-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              }`}
            >
              {isThresholdMet ? <Bot className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span
                  className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                    isThresholdMet
                      ? 'bg-purple-500 text-white animate-pulse'
                      : isAlarmSounding
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  {isThresholdMet
                    ? '🤖 REPEAT THRESHOLD (>5) HIT • AUTO-RESOLVE ENGAGED'
                    : isAlarmSounding
                    ? '🔊 UNCHECKED ALERT SOUND ACTIVE'
                    : '🚨 NEW INCIDENT DETECTED'}
                </span>

                {/* Repeat counter badge */}
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1 ${
                    repeatCount >= repeatThreshold
                      ? 'bg-purple-950 text-purple-300 border-purple-700'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  <Repeat className="w-3 h-3 text-cyan-400" />
                  <span>Repeats: <strong className={repeatCount >= repeatThreshold ? 'text-white' : 'text-amber-400'}>{repeatCount}/{repeatThreshold}</strong></span>
                </span>

                <span className="text-xs font-mono text-slate-400">
                  {notification.timestamp} • [{notification.service}]
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 tracking-tight flex items-center space-x-2">
                <span>{notification.title}</span>
              </h4>

              <p className="text-xs text-slate-300 mt-0.5 font-medium line-clamp-1">
                {isThresholdMet
                  ? 'Notification has repeated 5+ times. The autonomous bug checker & auto-resolve program is activated.'
                  : notification.message}
              </p>
            </div>
          </div>

          {/* Right section: Actions & Repeat Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 self-end lg:self-center shrink-0 flex-wrap gap-y-2">
            {/* Quick Simulate Repeat Button */}
            {onIncrementRepeat && (
              <button
                type="button"
                onClick={onIncrementRepeat}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition"
                title="Simulate this notification repeating again (+1)"
              >
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                <span>Repeat +1</span>
              </button>
            )}

            {/* Fast Trigger 5x Auto-Resolve */}
            {onTriggerAutoResolve && (
              <button
                type="button"
                onClick={onTriggerAutoResolve}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600 text-xs font-bold transition shadow"
                title="Simulate hitting 5 repeats immediately to trigger auto-resolve & bug check"
              >
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                <span>Test 5x Auto-Resolve</span>
              </button>
            )}

            {/* Escalation countdown status */}
            {!isAlarmSounding && secondsRemaining > 0 && !isThresholdMet && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-900/60 border border-amber-700/60 text-amber-200 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Alert sound in <strong className="text-white text-sm">{secondsRemaining}s</strong></span>
              </div>
            )}

            {isAlarmSounding && !isThresholdMet && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-900/80 border border-rose-500 text-rose-100 text-xs font-mono font-bold animate-pulse">
                <Volume2 className="w-4 h-4 text-rose-300" />
                <span>BEEPING ON</span>
              </div>
            )}

            {/* Check Notification / Acknowledge Button */}
            <button
              type="button"
              onClick={onCheckNotification}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer ${
                isThresholdMet
                  ? 'bg-white hover:bg-slate-100 text-purple-950 font-extrabold'
                  : isAlarmSounding
                  ? 'bg-white hover:bg-slate-100 text-rose-900 ring-2 ring-white/80'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
              }`}
              title="Click to check notification, silence sound, and acknowledge"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Check Notification</span>
            </button>

            {/* Sound Toggle (Mute / Unmute) */}
            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition"
              title={soundEnabled ? 'Disable alert sound' : 'Enable alert sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Visual Progress Bar for countdown */}
        {!isAlarmSounding && secondsRemaining > 0 && !isThresholdMet && (
          <div className="mt-2.5 w-full bg-amber-950/60 rounded-full h-1 overflow-hidden border border-amber-800/40">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, (secondsRemaining / 10) * 100))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
