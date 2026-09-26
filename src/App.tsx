import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { AutoResolveWatchdogBar } from './components/AutoResolveWatchdogBar';
import { AutoResolveModal } from './components/AutoResolveModal';
import { MetricsOverview } from './components/MetricsOverview';
import { IncidentLifecycleTimeline } from './components/IncidentLifecycleTimeline';
import { InvestigationToolbar } from './components/InvestigationToolbar';
import { IncidentInput } from './components/IncidentInput';
import { AnalysisCard } from './components/AnalysisCard';
import { FixExecutionProgress } from './components/FixExecutionProgress';
import { RecentLogs } from './components/RecentLogs';
import { RecentDeployments } from './components/RecentDeployments';
import { EvidenceVaultModal } from './components/EvidenceVaultModal';
import { RootCauseAnalysisModal } from './components/RootCauseAnalysisModal';
import { SandboxActionModal } from './components/SandboxActionModal';
import { AuditEvaluationModal } from './components/AuditEvaluationModal';
import {
  IncidentState,
  SystemMetrics,
  LogEntry,
  Deployment,
  AnalysisResult,
  IncidentLifecycleEvent,
} from './types/incident';
import {
  DEFAULT_INCIDENT_METRICS,
  INITIAL_DEPLOYMENTS,
  INITIAL_LOGS,
  HEALTHY_METRICS,
} from './data/mockMonitoring';
import { analyzeIncident, executeRemediation } from './services/incidentEngine';
import {
  IncidentNotification,
  NotificationSettings,
  AlertHistoryEntry,
  AutoResolveProgramState,
} from './types/notification';
import { alertSound } from './services/alertSoundService';
import { alertHistoryService } from './services/alertHistoryService';
import {
  executeAutoResolveProgram,
  getIncidentBugs,
} from './services/autoResolveDaemon';
import {
  collectEvidenceBundle,
  generateRootCauseAnalysis,
  evaluateIncidentAuditTrail,
} from './services/forensicsAndAuditService';

