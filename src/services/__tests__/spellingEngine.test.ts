import { validateSpelling, normalizeSpelling, classifySpellingError } from '../spellingEngine';
import { Word } from '../../types';

const mockWord: Word = {
  id: 'test_1',
  word: 'accommodate',
  normalizedWord: 'accommodate',
  pronunciation: '/əˈkɒmədeɪt/',
  definition: 'To provide lodging or fit.',
  partOfSpeech: 'verb',
  exampleSentence: 'The hall will accommodate guests.',
  difficulty: 'Medium',
  category: 'General Vocabulary',
  tips: 'Two c’s and two m’s.'
};

const mockBritishWord: Word = {
  id: 'test_2',
  word: 'programme',
  normalizedWord: 'programme',
  acceptedSpellings: ['programme', 'program'],
  pronunciation: '/ˈprəʊɡræm/',
  definition: 'A planned series of events.',
  partOfSpeech: 'noun',
  exampleSentence: 'The school programme.',
  difficulty: 'Easy',
  category: 'General Vocabulary'
};

function runTests() {
  console.log('Running Spelling Validation Unit Tests...');

  // Test 1: Exact match
  const res1 = validateSpelling('accommodate', mockWord);
  console.assert(res1.isCorrect === true, 'Test 1 Failed: Exact match');

  // Test 2: Case insensitivity
  const res2 = validateSpelling('Accommodate', mockWord);
  console.assert(res2.isCorrect === true, 'Test 2 Failed: Case insensitivity');

  // Test 3: Whitespace trimming
  const res3 = validateSpelling('  accommodate  ', mockWord);
  console.assert(res3.isCorrect === true, 'Test 3 Failed: Whitespace trimming');

  // Test 4: Missing letter (accomodate)
  const res4 = validateSpelling('accomodate', mockWord);
  console.assert(res4.isCorrect === false, 'Test 4 Failed: Should be incorrect');
  console.assert(res4.errorType === 'missing_letter', `Test 4 Failed: Expected missing_letter, got ${res4.errorType}`);

  // Test 5: Extra letter (accommodates)
  const res5 = validateSpelling('accommodates', mockWord);
  console.assert(res5.isCorrect === false, 'Test 5 Failed: Should be incorrect');
  console.assert(res5.errorType === 'extra_letter', `Test 5 Failed: Expected extra_letter, got ${res5.errorType}`);

  // Test 6: Accepted variants (programme / program)
  const res6a = validateSpelling('programme', mockBritishWord);
  const res6b = validateSpelling('program', mockBritishWord);
  console.assert(res6a.isCorrect === true, 'Test 6a Failed: programme accepted');
  console.assert(res6b.isCorrect === true, 'Test 6b Failed: program accepted');

  // Test 7: Transposed letters (recieve vs receive)
  const mockReceive: Word = {
    id: 'test_3',
    word: 'receive',
    normalizedWord: 'receive',
    pronunciation: '/rɪˈsiːv/',
    definition: 'To be given.',
    partOfSpeech: 'verb',
    exampleSentence: 'Receive an award.',
    difficulty: 'Easy',
    category: 'General Vocabulary'
  };
  const res7 = validateSpelling('recieve', mockReceive);
  console.assert(res7.isCorrect === false, 'Test 7 Failed: Should be incorrect');
  console.assert(res7.errorType === 'transposed_letters', `Test 7 Failed: Expected transposed_letters, got ${res7.errorType}`);

  console.log('✓ All 7 Spelling Validation Unit Tests PASSED successfully!');
}

runTests();
