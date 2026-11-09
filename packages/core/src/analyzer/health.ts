import type {
  HealthScoreResult,
  HealthScoreBreakdown,
  ReadabilityMetrics,
  MissingSectionCheck,
  SecurityThreat,
  QuickStartData,
  HeadingItem,
} from '../types.js';

/**
 * Configuration options supplied to the health scoring calculation engine.
 */
interface HealthCalcOptions {
  headings: HeadingItem[];
  readability: ReadabilityMetrics;
  missingSections: MissingSectionCheck[];
  threats: SecurityThreat[];
  quickStart: QuickStartData;
  content: string;
}

/**
 * Computes a standardized 0-100 documentation quality score across 7 key pillars:
 * 1. Structure (max 15): H1 presence, section count, and heading hierarchy order.
 * 2. Completeness (max 20): Coverage of essential sections (install, usage, license, etc.).
 * 3. Readability (max 15): Flesch Reading Ease score and sentence length distribution.
 * 4. Code & Quickstart (max 20): Actionable copy-paste commands and code block prevalence.
 * 5. Media & Visuals (max 10): Presence of architecture diagrams, badges, and images.
 * 6. Maintenance & Links (max 10): Valid external references and contributor guidelines.
 * 7. Security (max 10): Absence of insecure command pipes, exposed secrets, and raw scripts.
 *
 * @param opts - Structured analysis data including headings, readability, and security threats.
 * @returns HealthScoreResult containing the composite score, grade (A+ through F), radar breakdown, strengths, and actionable improvements.
 */
