import { AnalysisResult, Deployment, LogEntry, SystemMetrics } from '../types/incident';
import { PRESET_INCIDENTS, INITIAL_DEPLOYMENTS, INITIAL_LOGS, DEFAULT_INCIDENT_METRICS, HEALTHY_METRICS } from '../data/mockMonitoring';

export interface IncidentStateReport {
  status: 'resolved' | 'unresolved';
  metrics: SystemMetrics;
  logs: LogEntry[];
  summary: string;
}

/**
 * Intelligent Incident Correlation & Diagnosis Engine
 * Inspects incident description, logs, metrics, and deployments.
 * Explains reasoning in clear, human-accessible language.
 */
export async function analyzeIncident(
  query: string,
  currentLogs: LogEntry[] = INITIAL_LOGS,
  currentDeployments: Deployment[] = INITIAL_DEPLOYMENTS,
  currentMetrics: SystemMetrics = DEFAULT_INCIDENT_METRICS
): Promise<AnalysisResult> {
  const normalizedQuery = query.trim().toLowerCase();

  // 1. Check if user selected or typed something matching our presets
  const matchedPreset = PRESET_INCIDENTS.find(p => 
    normalizedQuery.includes(p.label.toLowerCase()) || 
    normalizedQuery.includes(p.id.replace(/-/g, ' ')) ||
    normalizedQuery.includes('payment') ||
    normalizedQuery.includes('stripe')
  );

  if (matchedPreset && (normalizedQuery.includes('payment') || normalizedQuery.includes('failing'))) {
    // Exact match for the user's primary prompt request
    return {
      incidentQuery: query,
      primaryCause: 'Recent deployment may have caused the payment failure.',
      whyExplanation: [
        'Error rate increased after the deployment (surged from 0.04% to 18.4%).',
        'Database errors increased (connection acquire timeouts in payment-service).',
        'Payment service depends on the database to process transactions.',
      ],
      otherCauses: [
        'Upstream payment provider (e.g. Stripe, Adyen) network latency or API outage.',
        'Database connection pool starvation due to an unindexed query lock.',
        'Network firewall or TLS certificate handshake disruption.',
      ],
      recommendedSolution: {
        title: 'Rollback the recent deployment.',
        description: 'Revert payment-service from v2.14.0 back to the stable release v2.13.9 and recycle worker connection pools.',
        actionType: 'rollback',
        targetService: 'payment-service',
        targetVersion: 'v2.13.9',
        safetyLevel: 'Safe',
        estimatedDowntime: '0 seconds (Zero-downtime rolling rollback)',
      },
      evidence: {
        suspectDeployment: currentDeployments.find(d => d.isSuspect) || currentDeployments[0],
        criticalLogs: currentLogs.filter(l => l.level === 'ERROR'),
        metricsAnomaly: `Error rate spiked to ${currentMetrics.errorRate}%, latency jumped to ${currentMetrics.responseTimeMs}ms.`,
      },
    };
  }

  // 2. Dynamic analysis for any custom input entered by the user
  const suspectDep = currentDeployments.find(d => d.isSuspect) || currentDeployments[0];
  const detectedService = suspectDep ? suspectDep.service : 'core-api';

  // Extract key terms
  const isDbRelated = normalizedQuery.includes('db') || normalizedQuery.includes('database') || normalizedQuery.includes('sql') || normalizedQuery.includes('pool');
  const isAuthRelated = normalizedQuery.includes('auth') || normalizedQuery.includes('login') || normalizedQuery.includes('jwt') || normalizedQuery.includes('token');
  const isLatencyRelated = normalizedQuery.includes('slow') || normalizedQuery.includes('timeout') || normalizedQuery.includes('504') || normalizedQuery.includes('latency');

  let primaryCause = `Recent deployment (${suspectDep.version}) may have caused the issue.`;
  let whyPoints = [
    `Error rate increased immediately following the recent deployment of ${suspectDep.version}.`,
    `Service health indicators degraded within minutes of the change.`,
    `The affected service directly relies on shared backend resources modified in this release.`,
  ];
  let otherCauses = [
    'External network latency or upstream dependency degradation.',
    'Transient memory exhaustion or resource contention under high traffic load.',
  ];

  if (isDbRelated) {
    primaryCause = `Database connection saturation following recent update to ${suspectDep.service}.`;
    whyPoints = [
      'Database connection pool reached maximum capacity (198/200 active connections).',
      'Queries are queuing waiting for connection locks.',
      'Downstream services are failing with connection timeout exceptions.',
    ];
    otherCauses = [
      'Unindexed slow query locking table rows.',
      'Database replica replication lag.',
    ];
  } else if (isAuthRelated) {
    primaryCause = `Authentication service cryptographic bottleneck after recent config changes.`;
    whyPoints = [
      'CPU spikes observed on authentication nodes following the latest deployment.',
      'Token validation requests are taking >2,000ms, causing gateway timeouts.',
      'All incoming user traffic requires authorization verification before proceeding.',
    ];
  } else if (isLatencyRelated) {
    primaryCause = `Upstream network latency and request queue buildup in ${suspectDep.service}.`;
    whyPoints = [
      `Response time spiked to ${currentMetrics.responseTimeMs}ms right after deployment ${suspectDep.version}.`,
      'Worker threads are blocked waiting on external synchronous I/O operations.',
      'Client requests are timing out before completion.',
    ];
  }

  return {
    incidentQuery: query,
    primaryCause,
    whyExplanation: whyPoints,
    otherCauses,
    recommendedSolution: {
      title: 'Rollback the recent deployment.',
      description: `Revert ${suspectDep.service} from ${suspectDep.version} to the previous stable release (${currentDeployments[1]?.version || 'stable'}) and reset active connections.`,
      actionType: 'rollback',
      targetService: suspectDep.service,
      targetVersion: currentDeployments[1]?.version || 'v2.13.9',
      safetyLevel: 'Safe',
      estimatedDowntime: '0 seconds (Safe rolling rollback)',
    },
    evidence: {
      suspectDeployment: suspectDep,
      criticalLogs: currentLogs.slice(0, 3),
      metricsAnomaly: `Active error rate: ${currentMetrics.errorRate}%, Average latency: ${currentMetrics.responseTimeMs}ms.`,
    },
  };
}

