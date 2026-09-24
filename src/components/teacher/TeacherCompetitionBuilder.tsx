import React, { useState } from 'react';
import { AppView, Competition, CompetitionRound, CompetitionMode, QualificationRuleType, TieBreakerRule } from '../../types';
import { competitionService } from '../../services/competitionService';
import { dataService } from '../../services/dataService';
import { voiceService, GeminiVoiceName } from '../../services/voiceService';
import { COMPETITION_PRESETS, CompetitionPreset } from '../../data/competitionPresets';
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Volume2,
  Clock,
  Users,
  BookOpen,
  Settings,
  Sparkles,
  HelpCircle,
  Save
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onCompetitionCreated?: (compId: string) => void;
}

export const TeacherCompetitionBuilder: React.FC<Props> = ({
  onNavigate,
  onShowToast,
  onCompetitionCreated
}) => {
  const classes = dataService.getClasses();
  const enrolledStudents = dataService.getEnrolledStudents();
  const allWords = dataService.getWords();
  const wordSets = dataService.getWordSets();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Basic Information
  const [title, setTitle] = useState('Career Craft Academy Spelling Challenge');
  const [description, setDescription] = useState('Annual secondary school spelling heat with timed rounds and Gemini audio moderation.');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class_ss1_gold');
  const [selectedMode, setSelectedMode] = useState<CompetitionMode>('multi_round');

  // Step 2: Participants
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    enrolledStudents.filter(s => s.classId === selectedClassId).map(s => s.id)
  );

  // Step 3 & 4: Rounds & Word Pools
  const [rounds, setRounds] = useState<CompetitionRound[]>([
    {
      id: 'round_1',
      competitionId: '',
      name: 'Round 1: Preliminary Qualifier',
      order: 1,
      wordIds: allWords.slice(0, 8).map(w => w.id),
      status: 'pending',
      settings: {
        timePerWord: 30,
        roundTimeLimitMinutes: 8,
        allowReplay: true,
        maxReplaysAllowed: 2,
        allowDefinition: true,
        allowExample: false,
        strictPunctuation: false,
        caseSensitive: false,
        showImmediateFeedback: false,
        voiceName: 'Kore'
      },
      qualificationRule: {
        type: 'top_n',
        value: 4,
        tieBreaker: 'extra_round'
      }
    },
    {
      id: 'round_2',
      competitionId: '',
      name: 'Round 2: Championship Final',
      order: 2,
      wordIds: allWords.slice(8, 14).map(w => w.id),
      status: 'pending',
      settings: {
        timePerWord: 25,
        roundTimeLimitMinutes: 6,
        allowReplay: true,
        maxReplaysAllowed: 1,
        allowDefinition: true,
        allowExample: true,
        strictPunctuation: false,
        caseSensitive: false,
        showImmediateFeedback: false,
        voiceName: 'Kore'
      },
      qualificationRule: {
        type: 'top_n',
        value: 1,
        tieBreaker: 'extra_round'
      }
    }
  ]);

  // Step 5: Timing & Integrity Rules
  const [globalTimePerWord, setGlobalTimePerWord] = useState(30);
  const [preventCopyPaste, setPreventCopyPaste] = useState(true);
  const [trackTabSwitching, setTrackTabSwitching] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  // Step 6: Voice Settings
  const [selectedVoiceName, setSelectedVoiceName] = useState<GeminiVoiceName>('Kore');
  const [speechRate, setSpeechRate] = useState(0.88);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Apply a Preset
  const handleApplyPreset = (preset: CompetitionPreset) => {
    setSelectedMode(preset.mode);
    setGlobalTimePerWord(preset.timePerWord);

    // Build rounds according to preset
    const newRounds: CompetitionRound[] = [];
    let wordPointer = 0;

    for (let i = 0; i < preset.roundsCount; i++) {
      const slice = allWords.slice(wordPointer, wordPointer + preset.wordsPerRound);
      wordPointer += preset.wordsPerRound;

      newRounds.push({
        id: `r_preset_${i + 1}`,
        competitionId: '',
        name: i === 0 ? 'Round 1: Preliminary' : i === preset.roundsCount - 1 ? 'Final Round' : `Round ${i + 1}: Semi-Final`,
        order: i + 1,
        wordIds: slice.map(w => w.id),
        status: 'pending',
        settings: {
          timePerWord: preset.timePerWord,
          roundTimeLimitMinutes: 8,
          allowReplay: preset.allowReplay,
          maxReplaysAllowed: preset.allowReplay ? 2 : 0,
          allowDefinition: preset.allowDefinition,
          allowExample: preset.allowExample,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: selectedVoiceName
        },
        qualificationRule: {
          type: preset.qualificationType,
          value: preset.qualificationValue,
          tieBreaker: 'extra_round'
        }
      });
    }

    setRounds(newRounds);
    onShowToast(`Preset "${preset.name}" applied!`, 'success');
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    try {
      await voiceService.speakText(
        `Welcome to the spelling challenge. Your first word is, accommodation.`,
        { voiceName: selectedVoiceName }
      );
    } catch (e) {
      console.warn('Voice test issue', e);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedParticipantIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllClassStudents = () => {
    const classStudents = enrolledStudents.filter(s => s.classId === selectedClassId).map(s => s.id);
    setSelectedParticipantIds(classStudents);
  };

  const handleAddRound = () => {
    const newOrder = rounds.length + 1;
    const defaultWords = allWords.slice(0, 6).map(w => w.id);
    const newRound: CompetitionRound = {
      id: `r_custom_${Date.now()}`,
      competitionId: '',
      name: `Round ${newOrder}`,
      order: newOrder,
      wordIds: defaultWords,
      status: 'pending',
      settings: {
        timePerWord: globalTimePerWord,
        roundTimeLimitMinutes: 6,
        allowReplay: true,
        maxReplaysAllowed: 2,
        allowDefinition: true,
        allowExample: false,
        strictPunctuation: false,
        caseSensitive: false,
        showImmediateFeedback: false,
        voiceName: selectedVoiceName
      },
      qualificationRule: {
        type: 'top_n',
        value: 2,
        tieBreaker: 'extra_round'
      }
    };
    setRounds([...rounds, newRound]);
  };

  const handleRemoveRound = (idx: number) => {
    if (rounds.length <= 1) {
      onShowToast('Competitions must have at least one round.', 'error');
      return;
    }
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleSaveCompetition = (asDraft = false) => {
    const selectedClass = classes.find(c => c.id === selectedClassId);

    const compData: Partial<Competition> = {
      title,
      description,
      classId: selectedClassId,
      className: selectedClass?.name || 'Class Cohort',
      mode: selectedMode,
      status: asDraft ? 'draft' : 'ready',
      participantIds: selectedParticipantIds,
      rounds: rounds.map(r => ({
        ...r,
        settings: { ...r.settings, voiceName: selectedVoiceName }
      })),
      settings: {
        scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
        randomizeWordOrder: false,
        sharedWordSequence: true,
        preventCopyPaste,
        trackTabSwitching,
        showLeaderboardToStudents: showLeaderboard,
        disconnectionGracePeriodSeconds: 30,
        voiceModerator: { enabled: true, voiceName: selectedVoiceName, speechRate }
      }
    };

    const validation = competitionService.validateCompetition(compData);
    if (!validation.valid && !asDraft) {
      onShowToast(validation.errors[0], 'error');
      return;
    }

    const created = competitionService.createCompetition(compData);
    onShowToast(asDraft ? 'Competition saved as draft!' : 'Competition published and ready!', 'success');
    if (onCompetitionCreated) {
      onCompetitionCreated(created.id);
    }
    onNavigate('teacher-competition');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Top Wizard Steps Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Competition Setup Wizard</h1>
              <p className="text-xs text-slate-500">Configure rounds, timing, Gemini audio, and qualification rules</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('teacher-competition')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>

        {/* Step indicator bar */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Participants' },
            { num: 3, label: 'Word Pools' },
            { num: 4, label: 'Rounds' },
            { num: 5, label: 'Timing' },
            { num: 6, label: 'Voice' },
            { num: 7, label: 'Review' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-2 rounded-lg text-center transition-all ${
                currentStep === s.num
                  ? 'bg-indigo-600 text-white font-bold'
                  : currentStep > s.num
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider">{s.label}</div>
              <div className="text-xs font-bold">Step {s.num}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: BASIC INFO & PRESETS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Basic Information & Presets</h2>
            <p className="text-xs text-slate-500">Choose a starting template or specify custom competition details.</p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Recommended Presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COMPETITION_PRESETS.slice(0, 3).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition-all group"
                >
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">{p.name}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Competition Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class Cohort</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const enrolled = enrolledStudents.filter(s => s.classId === e.target.value).map(s => s.id);
                  setSelectedParticipantIds(enrolled);
                }}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.enrolledCount || 0} students)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Competition Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as CompetitionMode)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="multi_round">Multi-Round (Prelim → Semi → Final)</option>
                <option value="timed_test">Timed Speed Test (Rapid Countdown)</option>
                <option value="elimination">Sudden-Death Elimination</option>
                <option value="class_competition">Classroom Heat (Direct Standings)</option>
                <option value="practice_simulation">Solo Simulation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PARTICIPANTS */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Step 2: Participant Roster</h2>
              <p className="text-xs text-slate-500">Select which spellers are eligible to participate in this heat.</p>
            </div>
            <button
              type="button"
              onClick={handleSelectAllClassStudents}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Select All Class Spellers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {enrolledStudents.map(student => {
              const isSelected = selectedParticipantIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{student.studentCode} • {student.className}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-900">{selectedParticipantIds.length}</strong> participants.
          </div>
        </div>
      )}

      {/* STEP 3 & 4: ROUNDS & WORD POOLS */}
      {(currentStep === 3 || currentStep === 4) && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {currentStep === 3 ? 'Step 3: Word Selection by Round' : 'Step 4: Round Qualification & Elimination'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentStep === 3 ? 'Assign curriculum word pools for each round.' : 'Configure advancement criteria and tie-breakers.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Round
            </button>
          </div>

          <div className="space-y-4">
            {rounds.map((round, idx) => (
              <div key={round.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRounds(rounds.map((r, i) => i === idx ? { ...r, name: val } : r));
                      }}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-indigo-600 px-1 py-0.5"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove Round"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Step 3 specifics: Word count & pool */}
                {currentStep === 3 && (
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-slate-700">Word Pool ({round.wordIds.length} words):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {round.wordIds.map(wId => {
                        const w = dataService.getWordById(wId);
                        return (
                          <span key={wId} className="px-2 py-1 rounded-md bg-white border border-slate-200 font-medium text-slate-800">
                            {w?.word || wId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4 specifics: Qualification Rule */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Advancement Rule</label>
                      <select
                        value={round.qualificationRule.type}
                        onChange={(e) => {
                          const val = e.target.value as QualificationRuleType;
                          setRounds(rounds.map((r, i) => i === idx ? {
                            ...r,
                            qualificationRule: { ...r.qualificationRule, type: val }
                          } : r));
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="top_n">Top N Spellers Advance</option>
                        <option value="pass_mark">Minimum Score Percentage (%)</option>
                        <option value="top_percentage">Top Percentage (e.g. 50%)</option>
                        <option value="sudden_death">Sudden Death (100% only)</option>
                        <option value="all">All Advance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Cutoff Value</label>
                      <input
                        type="number"
                        value={round.qualificationRule.value}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRounds(rounds.map((r, i) => i === idx ? {
                            ...r,
                            qualificationRule: { ...r.qualificationRule, value: val }
                          } : r));
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tie-Breaker Rule</label>
                      <select
                        value={round.qualificationRule.tieBreaker}
                        onChange={(e) => {
                          const val = e.target.value as TieBreakerRule;
                          setRounds(rounds.map((r, i) => i === idx ? {
                            ...r,
                            qualificationRule: { ...r.qualificationRule, tieBreaker: val }
                          } : r));
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="extra_round">Sudden-Death Tie Round</option>
                        <option value="all_tied_advance">Advance All Tied</option>
                        <option value="fastest_time">Fastest Response Time</option>
                        <option value="teacher_decision">Moderator Decision</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: TIMING & INTEGRITY */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 5: Timing & Anti-Cheating Integrity</h2>
            <p className="text-xs text-slate-500">Configure authoritative timers and focus constraints.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time per Word</label>
              <select
                value={globalTimePerWord}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGlobalTimePerWord(val);
                  setRounds(rounds.map(r => ({ ...r, settings: { ...r.settings, timePerWord: val } })));
                }}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value={15}>15 Seconds (Sprint)</option>
                <option value={20}>20 Seconds (Fast)</option>
                <option value={30}>30 Seconds (Standard)</option>
                <option value={45}>45 Seconds (Relaxed)</option>
                <option value={60}>60 Seconds (Extended)</option>
              </select>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preventCopyPaste}
                  onChange={(e) => setPreventCopyPaste(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Disable Copy & Paste into answer field</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackTabSwitching}
                  onChange={(e) => setTrackTabSwitching(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Track browser tab switching & attention lapses</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLeaderboard}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Show live leaderboard standings to participants</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: VOICE SETTINGS */}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 6: Voice Moderator Audio</h2>
            <p className="text-xs text-slate-500">
              Select your Google Gemini API Studio pronouncer voice and test speech clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gemini API Voice Persona</label>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value as GeminiVoiceName)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Kore">Kore (Clear & Dignified British English)</option>
                <option value="Puck">Puck (Energetic & Articulate)</option>
                <option value="Fenrir">Fenrir (Authoritative & Deep)</option>
                <option value="Zephyr">Zephyr (Warm & Deliberate)</option>
                <option value="Charon">Charon (Measured & Formal)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                {isTestingVoice ? 'Pronouncing Sample...' : 'Test Voice Audio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: REVIEW & PUBLISH */}
      {currentStep === 7 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Step 7: Final Checklist & Confirmation</h2>
            <p className="text-xs text-slate-500">Review your competition parameters before publishing or saving as draft.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <div><strong>Title:</strong> {title}</div>
            <div><strong>Cohort:</strong> {classes.find(c => c.id === selectedClassId)?.name}</div>
            <div><strong>Participants:</strong> {selectedParticipantIds.length} spellers</div>
            <div><strong>Rounds:</strong> {rounds.length} rounds ({rounds.reduce((acc, r) => acc + r.wordIds.length, 0)} total words)</div>
            <div><strong>Time per Word:</strong> {globalTimePerWord} seconds</div>
            <div><strong>Audio Engine:</strong> Google Gemini API Studio Voice ({selectedVoiceName})</div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSaveCompetition(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSaveCompetition(false)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish Competition
            </button>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Step
        </button>

        {currentStep < 7 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>Next: Step {currentStep + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
