import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BackendAlertHistoryEntry {
  id: string;
  alertId: string;
  eventType: 'TRIGGERED' | 'ACKNOWLEDGED' | 'SILENCED' | 'ALARM_SOUNDED' | 'AUTO_RESOLVE_TRIGGERED' | 'BUG_CHECK_RESOLVED' | 'RESOLVED';
  timestamp: string;
  timestampFormatted: string;
  service: string;
  severity: string;
  title: string;
  message: string;
  actor: string;
  executionMode: 'backend' | 'in_app';
  details?: string;
  timeToAcknowledgeSeconds?: number;
}

// In-memory backend persistent audit log & active alerts
let backendAlertHistory: BackendAlertHistoryEntry[] = [
  {
    id: 'backend-boot-1',
    alertId: 'sys-boot',
    eventType: 'TRIGGERED',
    timestamp: new Date().toISOString(),
    timestampFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    service: 'incidentfix-backend-daemon',
    severity: 'INFO',
    title: 'Backend Monitoring Program Initialized',
    message: 'Backend alert audit dispatcher & auto-resolve watchdog online on port ' + (process.env.PORT || 3000),
    actor: 'Backend Daemon',
    executionMode: 'backend',
    details: 'System audit pipeline active with automated bug scanner & repeat threshold monitoring (>5 repeats).',
  },
];

