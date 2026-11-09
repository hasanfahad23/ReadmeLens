export interface DocMetadata {
  title?: string;
  description?: string;
  author?: string;
  version?: string;
  license?: string;
  repository?: string;
  tags?: string[];
  lastModified?: string;
  [key: string]: unknown;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface DocSection {
  id: string;
  title: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

export interface ReadabilityMetrics {
  fleschKincaidScore: number;
  fleschReadingEase: number;
  readingTimeMinutes: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgSentenceLength: number;
  codeToProseRatio: number;
  readingEaseLabel: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' | 'Very Confusing';
}

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ThreatCategory = 
  | 'curl_bash' 
  | 'base64_payload' 
  | 'hidden_chars' 
  | 'prompt_injection' 
  | 'suspicious_domain' 
  | 'typosquatted_command';

export interface SecurityThreat {
  id: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  title: string;
  description: string;
  snippet?: string;
  line?: number;
  remediation: string;
}

export interface MissingSectionCheck {
  key: string;
  name: string;
  found: boolean;
  required: boolean;
  scoreWeight: number;
  matchedHeading?: string;
  suggestion: string;
}

export interface QuickStartData {
  packageManagers: {
    npm?: string;
    pnpm?: string;
    yarn?: string;
    bun?: string;
    cargo?: string;
    pip?: string;
    go?: string;
    docker?: string;
  };
  envVariables: Array<{ name: string; defaultValue?: string; description?: string }>;
  scripts: Array<{ name: string; command: string }>;
  ports: number[];
  requirements: string[];
}

export interface HealthScoreBreakdown {
  structure: number;        // max 15
  completeness: number;     // max 20
  readability: number;      // max 15
  accessibility: number;    // max 15
  security: number;         // max 15
  onboardingQuality: number;// max 20
}

export interface HealthScoreResult {
  score: number;            // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: HealthScoreBreakdown;
  strengths: string[];
  improvements: string[];
}

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintViolation {
  ruleId: string;
  message: string;
  severity: LintSeverity;
  line: number;
  column?: number;
  autoFixable: boolean;
  fix?: {
    range: [number, number];
    replacement: string;
  };
}

export interface LintResult {
  filePath?: string;
  violations: LintViolation[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  fixedContent?: string;
}

export interface AnalysisReport {
  metadata: DocMetadata;
  headings: HeadingItem[];
  sections: DocSection[];
  readability: ReadabilityMetrics;
  health: HealthScoreResult;
  security: {
    threats: SecurityThreat[];
    passed: boolean;
  };
  missingSections: MissingSectionCheck[];
  quickStart: QuickStartData;
  lint: LintResult;
}