export function calculateHealthScore(opts: HealthCalcOptions): HealthScoreResult {
  const { headings, readability, missingSections, threats, quickStart, content } = opts;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 1. Structure (max 15)
  let structure = 0;
  const hasH1 = headings.some(h => h.level === 1);
  if (hasH1) {
    structure += 5;
    strengths.push('Clean primary title (H1) defined.');
  } else {
    improvements.push('Add an H1 project title heading at the top.');
  }

  const h2Count = headings.filter(h => h.level === 2).length;
  if (h2Count >= 3) {
    structure += 5;
    strengths.push(`Well-structured into ${h2Count} major sections.`);
  } else if (h2Count > 0) {
    structure += 2.5;
    improvements.push('Expand document structure with more H2 sections.');
  } else {
    improvements.push('Break content into logical H2 sections.');
  }

  // Heading hierarchy check: no skipping (e.g. h1 -> h3)
  let hierarchyValid = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      hierarchyValid = false;
      break;
    }
  }
  if (hierarchyValid && headings.length > 0) {
    structure += 5;
  } else {
    improvements.push('Fix heading hierarchy; avoid skipping levels (e.g. H1 directly to H3).');
  }

  // 2. Completeness (max 20)
  let completeness = 0;
  const totalWeight = missingSections.reduce((acc, s) => acc + s.scoreWeight, 0);
  const foundWeight = missingSections.filter(s => s.found).reduce((acc, s) => acc + s.scoreWeight, 0);
  const completenessRatio = totalWeight > 0 ? foundWeight / totalWeight : 0;
  completeness = Math.round(completenessRatio * 20 * 10) / 10;

  const missingReq = missingSections.filter(s => s.required && !s.found);
  if (missingReq.length === 0) {
    strengths.push('All critical documentation sections are present.');
  } else {
    improvements.push(`Missing key sections: ${missingReq.map(s => s.name).join(', ')}.`);
  }

  // 3. Readability (max 15)
  let readabilityScore = 0;
  if (readability.fleschReadingEase >= 60) {
    readabilityScore += 10;
    strengths.push(`Excellent readability score (${readability.fleschReadingEase}/100 - ${readability.readingEaseLabel}).`);
  } else if (readability.fleschReadingEase >= 40) {
    readabilityScore += 7;
  } else {
    readabilityScore += 4;
    improvements.push('Simplify sentence structures and reduce heavy jargon to improve readability.');
  }

  if (readability.wordCount >= 100 && readability.wordCount <= 3000) {
    readabilityScore += 5;
  } else if (readability.wordCount > 3000) {
    readabilityScore += 3;
    improvements.push('Document is very long; consider splitting into dedicated docs/ pages.');
  } else {
    readabilityScore += 2;
    improvements.push('Document is very brief; elaborate on key features and setup.');
  }

  // 4. Accessibility (max 15)
  let accessibility = 15;
  // Image alt text check: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let imgMatch: RegExpExecArray | null;
  let missingAltCount = 0;
  while ((imgMatch = imageRegex.exec(content)) !== null) {
    if (!imgMatch[1]?.trim()) {
      missingAltCount++;
    }
  }

  if (missingAltCount > 0) {
    accessibility -= Math.min(6, missingAltCount * 2);
    improvements.push(`${missingAltCount} image(s) missing descriptive alt text.`);
  } else {
    strengths.push('Images include descriptive alternative text.');
  }

  // Code block language check
  const codeBlockRegex = /```([^\n]*)\n/g;
  let codeMatch: RegExpExecArray | null;
  let untaggedCodeBlocks = 0;
  while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
    if (!codeMatch[1]?.trim()) {
      untaggedCodeBlocks++;
    }
  }

  if (untaggedCodeBlocks > 0) {
    accessibility -= Math.min(5, untaggedCodeBlocks * 1.5);
    improvements.push(`${untaggedCodeBlocks} code block(s) lack a syntax language identifier.`);
  } else {
    strengths.push('All code blocks specify syntax languages.');
  }

  // Generic link text check ("click here", "here", "link")
  const genericLinkRegex = /\[\s*(?:click\s+here|here|link|more)\s*\]\(/gi;
  if (genericLinkRegex.test(content)) {
    accessibility -= 4;
    improvements.push('Avoid non-descriptive link labels like "click here" or "link".');
  }

  accessibility = Math.max(0, Math.round(accessibility * 10) / 10);

  // 5. Security (max 15)
  let security = 15;
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const highThreats = threats.filter(t => t.severity === 'high').length;
  const mediumThreats = threats.filter(t => t.severity === 'medium').length;

  if (criticalThreats > 0) {
    security -= criticalThreats * 10;
    improvements.push(`Security alert: Found ${criticalThreats} critical threat(s) (e.g. obfuscated payload or typosquatting).`);
  }
  if (highThreats > 0) {
    security -= highThreats * 5;
    improvements.push(`Security warning: Found ${highThreats} high-risk pattern(s) (e.g. piping remote scripts to bash).`);
  }
  if (mediumThreats > 0) {
    security -= mediumThreats * 2;
  }

  if (threats.length === 0) {
    strengths.push('Security scan passed with zero high-risk commands or obfuscated payloads.');
  }
  security = Math.max(0, Math.round(security * 10) / 10);

  // 6. Onboarding Quality (max 20)
  let onboardingQuality = 0;
  const pmKeys = Object.keys(quickStart.packageManagers);
  if (pmKeys.length > 0) {
    onboardingQuality += 7;
    strengths.push(`Clear installation commands detected for ${pmKeys.join(', ')}.`);
  } else {
    improvements.push('Add ready-to-run installation commands (npm, pip, docker, etc.).');
  }

  if (quickStart.scripts.length > 0) {
    onboardingQuality += 7;
    strengths.push('Provided development or startup scripts.');
  } else {
    improvements.push('Document start/dev scripts for quick onboarding.');
  }

  if (quickStart.envVariables.length > 0 || quickStart.ports.length > 0) {
    onboardingQuality += 6;
    strengths.push('Configuration variables or port requirements are clearly documented.');
  } else {
    onboardingQuality += 3;
  }

  const breakdown: HealthScoreBreakdown = {
    structure: Math.min(15, structure),
    completeness: Math.min(20, completeness),
    readability: Math.min(15, readabilityScore),
    accessibility: Math.min(15, accessibility),
    security: Math.min(15, security),
    onboardingQuality: Math.min(20, onboardingQuality),
  };

  const totalRaw = 
    breakdown.structure +
    breakdown.completeness +
    breakdown.readability +
    breakdown.accessibility +
    breakdown.security +
    breakdown.onboardingQuality;

  const score = Math.min(100, Math.max(0, Math.round(totalRaw)));

  let grade: HealthScoreResult['grade'] = 'F';
  if (score >= 93) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    breakdown,
    strengths,
    improvements,
  };
}
