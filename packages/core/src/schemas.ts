import { z } from 'zod';

export const DocMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  license: z.string().optional(),
  repository: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lastModified: z.string().optional(),
}).passthrough();

export const HeadingItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number().int().min(1).max(6),
});

export const DocSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.number().int(),
  content: z.string(),
  startLine: z.number().int(),
  endLine: z.number().int(),
});

export const ReadabilityMetricsSchema = z.object({
  fleschKincaidScore: z.number(),
  fleschReadingEase: z.number(),
  readingTimeMinutes: z.number(),
  wordCount: z.number(),
  sentenceCount: z.number(),
  syllableCount: z.number(),
  avgSentenceLength: z.number(),
  codeToProseRatio: z.number(),
  readingEaseLabel: z.enum([
    'Very Easy',
    'Easy',
    'Fairly Easy',
    'Standard',
    'Fairly Difficult',
    'Difficult',
    'Very Confusing'
  ]),
});

export const ThreatSeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const ThreatCategorySchema = z.enum([
  'curl_bash',
  'base64_payload',
  'hidden_chars',
  'prompt_injection',
  'suspicious_domain',
  'typosquatted_command',
]);

export const SecurityThreatSchema = z.object({
  id: z.string(),
  category: ThreatCategorySchema,
  severity: ThreatSeveritySchema,
  title: z.string(),
  description: z.string(),
  snippet: z.string().optional(),
  line: z.number().optional(),
  remediation: z.string(),
});

export const MissingSectionCheckSchema = z.object({
  key: z.string(),
  name: z.string(),
  found: z.boolean(),
  required: z.boolean(),
  scoreWeight: z.number(),
  matchedHeading: z.string().optional(),
  suggestion: z.string(),
});

export const QuickStartDataSchema = z.object({
  packageManagers: z.object({
    npm: z.string().optional(),
    pnpm: z.string().optional(),
    yarn: z.string().optional(),
    bun: z.string().optional(),
    cargo: z.string().optional(),
    pip: z.string().optional(),
    go: z.string().optional(),
    docker: z.string().optional(),
  }),
  envVariables: z.array(
    z.object({
      name: z.string(),
      defaultValue: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  scripts: z.array(
    z.object({
      name: z.string(),
      command: z.string(),
    })
  ),
  ports: z.array(z.number()),
  requirements: z.array(z.string()),
});

export const HealthScoreBreakdownSchema = z.object({
  structure: z.number().min(0).max(15),
  completeness: z.number().min(0).max(20),
  readability: z.number().min(0).max(15),
  accessibility: z.number().min(0).max(15),
  security: z.number().min(0).max(15),
  onboardingQuality: z.number().min(0).max(20),
});

export const HealthScoreResultSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.enum(['A+', 'A', 'B', 'C', 'D', 'F']),
  breakdown: HealthScoreBreakdownSchema,
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

export const LintViolationSchema = z.object({
  ruleId: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info']),
  line: z.number(),
  column: z.number().optional(),
  autoFixable: z.boolean(),
  fix: z.object({
    range: z.tuple([z.number(), z.number()]),
    replacement: z.string(),
  }).optional(),
});

export const LintConfigSchema = z.object({
  rules: z.record(z.enum(['off', 'warn', 'error'])).default({}),
  extends: z.array(z.string()).optional(),
  ignorePatterns: z.array(z.string()).optional(),
});
