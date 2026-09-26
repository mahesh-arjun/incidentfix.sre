import { AlertHistoryEntry, AlertHistoryEventType, AlertSeverity } from '../types/notification';

const STORAGE_KEY = 'incidentfix_alert_history_permanent';

// Initial pre-seeded historical audit log for realistic SRE auditability
const INITIAL_HISTORY: AlertHistoryEntry[] = [
  {
    id: 'hist-seed-1',
    alertId: 'notif-p0-initial',
    eventType: 'TRIGGERED',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    timestampFormatted: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    service: 'payment-service',
    severity: 'CRITICAL',
    title: 'Payment API is failing',
    message: 'Error rate spiked to 18.4% on /v1/charges',
    actor: 'APM Telemetry Watchdog',
    executionMode: 'in_app',
    details: 'Triggered by threshold violation: Error rate > 1.0% & latency > 1,000ms',
  },
  {
    id: 'hist-seed-2',
    alertId: 'notif-p0-initial',
    eventType: 'ALARM_SOUNDED',
    timestamp: new Date(Date.now() - 3592000).toISOString(),
    timestampFormatted: new Date(Date.now() - 3592000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    service: 'payment-service',
    severity: 'CRITICAL',
    title: 'Payment API is failing',
    message: 'Audio alert sound activated after unacknowledged timeout (8s)',
    actor: 'Audio Escalation Daemon',
    executionMode: 'in_app',
    details: 'Escalation timer elapsed without operator acknowledgment.',
  },
  {
    id: 'hist-seed-3',
    alertId: 'notif-p0-initial',
    eventType: 'ACKNOWLEDGED',
    timestamp: new Date(Date.now() - 3585000).toISOString(),
    timestampFormatted: new Date(Date.now() - 3585000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    service: 'payment-service',
    severity: 'CRITICAL',
    title: 'Payment API is failing',
    message: 'Alert checked and acknowledged by operator',
    actor: 'Operator (On-Call SRE)',
    executionMode: 'in_app',
    details: 'Acknowledged after 15s. Alarm sound silenced.',
    timeToAcknowledgeSeconds: 15,
  },
  {
    id: 'hist-seed-4',
    alertId: 'notif-p0-initial',
    eventType: 'SILENCED',
    timestamp: new Date(Date.now() - 3585000).toISOString(),
    timestampFormatted: new Date(Date.now() - 3585000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    service: 'payment-service',
    severity: 'CRITICAL',
    title: 'Payment API is failing',
    message: 'Alert audio chime stopped upon user confirmation',
    actor: 'Operator (On-Call SRE)',
    executionMode: 'in_app',
    details: 'Audio synthesizer terminated. Status set to Acknowledged.',
  },
];

class AlertHistoryService {
  private getLocalHistory(): AlertHistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read alert history from localStorage:', e);
    }
    return INITIAL_HISTORY;
  }

  private saveLocalHistory(entries: AlertHistoryEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Could not write alert history to localStorage:', e);
    }
  }

  /**
   * Fetches alert history either from backend API or local storage
   */
  public async getHistory(mode: 'backend' | 'in_app'): Promise<AlertHistoryEntry[]> {
    if (mode === 'backend') {
      try {
        const res = await fetch('/api/alerts/history');
        if (res.ok) {
          const json = await res.json();
          return json.history || [];
        }
      } catch (err) {
        console.warn('Backend history fetch failed, falling back to local storage:', err);
      }
    }
    return this.getLocalHistory();
  }

  /**
   * Records a timestamped audit event
   */
  public async recordEvent(
    event: {
      alertId: string;
      eventType: AlertHistoryEventType;
      service: string;
      severity: AlertSeverity;
      title: string;
      message: string;
      actor?: string;
      details?: string;
      timeToAcknowledgeSeconds?: number;
    },
    mode: 'backend' | 'in_app'
  ): Promise<AlertHistoryEntry> {
    const now = new Date();
    const entry: AlertHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      alertId: event.alertId,
      eventType: event.eventType,
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      service: event.service,
      severity: event.severity,
      title: event.title,
      message: event.message,
      actor: event.actor || (mode === 'backend' ? 'Backend Service Worker' : 'Operator (Dashboard)'),
      executionMode: mode,
      details: event.details,
      timeToAcknowledgeSeconds: event.timeToAcknowledgeSeconds,
    };

    // Always update local cache
    const current = this.getLocalHistory();
    const updated = [entry, ...current];
    this.saveLocalHistory(updated);

    // If backend mode is enabled, also dispatch to backend program
    if (mode === 'backend') {
      try {
        await fetch('/api/alerts/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (err) {
        console.warn('Failed to persist alert event to backend:', err);
      }
    }

    return entry;
  }

  /**
   * Clears the alert history (for audit reset)
   */
  public async clearHistory(mode: 'backend' | 'in_app'): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    if (mode === 'backend') {
      try {
        await fetch('/api/alerts/history', { method: 'DELETE' });
      } catch {}
    }
  }

  /**
   * Export history to CSV for compliance audits
   */
  public exportCSV(entries: AlertHistoryEntry[]): void {
    const headers = ['Timestamp', 'Event Type', 'Service', 'Severity', 'Title', 'Actor', 'Execution Mode', 'Details'];
    const rows = entries.map((e) => [
      `"${e.timestamp}"`,
      `"${e.eventType}"`,
      `"${e.service}"`,
      `"${e.severity}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.actor}"`,
      `"${e.executionMode}"`,
      `"${(e.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incidentfix_alert_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const alertHistoryService = new AlertHistoryService();