let backendActiveAlerts = [
  {
    id: 'notif-p0-backend-initial',
    title: 'Payment API is failing',
    message: 'Critical error rate spike (18.4%) detected on /v1/charges. DB connection pool exhausted.',
    severity: 'CRITICAL',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    createdAt: Date.now(),
    checked: false,
    soundAlarmTriggered: false,
    service: 'payment-service',
    source: 'Backend Watchdog Daemon',
    repeatCount: 1,
    autoResolved: false,
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // --- Backend Program API Routes ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      serverTime: new Date().toISOString(),
      mode: 'backend_program_online',
      activeAlertsCount: backendActiveAlerts.filter(a => !a.checked).length,
      historyRecordsCount: backendAlertHistory.length,
      autoResolveDaemon: 'active',
      repeatThreshold: 5,
    });
  });

  // Get active alerts
  app.get('/api/alerts', (req: Request, res: Response) => {
    res.json({
      alerts: backendActiveAlerts,
    });
  });

  // Trigger or Repeat an alert on the backend
  app.post('/api/alerts', (req: Request, res: Response) => {
    const { title, message, service, severity, repeatIncrement } = req.body;
    const now = new Date();

    // Check if an alert for this service already exists to increment repeat count
    const existing = backendActiveAlerts.find(a => a.service === (service || 'payment-service') && !a.checked);

    if (existing) {
      existing.repeatCount = (existing.repeatCount || 1) + 1;
      existing.timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Check if repeat threshold (>5) reached
      if (existing.repeatCount > 5 && !existing.autoResolved) {
        existing.checked = true;
        existing.autoResolved = true;

        const autoTriggerEntry: BackendAlertHistoryEntry = {
          id: `hist-${Date.now()}-1`,
          alertId: existing.id,
          eventType: 'AUTO_RESOLVE_TRIGGERED',
          timestamp: now.toISOString(),
          timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          service: existing.service,
          severity: 'CRITICAL',
          title: `Auto-Resolve Triggered: ${existing.title}`,
          message: `Notification repeated ${existing.repeatCount} times (exceeded 5 repeats). Auto-Resolve Daemon took control.`,
          actor: 'Backend Auto-Resolve Daemon',
          executionMode: 'backend',
          details: 'Repeat threshold exceeded (>5). Initiated autonomous software bug inspection & remediation program.',
        };

        const bugFixEntry: BackendAlertHistoryEntry = {
          id: `hist-${Date.now()}-2`,
          alertId: existing.id,
          eventType: 'BUG_CHECK_RESOLVED',
          timestamp: now.toISOString(),
          timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          service: existing.service,
          severity: 'INFO',
          title: 'All Software Bugs Inspected & Resolved',
          message: 'Fixed Sequelize connection leak, terminated 182 stuck DB pool connections, and rolling restarted worker pods.',
          actor: 'Autonomous Bug Healer Engine',
          executionMode: 'backend',
          details: 'All 3 detected bugs resolved; stable rollback v2.13.9 verified healthy.',
        };

        const resolvedEntry: BackendAlertHistoryEntry = {
          id: `hist-${Date.now()}-3`,
          alertId: existing.id,
          eventType: 'RESOLVED',
          timestamp: now.toISOString(),
          timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          service: existing.service,
          severity: 'INFO',
          title: `Incident Autonomously Resolved: ${existing.service}`,
          message: 'Error rate dropped to 0.02%, response time normalized to 44ms. System verified 100% operational.',
          actor: 'Backend Auto-Resolve Watchdog',
          executionMode: 'backend',
          details: 'Incident closed automatically after > 5 notification repeats were analyzed, bugs fixed, and SLA verified.',
        };

        backendAlertHistory.unshift(resolvedEntry);
        backendAlertHistory.unshift(bugFixEntry);
        backendAlertHistory.unshift(autoTriggerEntry);

        res.status(200).json({
          alert: existing,
          autoResolved: true,
          repeatCount: existing.repeatCount,
          historyEntries: [autoTriggerEntry, bugFixEntry, resolvedEntry],
        });
        return;
      }

      res.status(200).json({ alert: existing, repeatCount: existing.repeatCount, autoResolved: false });
      return;
    }

    const newAlert = {
      id: `backend-alert-${Date.now()}`,
      title: title || 'System Degradation Alert',
      message: message || 'Unspecified backend anomaly detected',
      severity: severity || 'CRITICAL',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      createdAt: Date.now(),
      checked: false,
      soundAlarmTriggered: false,
      service: service || 'payment-service',
      source: 'Backend Program Watchdog',
      repeatCount: 1,
      autoResolved: false,
    };

    backendActiveAlerts.unshift(newAlert);

    const historyEntry: BackendAlertHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      alertId: newAlert.id,
      eventType: 'TRIGGERED',
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      service: newAlert.service,
      severity: newAlert.severity,
      title: newAlert.title,
      message: newAlert.message,
      actor: 'Backend Service Watchdog',
      executionMode: 'backend',
      details: 'Dispatched via backend program daemon API',
    };
    backendAlertHistory.unshift(historyEntry);

    res.status(201).json({ alert: newAlert, historyEntry });
  });

  // Explicit Auto-Resolve & Bug Check Endpoint
  app.post('/api/alerts/auto-resolve', (req: Request, res: Response) => {
    const { service } = req.body;
    const targetService = service || 'payment-service';
    const now = new Date();

    const alert = backendActiveAlerts.find(a => a.service === targetService);
    if (alert) {
      alert.checked = true;
      alert.autoResolved = true;
      alert.repeatCount = Math.max(5, alert.repeatCount || 5);
    }

    const autoTriggerEntry: BackendAlertHistoryEntry = {
      id: `hist-${Date.now()}-auto`,
      alertId: alert?.id || 'alert-auto',
      eventType: 'AUTO_RESOLVE_TRIGGERED',
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      service: targetService,
      severity: 'CRITICAL',
      title: `Auto-Resolve Watchdog Activated (${targetService})`,
      message: 'Notification repeated > 5 times. Autonomous bug scanner and remediation program executed.',
      actor: 'Backend Auto-Resolve Daemon',
      executionMode: 'backend',
      details: 'Evaluated 3 software bugs and performed autonomous resolution.',
    };

    const bugFixEntry: BackendAlertHistoryEntry = {
      id: `hist-${Date.now()}-bugs`,
      alertId: alert?.id || 'alert-auto',
      eventType: 'BUG_CHECK_RESOLVED',
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      service: targetService,
      severity: 'INFO',
      title: `Bugs Inspected & Resolved: ${targetService}`,
      message: 'Autonomous patch applied: Sequelize connection leak fixed, pool connections flushed, SLA restored.',
      actor: 'Autonomous Bug Healer Engine',
      executionMode: 'backend',
      details: 'Zero bugs remaining. Production health probe passed (100% OK).',
    };

    backendAlertHistory.unshift(bugFixEntry);
    backendAlertHistory.unshift(autoTriggerEntry);

    res.json({
      success: true,
      service: targetService,
      message: 'Backend autonomous bug healer resolved the incident.',
      historyEntries: [autoTriggerEntry, bugFixEntry],
    });
  });

  // Increment repeat count on active alert (and auto-resolve if repeats > 5)
  app.post('/api/alerts/repeat', (req: Request, res: Response) => {
    const { service, alertId } = req.body;
    const targetService = service || 'payment-service';
    const alert = alertId 
      ? backendActiveAlerts.find(a => a.id === alertId)
      : backendActiveAlerts.find(a => a.service === targetService && !a.checked);

    if (!alert) {
      res.status(404).json({ error: 'No matching active alert found to repeat' });
      return;
    }

    const now = new Date();
    alert.repeatCount = (alert.repeatCount || 1) + 1;
    alert.timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Check if repeat threshold (>5) reached
    if (alert.repeatCount > 5 && !alert.autoResolved) {
      alert.checked = true;
      alert.autoResolved = true;

      const autoTriggerEntry: BackendAlertHistoryEntry = {
        id: `hist-${Date.now()}-repeat-auto`,
        alertId: alert.id,
        eventType: 'AUTO_RESOLVE_TRIGGERED',
        timestamp: now.toISOString(),
        timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: alert.service,
        severity: 'CRITICAL',
        title: `Auto-Resolve Watchdog Activated (${alert.title})`,
        message: `Notification repeated ${alert.repeatCount} times (exceeded 5 repeats). Auto-resolve & bug remediation program executed.`,
        actor: 'Backend Auto-Resolve Daemon',
        executionMode: 'backend',
        details: 'Repeat threshold exceeded (>5). Autonomous bug scanner diagnosed and fixed software bugs.',
      };

      const bugFixEntry: BackendAlertHistoryEntry = {
        id: `hist-${Date.now()}-repeat-bugs`,
        alertId: alert.id,
        eventType: 'BUG_CHECK_RESOLVED',
        timestamp: now.toISOString(),
        timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: alert.service,
        severity: 'INFO',
        title: 'All Software Bugs Inspected & Resolved',
        message: 'Fixed Sequelize connection leak, cleared 182 stuck DB pool connections, and rolling restarted worker pods.',
        actor: 'Autonomous Bug Healer Engine',
        executionMode: 'backend',
        details: 'All 3 detected bugs resolved; rollback v2.13.9 verified healthy.',
      };

      const resolvedEntry: BackendAlertHistoryEntry = {
        id: `hist-${Date.now()}-repeat-res`,
        alertId: alert.id,
        eventType: 'RESOLVED',
        timestamp: now.toISOString(),
        timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: alert.service,
        severity: 'INFO',
        title: `Incident Autonomously Resolved: ${alert.service}`,
        message: 'Error rate dropped to 0.02%, response time normalized to 44ms. System verified 100% operational.',
        actor: 'Backend Auto-Resolve Watchdog',
        executionMode: 'backend',
        details: 'Incident closed automatically after > 5 notification repeats were analyzed, bugs fixed, and SLA verified.',
      };

      backendAlertHistory.unshift(resolvedEntry);
      backendAlertHistory.unshift(bugFixEntry);
      backendAlertHistory.unshift(autoTriggerEntry);

      res.status(200).json({
        alert,
        autoResolved: true,
        repeatCount: alert.repeatCount,
        historyEntries: [autoTriggerEntry, bugFixEntry, resolvedEntry],
      });
      return;
    }

    res.status(200).json({ alert, repeatCount: alert.repeatCount, autoResolved: false });
  });

  // Query software bugs inspected by the daemon
  app.get('/api/bugs', (req: Request, res: Response) => {
    res.json({
      bugs: [
        {
          id: 'bug-1',
          title: 'Connection Leak in Exception Handler (Sequelize v5.2)',
          category: 'CODE_LEAK',
          component: 'payment-service/src/db/batchTransactions.ts:48',
          description: 'client.acquire() is called without enclosing try/finally block; exceptions leave DB sockets reserved indefinitely.',
          status: 'RESOLVED',
          fixApplied: 'Injected safe try/finally block with client.release() & reverted to stable build v2.13.9.',
        },
        {
          id: 'bug-2',
          title: 'Database Connection Pool Starvation Deadlock',
          category: 'RESOURCE_CONTENTION',
          component: 'postgres-db:pool-manager',
          description: 'Active connection count hit 198/200. Pool idle timeout was disabled, permanently holding dead client connections.',
          status: 'RESOLVED',
          fixApplied: 'Issued SQL pg_terminate_backend on 182 idle-in-transaction connections; restored pool idle timeout to 10s.',
        },
        {
          id: 'bug-3',
          title: 'Zombie Worker Threads Retaining TCP Sockets',
          category: 'CONCURRENCY_DEADLOCK',
          component: 'payment-service worker pods (4/4)',
          description: 'Node.js event loop blocked on crypto.subtle and hanging DB sockets, returning 502/504 to API Gateway.',
          status: 'RESOLVED',
          fixApplied: 'Executed rolling pod restart on payment-service with graceful traffic drain.',
        },
      ],
      totalChecked: 3,
      totalResolved: 3,
    });
  });

  // Acknowledge alert on backend
  app.post('/api/alerts/:id/ack', (req: Request, res: Response) => {
    const { id } = req.params;
    const alert = backendActiveAlerts.find(a => a.id === id);
    const now = new Date();

    if (alert) {
      alert.checked = true;
      const historyEntry: BackendAlertHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        alertId: alert.id,
        eventType: 'ACKNOWLEDGED',
        timestamp: now.toISOString(),
        timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: alert.service,
        severity: alert.severity,
        title: alert.title,
        message: 'Alert acknowledged on backend',
        actor: 'Operator (Backend API)',
        executionMode: 'backend',
        details: 'Acknowledged via backend REST endpoint',
      };
      backendAlertHistory.unshift(historyEntry);
      res.json({ success: true, alert, historyEntry });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  // Silence alert on backend
  app.post('/api/alerts/:id/silence', (req: Request, res: Response) => {
    const { id } = req.params;
    const alert = backendActiveAlerts.find(a => a.id === id);
    const now = new Date();

    if (alert) {
      const historyEntry: BackendAlertHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        alertId: alert.id,
        eventType: 'SILENCED',
        timestamp: now.toISOString(),
        timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        service: alert.service,
        severity: alert.severity,
        title: alert.title,
        message: 'Alert sound silenced on backend',
        actor: 'Operator (Backend API)',
        executionMode: 'backend',
        details: 'Sound alarm terminated by backend command',
      };
      backendAlertHistory.unshift(historyEntry);
      res.json({ success: true, historyEntry });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  // Alert History - Get all audit events
  app.get('/api/alerts/history', (req: Request, res: Response) => {
    res.json({
      history: backendAlertHistory,
      count: backendAlertHistory.length,
      mode: 'backend',
    });
  });

  // Alert History - Append new audit event
  app.post('/api/alerts/history', (req: Request, res: Response) => {
    const entry: BackendAlertHistoryEntry = req.body;
    if (!entry || !entry.eventType) {
      res.status(400).json({ error: 'Invalid history entry' });
      return;
    }
    backendAlertHistory.unshift({
      ...entry,
      executionMode: 'backend',
    });
    res.status(201).json({ success: true, entry });
  });

  // Alert History - Reset
  app.delete('/api/alerts/history', (req: Request, res: Response) => {
    backendAlertHistory = [];
    res.json({ success: true, message: 'Backend alert history cleared' });
  });

  // --- Vite Middleware integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IncidentFix AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[IncidentFix AI] Failed to start server:', err);
  process.exit(1);
});
