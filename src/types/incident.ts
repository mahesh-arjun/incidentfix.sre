export type IncidentState =
  | 'idle'
  | 'analyzing'
  | 'analysis_ready'
  | 'awaiting_approval'
  | 'applying_fix'
  | 'verifying'
  | 'resolved'
  | 'unresolved';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  service: string;
  message: string;
  traceId?: string;
}

export interface Deployment {
  id: string;
  version: string;
  service: string;
  deployedAt: string;
  author: string;
  commitHash: string;
  commitMessage: string;
  status: 'active' | 'previous' | 'failed' | 'rolled_back';
  isSuspect?: boolean;
}

export interface SystemMetrics {
  errorRate: number; // percentage, e.g. 18.4%
  responseTimeMs: number; // e.g. 1420ms
  throughputRps: number; // e.g. 840 req/s
  cpuUtilization: number; // percentage, e.g. 82%
  databaseConnections: number; // active connections
  maxDatabaseConnections: number;
}

export interface AnalysisResult {
  incidentQuery: string;
  primaryCause: string;
  whyExplanation: string[];
  otherCauses: string[];
  recommendedSolution: {
    title: string;
    description: string;
    actionType: 'rollback' | 'restart_pool' | 'scale_up' | 'circuit_breaker';
    targetService: string;
    targetVersion?: string;
    safetyLevel: 'Safe' | 'Low Risk' | 'Medium Risk';
    estimatedDowntime: string;
  };
  evidence: {
    suspectDeployment?: Deployment;
    criticalLogs: LogEntry[];
    metricsAnomaly: string;
  };
}

export interface IncidentPreset {
  id: string;
  label: string;
  query: string;
  category: string;
  initialMetrics: SystemMetrics;
  suspectDeployment: Deployment;
  analysis: AnalysisResult;
}

export type LifecycleStage = 'Triggered' | 'Analyzed' | 'Approved' | 'Applied' | 'Resolved';

export interface IncidentLifecycleEvent {
  stage: LifecycleStage;
  label: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp?: string;
  timeElapsed?: string;
  actor: string;
  metricsSnapshot?: {
    errorRate: number;
    responseTimeMs: number;
  };
  details?: string;
}

// 1. Collect Evidence Artifact Package
export interface ForensicEvidencePackage {
  id: string;
  incidentId: string;
  collectedAt: string;
  checksum: string; // SHA-256
  collectorActor: string;
  criticalLogs: LogEntry[];
  metricAnomalies: {
    name: string;
    baseline: string;
    incidentPeak: string;
    delta: string;
    severity: 'CRITICAL' | 'HIGH' | 'WARN';
  }[];
  gitForensics: {
    repository: string;
    commitHash: string;
    author: string;
    pullRequest: string;
    deployTimestamp: string;
    changedFilesCount: number;
    diffSnippet: string;
  };
  dependencyHealth: {
    name: string;
    type: 'database' | 'gateway' | 'cache' | 'external_api';
    status: 'DEGRADED' | 'HEALTHY' | 'CRITICAL';
    latencyMs: number;
    connectionsUsed: string;
  }[];
}

// 2. Root Cause Analysis (5-Whys & Causal Graph)
export interface RootCauseAnalysisDetail {
  incidentId: string;
  analyzedAt: string;
  confidenceScore: number; // e.g. 96
  primaryCause: string;
  rootMechanism: string;
  fiveWhys: {
    step: number;
    whyQuestion: string;
    answer: string;
    evidenceLink: string;
  }[];
  impactRadius: {
    affectedServices: string[];
    userImpactDescription: string;
    failedTransactionsEstimate: number;
    p99LatencyDegradation: string;
  };
  contributingFactors: string[];
  preventativeMeasures: string[];
}

// 3. Sandbox Action (Dry-Run Staging Pipeline)
export interface SandboxDryRun {
  id: string;
  status: 'not_started' | 'running' | 'passed' | 'failed';
  targetNamespace: string;
  targetImage: string;
  startTime?: string;
  completedTime?: string;
  steps: {
    id: string;
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed';
    durationMs?: number;
    outputLog: string;
  }[];
  syntheticResults?: {
    requestsProcessed: number;
    successRate: number;
    p95LatencyMs: number;
    connectionLeaksFound: number;
    safeForProduction: boolean;
  };
}

// 4. Audit Trail Evaluation
export interface AuditTrailEvaluation {
  incidentId: string;
  evaluatedAt: string;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'FAILED';
  overallScore: number; // 0 - 100
  evaluatedBy: string;
  slaMetrics: {
    mttdSeconds: number; // Mean Time to Detect
    mttaSeconds: number; // Mean Time to Acknowledge
    mttdToResolveSeconds: number; // Mean Time to Resolve
    withinSla: boolean;
  };
  complianceChecklist: {
    category: string;
    item: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    standardCode: string; // e.g. "SOC2-CC7.2", "ISO-27001", "SRE-P0"
    auditNote: string;
  }[];
  executiveSummary: string;
  postMortemActionItems: {
    owner: string;
    action: string;
    priority: 'P0' | 'P1' | 'P2';
    deadline: string;
  }[];
}