export default function App() {
  const [incidentQuery, setIncidentQuery] = useState('Payment API is failing.');
  const [incidentState, setIncidentState] = useState<IncidentState>('idle');
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_INCIDENT_METRICS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [deployments, setDeployments] = useState<Deployment[]>(INITIAL_DEPLOYMENTS);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Remediation & verification execution states
  const [executionStepIndex, setExecutionStepIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  // 🕒 Lifecycle Audit Timeline State
  const [incidentStartTime, setIncidentStartTime] = useState<number>(Date.now() - 45000);
  const [incidentResolvedTime, setIncidentResolvedTime] = useState<number | undefined>(undefined);

  // 🔬 Core Modals: Evidence, RCA, Sandbox, Audit Evaluation, AutoResolve
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isAuditEvaluationModalOpen, setIsAuditEvaluationModalOpen] = useState(false);
  const [isAutoResolveModalOpen, setIsAutoResolveModalOpen] = useState(false);

  // 🤖 Autonomous Auto-Resolve & Bug Healer Daemon State
  const [autoResolveState, setAutoResolveState] = useState<AutoResolveProgramState | null>(null);
  const [isAutoRepeatStreaming, setIsAutoRepeatStreaming] = useState(false);

  const [lifecycleAuditData, setLifecycleAuditData] = useState<{
    triggered: { timestamp: string; elapsed: string };
    analyzed?: { timestamp: string; elapsed: string };
    approved?: { timestamp: string; elapsed: string };
    applied?: { timestamp: string; elapsed: string };
    resolved?: { timestamp: string; elapsed: string };
  }>({
    triggered: {
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      elapsed: '+0s',
    },
  });

  // 🔔 Notification Software & Sound Alarm State
  const [notifications, setNotifications] = useState<IncidentNotification[]>([
    {
      id: 'notif-p0-initial',
      title: 'Payment API is failing',
      message: 'Critical error rate spike (18.4%) detected on /v1/charges. DB connection pool exhausted.',
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      checked: false,
      soundAlarmTriggered: false,
      service: 'payment-service',
      source: 'APM Monitor',
      repeatCount: 1,
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
    escalationTimeoutSeconds: 8, // Sound alarm activates if not checked within 8 seconds
    volume: 0.7,
    executionMode: 'in_app', // Default: 'in_app' or 'backend'
    autoResolveEnabled: true, // Auto-resolve when notification repeats > 5 times
    repeatThreshold: 5,
  });

  const [alertHistory, setAlertHistory] = useState<AlertHistoryEntry[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(8);

  const escalationTimerRef = useRef<number | null>(null);

  const executionSteps = [
    '1. Throttling non-critical traffic & locking CI/CD deployment pipeline',
    '2. Draining active connections from payment-service-v2.14.0 pods',
    '3. Reverting image manifest to stable release v2.13.9',
    '4. Recycling database connection pools & restarting healthy worker pods',
  ];

  // Helper to format elapsed time
  const getElapsedString = (fromTime: number) => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - fromTime) / 1000));
    return `+${elapsedSeconds}s`;
  };

  // The latest unchecked critical notification (if any)
  const activeUncheckedNotification = notifications.find((n) => !n.checked) || null;

  // Initialize and check backend daemon connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load alert history on mount or when execution mode changes
  const loadAlertHistory = async () => {
    const history = await alertHistoryService.getHistory(notificationSettings.executionMode);
    setAlertHistory(history);
  };

  useEffect(() => {
    loadAlertHistory();
  }, [notificationSettings.executionMode]);

  // Escalation Countdown & Alert Sound Trigger
  useEffect(() => {
    if (!activeUncheckedNotification || incidentState === 'resolved') {
      if (isAlarmSounding) {
        alertSound.stopAlarm();
        setIsAlarmSounding(false);
      }
      setSecondsRemaining(0);
      if (escalationTimerRef.current) {
        clearInterval(escalationTimerRef.current);
        escalationTimerRef.current = null;
      }
      return;
    }

    if (!activeUncheckedNotification.checked && !isAlarmSounding) {
      const elapsed = Math.floor((Date.now() - activeUncheckedNotification.createdAt) / 1000);
      const remaining = Math.max(0, notificationSettings.escalationTimeoutSeconds - elapsed);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (notificationSettings.soundEnabled && !isAlarmSounding) {
          alertSound.startAlarm();
          setIsAlarmSounding(true);

          alertHistoryService
            .recordEvent(
              {
                alertId: activeUncheckedNotification.id,
                eventType: 'ALARM_SOUNDED',
                service: activeUncheckedNotification.service,
                severity: activeUncheckedNotification.severity,
                title: activeUncheckedNotification.title,
                message: `Audio alert alarm triggered: notification was not checked within ${notificationSettings.escalationTimeoutSeconds}s`,
                actor: notificationSettings.executionMode === 'backend' ? 'Backend Escalator Daemon' : 'Audio Escalation Daemon',
                details: 'Sound alarm beeping until operator acknowledges or mutes.',
              },
              notificationSettings.executionMode
            )
            .then((entry) => setAlertHistory((prev) => [entry, ...prev]));
        }
      } else {
        if (escalationTimerRef.current) clearInterval(escalationTimerRef.current);

        escalationTimerRef.current = window.setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              if (escalationTimerRef.current) {
                clearInterval(escalationTimerRef.current);
                escalationTimerRef.current = null;
              }
              if (notificationSettings.soundEnabled) {
                alertSound.startAlarm();
                setIsAlarmSounding(true);

                alertHistoryService
                  .recordEvent(
                    {
                      alertId: activeUncheckedNotification.id,
                      eventType: 'ALARM_SOUNDED',
                      service: activeUncheckedNotification.service,
                      severity: activeUncheckedNotification.severity,
                      title: activeUncheckedNotification.title,
                      message: `Audio alert alarm triggered: notification was not checked within ${notificationSettings.escalationTimeoutSeconds}s`,
                      actor: notificationSettings.executionMode === 'backend' ? 'Backend Escalator Daemon' : 'Audio Escalation Daemon',
                      details: 'Sound alarm beeping until operator acknowledges or mutes.',
                    },
                    notificationSettings.executionMode
                  )
                  .then((entry) => setAlertHistory((prev) => [entry, ...prev]));
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (escalationTimerRef.current) {
        clearInterval(escalationTimerRef.current);
        escalationTimerRef.current = null;
      }
    };
  }, [
    activeUncheckedNotification,
    notificationSettings.soundEnabled,
    notificationSettings.escalationTimeoutSeconds,
    notificationSettings.executionMode,
    incidentState,
  ]);

  // Check / Acknowledge Notification
  const handleCheckNotification = async (id?: string) => {
    const wasAlarmActive = isAlarmSounding;
    alertSound.stopAlarm();
    setIsAlarmSounding(false);

    const target = notifications.find((n) => n.id === (id || activeUncheckedNotification?.id));
    const targetId = target ? target.id : (id || activeUncheckedNotification?.id);

    if (targetId) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === targetId ? { ...n, checked: true, checkedAt: Date.now() } : n
        )
      );

      const ttack = target ? Math.max(1, Math.round((Date.now() - target.createdAt) / 1000)) : undefined;

      const ackEntry = await alertHistoryService.recordEvent(
        {
          alertId: targetId,
          eventType: 'ACKNOWLEDGED',
          service: target?.service || 'payment-service',
          severity: target?.severity || 'CRITICAL',
          title: target?.title || 'Payment API is failing',
          message: 'Alert notification checked and acknowledged by operator',
          actor: 'Operator (On-Call SRE)',
          details: `User inspected incident details via ${notificationSettings.executionMode === 'backend' ? 'Backend API' : 'In-App Console'}.`,
          timeToAcknowledgeSeconds: ttack,
        },
        notificationSettings.executionMode
      );

      if (wasAlarmActive) {
        const silenceEntry = await alertHistoryService.recordEvent(
          {
            alertId: targetId,
            eventType: 'SILENCED',
            service: target?.service || 'payment-service',
            severity: target?.severity || 'CRITICAL',
            title: target?.title || 'Payment API is failing',
            message: 'Audio alarm silenced upon user acknowledgment',
            actor: 'Operator (On-Call SRE)',
            details: 'Sound alarm stopped immediately.',
          },
          notificationSettings.executionMode
        );
        setAlertHistory((prev) => [silenceEntry, ackEntry, ...prev]);
      } else {
        setAlertHistory((prev) => [ackEntry, ...prev]);
      }

      if (notificationSettings.executionMode === 'backend') {
        try {
          await fetch(`/api/alerts/${targetId}/ack`, { method: 'POST' });
        } catch (e) {
          console.warn('Backend ack failed:', e);
        }
      }
    }
  };

  // Toggle Alert Sound
  const handleToggleSound = async () => {
    const nextSound = !notificationSettings.soundEnabled;
    if (!nextSound && isAlarmSounding) {
      alertSound.stopAlarm();
      setIsAlarmSounding(false);

      if (activeUncheckedNotification) {
        const silenceEntry = await alertHistoryService.recordEvent(
          {
            alertId: activeUncheckedNotification.id,
            eventType: 'SILENCED',
            service: activeUncheckedNotification.service,
            severity: activeUncheckedNotification.severity,
            title: activeUncheckedNotification.title,
            message: 'Audio alert manually muted by operator',
            actor: 'Operator (Manual Mute)',
            details: 'Sound alarm muted via dashboard control.',
          },
          notificationSettings.executionMode
        );
        setAlertHistory((prev) => [silenceEntry, ...prev]);
      }
    }
    setNotificationSettings((prev) => ({ ...prev, soundEnabled: nextSound }));
  };

  // Test Sound
  const handleTestSound = () => {
    alertSound.playSingleChime();
  };

  // 🤖 EXECUTE AUTONOMOUS AUTO-RESOLVE & BUG REMEDIATION PROGRAM
  const handleExecuteAutoResolve = async (
    service: string = 'payment-service',
    repeatCount: number = 6,
    alertId?: string
  ) => {
    // Silence audio alarm immediately
    alertSound.stopAlarm();
    setIsAlarmSounding(false);
    setIsAutoRepeatStreaming(false);

    // Open the live Auto-Resolve daemon modal
    setIsAutoResolveModalOpen(true);

    // If backend mode is chosen, dispatch to backend program API
    if (notificationSettings.executionMode === 'backend') {
      try {
        await fetch('/api/alerts/auto-resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service }),
        });
      } catch (e) {
        console.warn('Backend auto-resolve call failed:', e);
      }
    }

    // Run the autonomous bug inspection & resolution pipeline
    const finalState = await executeAutoResolveProgram(
      service,
      repeatCount,
      (updatedState) => setAutoResolveState(updatedState)
    );

    // Mark notifications as checked and autoResolved
    setNotifications((prev) =>
      prev.map((n) =>
        !n.checked || n.service === service
          ? {
              ...n,
              checked: true,
              autoResolved: true,
              repeatCount: Math.max(repeatCount, n.repeatCount || 1),
            }
          : n
      )
    );

    // System metrics normalized to healthy SLA
    setMetrics(HEALTHY_METRICS);

    // Healing log injection
    setLogs((prev) => [
      {
        id: `daemon-log-1-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'auto-resolve-daemon',
        message: `[DAEMON COMPLETE] All ${finalState.bugs.length} software bugs checked & resolved: Sequelize try/finally leak patched, 182 stuck DB pool locks terminated, worker pods rolling restarted.`,
      },
      {
        id: `daemon-log-2-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'synthetic-probes',
        message: 'Autonomous synthetic probe passed: 100/100 requests returned HTTP 200 OK. Error rate: 0.02%, Latency: 44ms.',
      },
      ...prev,
    ]);

    // Deployments updated: rollback suspect image to stable
    setDeployments((prev) =>
      prev.map((d) => {
        if (d.version === 'v2.14.0') {
          return { ...d, status: 'rolled_back', isSuspect: false };
        }
        if (d.version === 'v2.13.9') {
          return { ...d, status: 'active' };
        }
        return d;
      })
    );

    // Incident officially closed
    setIncidentState('resolved');
    setIncidentResolvedTime(Date.now());

    // Timeline events stamped
    setLifecycleAuditData((prev) => ({
      ...prev,
      applied: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: getElapsedString(incidentStartTime),
      },
      resolved: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: getElapsedString(incidentStartTime),
      },
    }));

    // Audit logs recorded to permanent history
    const autoTriggerEntry = await alertHistoryService.recordEvent(
      {
        alertId: alertId || `alert-auto-${Date.now()}`,
        eventType: 'AUTO_RESOLVE_TRIGGERED',
        service,
        severity: 'CRITICAL',
        title: `Auto-Resolve Watchdog Activated (${service})`,
        message: `Notification repeated ${repeatCount} times (exceeded 5 repeats). Auto-resolve & bug remediation program executed.`,
        actor: notificationSettings.executionMode === 'backend' ? 'Backend Auto-Resolve Daemon' : 'In-App Watchdog Daemon',
        details: 'Repeat threshold exceeded (>5). Autonomous bug scanner diagnosed and fixed software bugs.',
      },
      notificationSettings.executionMode
    );

    const bugFixEntry = await alertHistoryService.recordEvent(
      {
        alertId: alertId || `alert-auto-${Date.now()}`,
        eventType: 'BUG_CHECK_RESOLVED',
        service,
        severity: 'INFO',
        title: 'All Software Bugs Inspected & Resolved',
        message: 'Fixed Sequelize connection leak, cleared 182 stuck DB pool connections, and rolling restarted worker pods.',
        actor: 'Autonomous Bug Healer Engine',
        details: 'All 3 detected bugs resolved; rollback v2.13.9 verified healthy.',
      },
      notificationSettings.executionMode
    );

    const resolvedEntry = await alertHistoryService.recordEvent(
      {
        alertId: alertId || `alert-auto-${Date.now()}`,
        eventType: 'RESOLVED',
        service,
        severity: 'INFO',
        title: `Incident Autonomously Resolved: ${service}`,
        message: 'Error rate dropped to 0.02%, response time normalized to 44ms. System verified 100% operational.',
        actor: notificationSettings.executionMode === 'backend' ? 'Backend Auto-Resolve Watchdog' : 'Autonomous Watchdog Daemon',
        details: 'Incident closed automatically after > 5 notification repeats were analyzed, bugs fixed, and SLA verified.',
      },
      notificationSettings.executionMode
    );

    setAlertHistory((prev) => [resolvedEntry, bugFixEntry, autoTriggerEntry, ...prev]);
  };

  // 🔁 Increment repeat count for active notification
  const handleIncrementRepeat = async (targetId?: string) => {
    const target = notifications.find((n) => n.id === (targetId || activeUncheckedNotification?.id));
    if (!target) return;

    const newCount = (target.repeatCount || 1) + 1;

    setNotifications((prev) =>
      prev.map((n) => (n.id === target.id ? { ...n, repeatCount: newCount } : n))
    );

    if (notificationSettings.executionMode === 'backend') {
      try {
        await fetch('/api/alerts/repeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: target.service, alertId: target.id }),
        });
      } catch (e) {
        console.warn('Backend repeat call failed:', e);
      }
    }

    // If repeats repeat MORE THAN 5 TIMES (> 5, i.e. 6 or above), set auto-resolve and check bugs!
    if (newCount > notificationSettings.repeatThreshold && notificationSettings.autoResolveEnabled) {
      await handleExecuteAutoResolve(target.service, newCount, target.id);
    }
  };

  // ⚡ Force >5x Auto-Resolve Test
  const handleTrigger5xAutoResolve = async (targetId?: string) => {
    const target = notifications.find((n) => n.id === (targetId || activeUncheckedNotification?.id));
    const service = target?.service || 'payment-service';
    const newCount = 6; // strictly > 5 repeats

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === (target?.id || prev[0]?.id)
          ? { ...n, repeatCount: newCount }
          : n
      )
    );

    await handleExecuteAutoResolve(service, newCount, target?.id);
  };

  // 🐞 Inspect bugs without waiting
  const handleInspectBugs = () => {
    if (!autoResolveState) {
      setAutoResolveState({
        isActive: false,
        stage: 'CHECKING_BUGS',
        repeatCount: activeUncheckedNotification?.repeatCount || 1,
        maxRepeats: 5,
        bugs: getIncidentBugs(activeUncheckedNotification?.service || 'payment-service'),
        progressPercent: 40,
        log: [
          `[INSPECTOR] Real-time software bug registry loaded for ${activeUncheckedNotification?.service || 'payment-service'}.`,
          `[INSPECTOR] 3 potential bugs detected. Auto-resolve will execute autonomously if repeats > 5.`,
        ],
      });
    }
    setIsAutoResolveModalOpen(true);
  };

  // Auto-Repeat Streaming Daemon Simulation
  useEffect(() => {
    if (isAutoRepeatStreaming && activeUncheckedNotification && incidentState !== 'resolved') {
      const timer = setInterval(() => {
        handleIncrementRepeat();
      }, 2200);
      return () => clearInterval(timer);
    }
  }, [isAutoRepeatStreaming, activeUncheckedNotification, incidentState, notificationSettings.repeatThreshold]);

  // Trigger / Dispatch a New Incident Notification
  const triggerNewIssueNotification = async (title: string, message: string, service: string) => {
    const newNotifId = `notif-${Date.now()}`;
    const newNotif: IncidentNotification = {
      id: newNotifId,
      title,
      message,
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      checked: false,
      soundAlarmTriggered: false,
      service,
      source: notificationSettings.executionMode === 'backend' ? 'Backend Watchdog API' : 'In-App Watchdog',
      repeatCount: 1,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setSecondsRemaining(notificationSettings.escalationTimeoutSeconds);

    const triggerEntry = await alertHistoryService.recordEvent(
      {
        alertId: newNotifId,
        eventType: 'TRIGGERED',
        service,
        severity: 'CRITICAL',
        title,
        message,
        actor: notificationSettings.executionMode === 'backend' ? 'Backend Watchdog Daemon' : 'In-App APM Monitor',
        details: `Anomaly triggered under ${notificationSettings.executionMode === 'backend' ? 'Backend Program' : 'In-App Engine'}.`,
      },
      notificationSettings.executionMode
    );

    setAlertHistory((prev) => [triggerEntry, ...prev]);

    if (notificationSettings.executionMode === 'backend') {
      try {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, message, service, severity: 'CRITICAL' }),
        });
      } catch (e) {
        console.warn('Backend alert post failed:', e);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${title}`, {
        body: message,
      });
    }
  };

  // 1. Analyze Incident
  const handleAnalyze = async () => {
    if (!incidentQuery.trim()) return;

    await handleCheckNotification();

    setIncidentState('analyzing');
    setMetrics((prev) => ({
      ...prev,
      errorRate: prev.errorRate > 5 ? prev.errorRate : 18.4,
      responseTimeMs: prev.responseTimeMs > 500 ? prev.responseTimeMs : 1420,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const result = await analyzeIncident(incidentQuery, logs, deployments, metrics);
      setAnalysisResult(result);
      setIncidentState('awaiting_approval');

      // Stamp Analyzed event in timeline
      setLifecycleAuditData((prev) => ({
        ...prev,
        analyzed: {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          elapsed: getElapsedString(incidentStartTime),
        },
      }));
    } catch (err) {
      console.error('Analysis error:', err);
      setIncidentState('idle');
    }
  };

  // 2. User Approval & Apply Fix
  const handleApproveFix = async (simulateFailure: boolean) => {
    if (!analysisResult) return;

    alertSound.stopAlarm();
    setIsAlarmSounding(false);

    // Stamp Approved event in timeline
    setLifecycleAuditData((prev) => ({
      ...prev,
      approved: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: getElapsedString(incidentStartTime),
      },
    }));

    setIsSimulatingFailure(simulateFailure);
    setIncidentState('applying_fix');
    setExecutionStepIndex(0);

    for (let i = 0; i < executionSteps.length; i++) {
      setExecutionStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Stamp Applied event in timeline
    setLifecycleAuditData((prev) => ({
      ...prev,
      applied: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: getElapsedString(incidentStartTime),
      },
    }));

    setIncidentState('verifying');
    setStatusMessage('Fix completed. Checking system...');

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const report = await executeRemediation(analysisResult.recommendedSolution, simulateFailure);

    setMetrics(report.metrics);
    setLogs((prev) => [...report.logs, ...prev]);

    if (report.status === 'resolved') {
      setIncidentState('resolved');
      setIncidentResolvedTime(Date.now());
      alertSound.stopAlarm();
      setIsAlarmSounding(false);

      // Stamp Resolved event in timeline
      setLifecycleAuditData((prev) => ({
        ...prev,
        resolved: {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          elapsed: getElapsedString(incidentStartTime),
        },
      }));

      const resEntry = await alertHistoryService.recordEvent(
        {
          alertId: `res-${Date.now()}`,
          eventType: 'RESOLVED',
          service: analysisResult.recommendedSolution.targetService,
          severity: 'INFO',
          title: `Incident Resolved: ${analysisResult.recommendedSolution.targetService}`,
          message: `${analysisResult.recommendedSolution.targetService} rollback completed. Metrics normalized to SLA.`,
          actor: 'Remediation Engine',
          details: 'Zero-downtime rollback pipeline verified healthy.',
        },
        notificationSettings.executionMode
      );

      setAlertHistory((prev) => [resEntry, ...prev]);

      setDeployments((prev) =>
        prev.map((d) => {
          if (d.version === 'v2.14.0') {
            return { ...d, status: 'rolled_back', isSuspect: false };
          }
          if (d.version === 'v2.13.9') {
            return { ...d, status: 'active' };
          }
          return d;
        })
      );
    } else {
      setIncidentState('unresolved');
      triggerNewIssueNotification(
        '⚠️ Incident Still Active: Database connection starvation persists',
        'Post-fix health check failed. 182 zombie connections remaining in DB pool.',
        analysisResult.recommendedSolution.targetService
      );
    }
  };

  // Secondary Fix for Unresolved State
  const handleApplySecondaryFix = async () => {
    alertSound.stopAlarm();
    setIsAlarmSounding(false);

    setIncidentState('applying_fix');
    setExecutionStepIndex(0);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIncidentState('verifying');
    setStatusMessage('Fix completed. Checking system...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMetrics(HEALTHY_METRICS);
    setLogs((prev) => [
      {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'postgres-db',
        message: 'Connection pool flushed: 182 stale client locks terminated. Active connections dropped to 38/200.',
      },
      {
        id: `sec-2-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'health-checker',
        message: 'Secondary health probe verified: All services report HTTP 200 OK.',
      },
      ...prev,
    ]);

    setDeployments((prev) =>
      prev.map((d) => {
        if (d.version === 'v2.14.0') {
          return { ...d, status: 'rolled_back', isSuspect: false };
        }
        if (d.version === 'v2.13.9') {
          return { ...d, status: 'active' };
        }
        return d;
      })
    );

    const resEntry = await alertHistoryService.recordEvent(
      {
        alertId: `res-sec-${Date.now()}`,
        eventType: 'RESOLVED',
        service: 'payment-service',
        severity: 'INFO',
        title: 'Incident Resolved: Secondary Pool Flush',
        message: 'Database connection pool flushed and stale locks cleared. All health probes passed.',
        actor: 'Remediation Engine',
        details: 'Secondary remediation succeeded.',
      },
      notificationSettings.executionMode
    );
    setAlertHistory((prev) => [resEntry, ...prev]);

    setLifecycleAuditData((prev) => ({
      ...prev,
      resolved: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: getElapsedString(incidentStartTime),
      },
    }));
    setIncidentResolvedTime(Date.now());
    setIncidentState('resolved');
  };

  // Full Reset to initial clean state
  const handleReset = () => {
    alertSound.stopAlarm();
    setIsAlarmSounding(false);
    setIsAutoRepeatStreaming(false);
    setAutoResolveState(null);
    setIsAutoResolveModalOpen(false);

    setIncidentQuery('Payment API is failing.');
    setIncidentState('idle');
    setMetrics(DEFAULT_INCIDENT_METRICS);
    setLogs(INITIAL_LOGS);
    setDeployments(INITIAL_DEPLOYMENTS);
    setAnalysisResult(null);
    setExecutionStepIndex(0);
    setStatusMessage('');
    setIsSimulatingFailure(false);

    const resetStart = Date.now();
    setIncidentStartTime(resetStart);
    setIncidentResolvedTime(undefined);

    setLifecycleAuditData({
      triggered: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elapsed: '+0s',
      },
    });

    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Payment API is failing',
        message: 'Critical error rate spike (18.4%) detected on /v1/charges. DB connection pool exhausted.',
        severity: 'CRITICAL',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        createdAt: Date.now(),
        checked: false,
        soundAlarmTriggered: false,
        service: 'payment-service',
        source: 'APM Monitor',
        repeatCount: 1,
      },
    ]);
    setSecondsRemaining(notificationSettings.escalationTimeoutSeconds);
  };

  // Clear Alert History handler
  const handleClearHistory = async () => {
    await alertHistoryService.clearHistory(notificationSettings.executionMode);
    setAlertHistory([]);
  };

  // Export Alert History CSV handler
  const handleExportCSV = () => {
    alertHistoryService.exportCSV(alertHistory);
  };

  // Generate dynamic 5 Lifecycle Events for the Visual Timeline
  const targetService = analysisResult?.recommendedSolution.targetService || 'payment-service';
  const targetVersion = analysisResult?.recommendedSolution.targetVersion || 'v2.13.9';

  const lifecycleEvents: IncidentLifecycleEvent[] = [
    {
      stage: 'Triggered',
      label: 'Triggered',
      description: `Anomaly detected: error rate surged to 18.4% on ${targetService}`,
      status: 'completed',
      timestamp: lifecycleAuditData.triggered.timestamp,
      timeElapsed: lifecycleAuditData.triggered.elapsed,
      actor: notificationSettings.executionMode === 'backend' ? 'Backend Watchdog API' : 'APM Telemetry Watchdog',
      metricsSnapshot: {
        errorRate: 18.4,
        responseTimeMs: 1420,
      },
      details: 'Automatic watchdog alert fired due to SLA threshold breach: Error rate > 1.0% and DB connection pool exhaustion (198/200).',
    },
    {
      stage: 'Analyzed',
      label: 'Analyzed',
      description:
        analysisResult
          ? `Root cause: ${analysisResult.primaryCause}`
          : incidentState === 'analyzing'
          ? 'Correlating logs, metrics, and deployments...'
          : 'Pending automated correlation & root cause analysis',
      status:
        incidentState === 'analyzing'
          ? 'in_progress'
          : analysisResult
          ? 'completed'
          : 'pending',
      timestamp: lifecycleAuditData.analyzed?.timestamp,
      timeElapsed: lifecycleAuditData.analyzed?.elapsed,
      actor: 'IncidentFix AI Engine',
      details: analysisResult
        ? `Synthesis concluded: ${analysisResult.whyExplanation.join(' ')}`
        : 'Telemetry engine will analyze git diffs, recent deploys, and database logs.',
    },
    {
      stage: 'Approved',
      label: 'Approved',
      description:
        ['applying_fix', 'verifying', 'resolved'].includes(incidentState)
          ? `Rollback to ${targetVersion} authorized by operator`
          : ['awaiting_approval', 'analysis_ready'].includes(incidentState)
          ? 'Awaiting human-in-the-loop operator approval'
          : 'Pending operator verification of proposed fix',
      status:
        ['applying_fix', 'verifying', 'resolved'].includes(incidentState)
          ? 'completed'
          : ['awaiting_approval', 'analysis_ready'].includes(incidentState)
          ? 'in_progress'
          : 'pending',
      timestamp: lifecycleAuditData.approved?.timestamp,
      timeElapsed: lifecycleAuditData.approved?.elapsed,
      actor: 'Operator (On-Call SRE)',
      details: 'Production safety guardrail requires explicit human confirmation before executing rolling rollback pipeline.',
    },
    {
      stage: 'Applied',
      label: 'Applied',
      description:
        incidentState === 'applying_fix'
          ? 'Draining traffic, swapping pod images, and cycling DB pools...'
          : ['verifying', 'resolved'].includes(incidentState)
          ? `Rollback to ${targetVersion} safely applied`
          : incidentState === 'unresolved'
          ? 'Execution finished with remaining zombie connections'
          : 'Pending rollback pipeline execution',
      status:
        incidentState === 'applying_fix'
          ? 'in_progress'
          : ['verifying', 'resolved'].includes(incidentState)
          ? 'completed'
          : incidentState === 'unresolved'
          ? 'failed'
          : 'pending',
      timestamp: lifecycleAuditData.applied?.timestamp,
      timeElapsed: lifecycleAuditData.applied?.elapsed,
      actor: 'Automated Remediation Daemon',
      details: 'Traffic drained from suspect pods, previous stable manifest deployed, and database connection pools recycled.',
    },
    {
      stage: 'Resolved',
      label: incidentState === 'unresolved' ? 'Unresolved' : 'Resolved',
      description:
        incidentState === 'resolved'
          ? `Incident closed: Error rate 0.02%, Latency 44ms (SLA Restored)`
          : incidentState === 'verifying'
          ? 'Verifying system telemetry and synthetic probes...'
          : incidentState === 'unresolved'
          ? 'Incident Still Active: Error rate remains above SLA'
          : 'Pending post-remediation system health verification',
      status:
        incidentState === 'verifying'
          ? 'in_progress'
          : incidentState === 'resolved'
          ? 'completed'
          : incidentState === 'unresolved'
          ? 'failed'
          : 'pending',
      timestamp: lifecycleAuditData.resolved?.timestamp,
      timeElapsed: lifecycleAuditData.resolved?.elapsed,
      actor: 'Synthetic Health Probes',
      metricsSnapshot:
        incidentState === 'resolved'
          ? {
              errorRate: metrics.errorRate,
              responseTimeMs: metrics.responseTimeMs,
            }
          : undefined,
      details:
        incidentState === 'resolved'
          ? 'All 100 synthetic health check probes passed with HTTP 200 OK. Telemetry normalized to baseline.'
          : incidentState === 'unresolved'
          ? 'Secondary intervention required: Connection pool still experiencing contention.'
          : 'Probes will verify error rate < 0.10% and p95 latency < 100ms.',
    },
  ];

  // Forensic Artifacts & Audit Evaluations Data
  const evidenceBundle = collectEvidenceBundle('INC-2026-0926-01', incidentQuery, logs, deployments, metrics);
  const rcaDetail = generateRootCauseAnalysis('INC-2026-0926-01', incidentQuery, analysisResult);
  const auditEvaluation = evaluateIncidentAuditTrail(
    'INC-2026-0926-01',
    lifecycleEvents,
    alertHistory,
    incidentStartTime,
    incidentResolvedTime
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        incidentState={incidentState}
        onReset={handleReset}
        uncheckedNotificationsCount={notifications.filter((n) => !n.checked).length}
        isAlarmSounding={isAlarmSounding}
        soundEnabled={notificationSettings.soundEnabled}
        executionMode={notificationSettings.executionMode}
        onToggleExecutionMode={() =>
          setNotificationSettings((prev) => ({
            ...prev,
            executionMode: prev.executionMode === 'in_app' ? 'backend' : 'in_app',
          }))
        }
        onToggleSound={handleToggleSound}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
      />

      {/* Notification Banner when issue occurs & alert sound if not checked */}
      <NotificationBanner
        notification={activeUncheckedNotification}
        secondsRemaining={secondsRemaining}
        isAlarmSounding={isAlarmSounding}
        soundEnabled={notificationSettings.soundEnabled}
        onCheckNotification={() => handleCheckNotification()}
        onToggleSound={handleToggleSound}
        onTestSound={handleTestSound}
        onIncrementRepeat={() => handleIncrementRepeat()}
        onTriggerAutoResolve={() => handleTrigger5xAutoResolve()}
        repeatThreshold={notificationSettings.repeatThreshold}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Live Metrics Overview (Error rate, Response time, Status, DB pool) */}
        <MetricsOverview metrics={metrics} incidentState={incidentState} />

        {/* 🤖 AUTONOMOUS AUTO-RESOLVE & BUG HEALER WATCHDOG BAR */}
        <AutoResolveWatchdogBar
          notification={activeUncheckedNotification}
          settings={notificationSettings}
          isStreaming={isAutoRepeatStreaming}
          onToggleStreaming={() => setIsAutoRepeatStreaming((prev) => !prev)}
          onIncrementRepeat={() => handleIncrementRepeat()}
          onTrigger5xAutoResolve={() => handleTrigger5xAutoResolve()}
          onInspectBugs={handleInspectBugs}
          isResolved={incidentState === 'resolved'}
        />

        {/* 🗺️ VISUAL HORIZONTAL TIMELINE COMPONENT (Triggered → Analyzed → Approved → Applied → Resolved) */}
        <IncidentLifecycleTimeline
          events={lifecycleEvents}
          incidentId="INC-2026-0926-01"
          incidentTitle={incidentQuery}
          serviceName={targetService}
          incidentState={incidentState}
          startTime={incidentStartTime}
          endTime={incidentResolvedTime}
        />

        {/* 🛠️ SRE INVESTIGATION & SAFETY TOOLBAR (Collect Evidence, RCA, Sandbox Action, Audit Trail Evaluation, Auto-Resolve) */}
        <InvestigationToolbar
          onOpenEvidence={() => setIsEvidenceModalOpen(true)}
          onOpenRCA={() => setIsRcaModalOpen(true)}
          onOpenSandbox={() => setIsSandboxModalOpen(true)}
          onOpenAuditEvaluation={() => setIsAuditEvaluationModalOpen(true)}
          onOpenAutoResolve={handleInspectBugs}
          hasAnalyzed={!!analysisResult}
          isResolved={incidentState === 'resolved'}
        />

        {/* Enter Incident Box (Step 1) */}
        <IncidentInput
          query={incidentQuery}
          setQuery={(q) => {
            setIncidentQuery(q);
            if (q.trim().length > 3) {
              triggerNewIssueNotification(
                q,
                'User reported potential software degradation. Waiting for analysis.',
                'user-report'
              );
            }
          }}
          onAnalyze={handleAnalyze}
          isAnalyzing={incidentState === 'analyzing'}
          disabled={incidentState === 'applying_fix' || incidentState === 'verifying'}
        />

        {/* Analysis & Recommended Solution Card (Step 2 - 5) */}
        {analysisResult && (incidentState === 'awaiting_approval' || incidentState === 'analysis_ready') && (
          <AnalysisCard
            analysis={analysisResult}
            incidentState={incidentState}
            onApproveFix={handleApproveFix}
            onRejectFix={handleReset}
            onOpenSandbox={() => setIsSandboxModalOpen(true)}
            onOpenEvidence={() => setIsEvidenceModalOpen(true)}
            onOpenRCA={() => setIsRcaModalOpen(true)}
          />
        )}

        {/* Remediation Execution & Verification (Step 6 - 7: Fix completed. Checking system...) */}
        {(incidentState === 'applying_fix' ||
          incidentState === 'verifying' ||
          incidentState === 'resolved' ||
          incidentState === 'unresolved') && (
          <FixExecutionProgress
            incidentState={incidentState}
            currentStepIndex={executionStepIndex}
            steps={executionSteps}
            statusMessage={statusMessage}
            metrics={metrics}
            onReset={handleReset}
            onApplySecondaryFix={handleApplySecondaryFix}
            onOpenAuditEvaluation={() => setIsAuditEvaluationModalOpen(true)}
            onOpenEvidence={() => setIsEvidenceModalOpen(true)}
          />
        )}

        {/* Monitoring Data Context: Recent Logs & Recent Deployments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLogs logs={logs} />
          <RecentDeployments deployments={deployments} />
        </div>
      </main>

      {/* 1. Evidence Vault Modal (Collect Evidence) */}
      <EvidenceVaultModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidence={evidenceBundle}
      />

      {/* 2. Root Cause Analysis Modal (RCA 5-Whys) */}
      <RootCauseAnalysisModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        rca={rcaDetail}
      />

      {/* 3. Sandbox Action Modal (Dry-Run Staging Simulator) */}
      <SandboxActionModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
        targetService={targetService}
        targetVersion={targetVersion}
        onProceedToApproveFix={() => handleApproveFix(false)}
      />

      {/* 4. Audit Trail Evaluation Modal (Post-Mortem & SOC2/ISO Scorecard) */}
      <AuditEvaluationModal
        isOpen={isAuditEvaluationModalOpen}
        onClose={() => setIsAuditEvaluationModalOpen(false)}
        evaluation={auditEvaluation}
      />

      {/* 5. Autonomous Auto-Resolve & Bug Healer Daemon Modal */}
      <AutoResolveModal
        isOpen={isAutoResolveModalOpen}
        onClose={() => setIsAutoResolveModalOpen(false)}
        state={autoResolveState}
        onViewAudit={() => setIsAuditEvaluationModalOpen(true)}
      />

      {/* Notification Center Modal with Alert History */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        alertHistory={alertHistory}
        settings={notificationSettings}
        onUpdateSettings={(newSettings) =>
          setNotificationSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onCheckNotification={handleCheckNotification}
        onSimulateNewIssue={() => {
          triggerNewIssueNotification(
            'Checkout API Latency Spike (>3,000ms)',
            'Tax calculation latency spike causing checkout orders to drop.',
            'order-checkout'
          );
        }}
        onIncrementRepeat={(id) => handleIncrementRepeat(id)}
        onTrigger5xAutoResolve={(id) => handleTrigger5xAutoResolve(id)}
        onTestSound={handleTestSound}
        onClearHistory={handleClearHistory}
        onExportCSV={handleExportCSV}
        onRefreshHistory={loadAlertHistory}
        isAlarmSounding={isAlarmSounding}
        backendOnline={backendOnline}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IncidentFix AI • Automated Incident Diagnosis & Safe Remediation</span>
          <span className="font-mono text-[11px] text-slate-600">
            Autonomous Watchdog • Bug Healer Daemon • Forensics • 5-Whys RCA • Grade A+ Audit
          </span>
        </div>
      </footer>
    </div>
  );
}
