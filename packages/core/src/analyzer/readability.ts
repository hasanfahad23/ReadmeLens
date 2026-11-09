import type { ReadabilityMetrics } from '../types.js';

function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean || clean.length <= 2) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevIsVowel = false;

  for (let i = 0; i < clean.length; i++) {
    const isVowel = vowels.includes(clean[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }

  // Adjust for silent 'e' at the end
  if (clean.endsWith('e') && !clean.endsWith('le') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

export function calculateReadability(content: string): ReadabilityMetrics {
  // Strip code blocks and HTML comments for pure prose analysis
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const codeLines = codeBlocks.reduce((acc, block) => acc + block.split('\n').length, 0);
  const totalLines = content.split('\n').length || 1;

  const proseOnly = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Extract link text
    .replace(/[#*`~_>]/g, ' ')
    .trim();

  // Words
  const words = proseOnly.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = Math.max(1, words.length);

  // Sentences
  const sentences = proseOnly.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllablesInWord(word);
  }

  // Flesch formulas
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  let fleschReadingEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  fleschReadingEase = Math.round(Math.max(0, Math.min(100, fleschReadingEase)) * 10) / 10;

  let fleschKincaidScore = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  fleschKincaidScore = Math.round(Math.max(0, fleschKincaidScore) * 10) / 10;

  // Reading time (standard 200 WPM)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Code to prose ratio
  const codeToProseRatio = Math.round((codeLines / totalLines) * 100) / 100;

  // Qualitative label
  let readingEaseLabel: ReadabilityMetrics['readingEaseLabel'] = 'Standard';
  if (fleschReadingEase >= 90) readingEaseLabel = 'Very Easy';
  else if (fleschReadingEase >= 80) readingEaseLabel = 'Easy';
  else if (fleschReadingEase >= 70) readingEaseLabel = 'Fairly Easy';
  else if (fleschReadingEase >= 60) readingEaseLabel = 'Standard';
  else if (fleschReadingEase >= 50) readingEaseLabel = 'Fairly Difficult';
  else if (fleschReadingEase >= 30) readingEaseLabel = 'Difficult';
  else readingEaseLabel = 'Very Confusing';

  return {
    fleschKincaidScore,
    fleschReadingEase,
    readingTimeMinutes,
    wordCount,
    sentenceCount,
    syllableCount,
    avgSentenceLength: Math.round(wordsPerSentence * 10) / 10,
    codeToProseRatio,
    readingEaseLabel,
  };
}
