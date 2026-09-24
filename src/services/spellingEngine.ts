import { Word, SpellingValidationResult, SpellingErrorType } from '../types';

/**
 * Normalizes spelling answer for safe case-insensitive and whitespace-tolerant comparison.
 * IMPORTANT: Never performs autocorrection or fuzzy replacement.
 */
export function normalizeSpelling(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Classifies the type of spelling discrepancy between student answer and expected word.
 */
export function classifySpellingError(student: string, expected: string): {
  type: SpellingErrorType;
  details?: string;
} {
  if (student === expected) {
    return { type: 'none' };
  }

  const sLen = student.length;
  const eLen = expected.length;

  // 1. Transposed adjacent letters (e.g. "ei" vs "ie")
  if (sLen === eLen) {
    let diffIndices: number[] = [];
    for (let i = 0; i < sLen; i++) {
      if (student[i] !== expected[i]) {
        diffIndices.push(i);
      }
    }

    if (
      diffIndices.length === 2 &&
      diffIndices[1] === diffIndices[0] + 1 &&
      student[diffIndices[0]] === expected[diffIndices[1]] &&
      student[diffIndices[1]] === expected[diffIndices[0]]
    ) {
      return {
        type: 'transposed_letters',
        details: `Swapped letters at positions ${diffIndices[0] + 1} and ${diffIndices[1] + 1}.`
      };
    }

    if (diffIndices.length === 1) {
      const idx = diffIndices[0];
      return {
        type: 'wrong_letter',
        details: `Letter '${student[idx]}' used instead of '${expected[idx]}'.`
      };
    }

    if (diffIndices.length <= 2) {
      return { type: 'multiple_errors' };
    }
  }

  // 2. Missing single letter (e.g. "accomodate" instead of "accommodate")
  if (sLen === eLen - 1) {
    let sIdx = 0;
    let eIdx = 0;
    let mismatches = 0;
    let missingChar = '';

    while (sIdx < sLen && eIdx < eLen) {
      if (student[sIdx] === expected[eIdx]) {
        sIdx++;
        eIdx++;
      } else {
        mismatches++;
        missingChar = expected[eIdx];
        eIdx++;
        if (mismatches > 1) break;
      }
    }

    if (mismatches <= 1) {
      return {
        type: 'missing_letter',
        details: `Missing letter '${missingChar || expected[eLen - 1]}'.`
      };
    }
  }

  // 3. Extra single letter (e.g. "beautifull" instead of "beautiful")
  if (sLen === eLen + 1) {
    let sIdx = 0;
    let eIdx = 0;
    let mismatches = 0;
    let extraChar = '';

    while (sIdx < sLen && eIdx < eLen) {
      if (student[sIdx] === expected[eIdx]) {
        sIdx++;
        eIdx++;
      } else {
        mismatches++;
        extraChar = student[sIdx];
        sIdx++;
        if (mismatches > 1) break;
      }
    }

    if (mismatches <= 1) {
      return {
        type: 'extra_letter',
        details: `Extra letter '${extraChar || student[sLen - 1]}'.`
      };
    }
  }

  // Check character overlap
  const studentChars = new Set(student);
  const expectedChars = new Set(expected);
  let commonCount = 0;
  studentChars.forEach(c => {
    if (expectedChars.has(c)) commonCount++;
  });

  if (commonCount <= 2 && sLen > 3) {
    return { type: 'completely_different' };
  }

  return { type: 'multiple_errors' };
}

/**
 * Validates student's spelling answer against target word and accepted variants.
 */
export function validateSpelling(
  studentAnswer: string,
  expectedWord: Word
): SpellingValidationResult {
  const normStudent = normalizeSpelling(studentAnswer);
  const normExpected = normalizeSpelling(expectedWord.normalizedWord || expectedWord.word);

  // Check if matches main word
  let isMatch = normStudent === normExpected;

  // Check accepted spellings (e.g. British vs American forms if configured)
  if (!isMatch && expectedWord.acceptedSpellings && expectedWord.acceptedSpellings.length > 0) {
    isMatch = expectedWord.acceptedSpellings.some(
      variant => normalizeSpelling(variant) === normStudent
    );
  }

  if (isMatch) {
    return {
      isCorrect: true,
      studentAnswer,
      expectedAnswer: expectedWord.word,
      normalizedStudentAnswer: normStudent,
      normalizedExpectedAnswer: normExpected,
      errorType: 'none',
      feedback: 'Correct! Excellent spelling.',
      tip: expectedWord.tips
    };
  }

  const { type, details } = classifySpellingError(normStudent, normExpected);

  let feedback = "Not quite. Let's study this one.";
  if (type === 'missing_letter') {
    feedback = 'Close! You seem to be missing a letter.';
  } else if (type === 'extra_letter') {
    feedback = 'Close! Watch out for an unnecessary extra letter.';
  } else if (type === 'transposed_letters') {
    feedback = 'Careful! Two adjacent letters appear to be swapped.';
  } else if (type === 'wrong_letter') {
    feedback = 'Almost there! Check one of the vowel or consonant letters.';
  }

  return {
    isCorrect: false,
    studentAnswer,
    expectedAnswer: expectedWord.word,
    normalizedStudentAnswer: normStudent,
    normalizedExpectedAnswer: normExpected,
    errorType: type,
    feedback,
    tip: expectedWord.tips
  };
}
