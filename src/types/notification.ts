export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export type AlertHistoryEventType =
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  | 'SILENCED'
  | 'ALARM_SOUNDED'
  | 'AUTO_RESOLVE_TRIGGERED'
  | 'BUG_CHECK_RESOLVED'
  | 'RESOLVED';

export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  eventType: AlertHistoryEventType;
  timestamp: string; // ISO 8601 string or readable date
  timestampFormatted: string;
  service: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  actor: string; // e.g. "Operator (UI)", "Auto-Resolve Watchdog Daemon", "Audio Escalator Daemon", "Backend Service"
  executionMode: 'backend' | 'in_app';
  details?: string;
  timeToAcknowledgeSeconds?: number;
}

export interface IncidentNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  createdAt: number;
  checked: boolean;
  checkedAt?: number;
  soundAlarmTriggered: boolean;
  service: string;
  source: string;
  repeatCount: number; // Number of times this notification has repeated
  autoResolved?: boolean;
}

export interface BugCheckItem {
  id: string;
  title: string;
  category: 'CODE_LEAK' | 'RESOURCE_CONTENTION' | 'CONCURRENCY_DEADLOCK' | 'CONFIGURATION';
  component: string;
  description: string;
  status: 'DETECTED' | 'FIXING' | 'RESOLVED';
  fixApplied: string;
}

export interface AutoResolveProgramState {
  isActive: boolean;
  stage: 'IDLE' | 'THRESHOLD_REACHED' | 'CHECKING_BUGS' | 'APPLYING_BUG_FIXES' | 'VERIFYING' | 'AUTO_RESOLVED';
  repeatCount: number;
  maxRepeats: number;
  bugs: BugCheckItem[];
  progressPercent: number;
  log: string[];
}

export interface NotificationSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  escalationTimeoutSeconds: number; // Seconds before alert sound starts if not checked
  volume: number; // 0 to 1
  executionMode: 'in_app' | 'backend'; // User choice: In-App program vs Backend server program
  autoResolveEnabled: boolean; // Auto-resolve if repeats > 5 times
  repeatThreshold: number; // Default 5
}