/**
 * Executes the safe automated remediation
 * Simulates real-world steps with verification
 */
export async function executeRemediation(
  action: AnalysisResult['recommendedSolution'],
  simulateFailure: boolean = false
): Promise<IncidentStateReport> {
  // If simulated failure was requested by user for testing
  if (simulateFailure) {
    return {
      status: 'unresolved',
      metrics: {
        errorRate: 12.8,
        responseTimeMs: 980,
        throughputRps: 680,
        cpuUtilization: 79,
        databaseConnections: 182,
        maxDatabaseConnections: 200,
      },
      logs: [
        {
          id: `log-fail-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'ERROR',
          service: action.targetService,
          message: 'Post-rollback health check FAILED: 182 lingering zombie connections still blocking DB pool.',
        },
        {
          id: `log-fail-2-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'WARN',
          service: 'health-checker',
          message: 'Error rate remains above SLA threshold (12.8% > 1.0%). Incident still active.',
        },
      ],
      summary: 'Rollback completed, but lingering database connections prevented full recovery. Secondary connection flush required.',
    };
  }

  // Normal successful resolution
  return {
    status: 'resolved',
    metrics: {
      ...HEALTHY_METRICS,
      // Small realistic jitter
      responseTimeMs: 44,
      errorRate: 0.02,
    },
    logs: [
      {
        id: `log-res-1-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'deployment-manager',
        message: `Deployment ${action.targetVersion || 'v2.13.9'} successfully activated on ${action.targetService}.`,
      },
      {
        id: `log-res-2-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'health-checker',
        message: 'System health check: 100/100 synthetic probes PASSED. HTTP 200 OK.',
      },
      {
        id: `log-res-3-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        service: 'metrics-monitor',
        message: 'Error rate dropped to 0.02%. Latency returned to 44ms baseline.',
      },
    ],
    summary: `Successfully rolled back ${action.targetService} to ${action.targetVersion || 'stable version'}. All health checks passed and telemetry normalized.`,
  };
}
