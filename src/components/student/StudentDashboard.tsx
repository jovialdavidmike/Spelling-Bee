import React, { useState } from 'react';
import { AppView, Student, SessionSettings, TeacherAssignment, Word } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import {
  Flame,
  Target,
  BookOpen,
  Trophy,
  Zap,
  RotateCcw,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  KeyRound,
  MessageSquare,
  Lock,
  Share2
} from 'lucide-react';
import { DailyStreakCard } from './DailyStreakCard';
import { ShareProgressModal } from './ShareProgressModal';
import { WeeklyTopSpellersDashboardWidget } from './WeeklyTopSpellersDashboardWidget';

interface Props {
  onNavigate: (view: AppView) => void;
  onLaunchPractice?: (settings: SessionSettings, wordIds?: string[], title?: string, assignmentId?: string) => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate, onLaunchPractice }) => {
  const currentUser = authService.getCurrentUser();
  const student = dataService.getStudent();
  const streakData = dataService.getStudentStreakData();
  const words = dataService.getWords();
  const assignments = dataService.getAssignments();
  const recentSessions = dataService.getPracticeSessions().slice(0, 3);
  const enrolledStudent = currentUser?.id ? dataService.getEnrolledStudentById(currentUser.id) : undefined;
  const achievements = dataService.getAchievements();
  const weeklyData = dataService.getWeeklyTopSpellers();

  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalMode, setShareModalMode] = useState<'all' | 'streak' | 'achievement'>('all');

  // Student weak words
  const weakWordIds = enrolledStudent?.weakWords?.length
    ? enrolledStudent.weakWords
    : student.recentMistakes?.length
    ? student.recentMistakes
    : ['w1', 'w6', 'w12', 'w20'];

  const weakWords: Word[] = weakWordIds
    .map(id => dataService.getWordById(id))
    .filter(Boolean) as Word[];

  // Class assignments for this student's class
  const studentClassName = currentUser?.className || student.className;
  const classAssignments = assignments.filter(a =>
    a.status === 'active' &&
    (!a.classId || a.targetClass.toLowerCase().includes(studentClassName.toLowerCase().slice(0, 4)) || a.targetClass.includes('All'))
  );

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartTodayPractice = () => {
    if (onLaunchPractice) {
      onLaunchPractice({
        mode: 'quick',
        wordCount: 15,
        difficulty: 'Mixed',
        category: 'All Categories',
        allowSkip: true,
        allowRetry: true,
        showDefinitionAfterAnswer: true,
        showExampleAfterAnswer: true,
        scoringRule: 'standard'
      }, undefined, "Today's Daily Spelling Drill");
    } else {
      onNavigate('practice-setup');
    }
  };

  const handleStartAssignment = (asg: TeacherAssignment) => {
    const isCompleted = dataService.getAssignmentSubmissions(asg.id).some(s => s.studentId === (currentUser?.id || student.id));
    if (isCompleted && asg.settings?.attemptsAllowed === 1) {
      return;
    }

    if (onLaunchPractice) {
      const asgSettings: SessionSettings = {
        mode: (asg.mode as any) || 'assignment',
        wordCount: asg.wordIds?.length || asg.wordCount,
        difficulty: asg.difficulty,
        category: asg.category,
        allowSkip: asg.mode === 'practice',
        allowRetry: asg.settings?.attemptsAllowed ? asg.settings.attemptsAllowed > 1 : false,
        showDefinitionAfterAnswer: asg.settings?.allowDefinition ?? true,
        showExampleAfterAnswer: asg.settings?.allowExample ?? true,
        scoringRule: asg.mode === 'competition' ? 'competition' : 'standard'
      };
      onLaunchPractice(asgSettings, asg.wordIds, asg.title, asg.id);
    } else {
      onNavigate('practice');
    }
  };

  const handlePracticeWeakWords = () => {
    if (weakWordIds.length === 0) return;
    if (onLaunchPractice) {
      onLaunchPractice({
        mode: 'mistakes',
        wordCount: weakWordIds.length,
        difficulty: 'Mixed',
        category: 'All Categories',
        allowSkip: true,
        allowRetry: true,
        showDefinitionAfterAnswer: true,
        showExampleAfterAnswer: true,
        scoringRule: 'standard'
      }, weakWordIds, "Targeted Weak Words Practice");
    } else {
      onNavigate('mistakes');
    }
  };

  const handleJoinClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = dataService.joinClassByCode(currentUser?.id || student.id, joinCodeInput.trim());
    setJoinMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setIsJoinCodeOpen(false);
        setJoinMessage(null);
        setJoinCodeInput('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-xs">
      
      {/* Welcome & Motivational Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span>{studentClassName}</span>
            <span>·</span>
            <span>{currentUser?.schoolName || student.school}</span>
            {currentUser?.studentCode && (
              <>
                <span>·</span>
                <span className="font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                  {currentUser.studentCode}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {getGreetingTime()}, {currentUser?.name || student.name} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            "What should I do today?" — Complete your assigned work and review weak words to prepare for competition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setShareModalMode('all');
              setIsShareModalOpen(true);
            }}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
            title="Share your streak and latest achievements on social media"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Share Progress</span>
          </button>

          <button
            onClick={() => setIsJoinCodeOpen(true)}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Join Class</span>
          </button>

          <button
            onClick={handleStartTodayPractice}
            className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Start Today's Practice</span>
          </button>
        </div>
      </div>

      {/* Dedicated Daily Streak Tracking System */}
      <DailyStreakCard
        streakData={streakData}
        onStartPractice={handleStartTodayPractice}
        onShareStreak={() => {
          setShareModalMode('streak');
          setIsShareModalOpen(true);
        }}
      />

      {/* Primary Progress Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Overall Accuracy</div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {enrolledStudent?.accuracy ?? student.accuracy}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Best: {student.bestScore}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Words Mastered</div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {enrolledStudent?.wordsMastered ?? student.wordsMastered}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {enrolledStudent?.wordsPracticed ?? student.wordsPracticed} practiced
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Daily Streak</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShareModalMode('streak');
                  setIsShareModalOpen(true);
                }}
                className="text-slate-400 hover:text-amber-600 p-0.5 rounded transition-colors cursor-pointer"
                title="Share Streak"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  streakData.isPracticedToday
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                }`}
              >
                {streakData.isPracticedToday ? 'Active ✓' : 'Practice Today'}
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600 font-mono flex items-center gap-1.5">
            <Flame className={`w-7 h-7 ${streakData.isPracticedToday ? 'fill-amber-500 text-amber-500 animate-pulse' : 'fill-amber-400 text-amber-400'}`} />
            <span>{streakData.currentStreak} <span className="text-sm font-normal text-slate-500">days</span></span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Best: {streakData.longestStreak} days</span>
            <span className="text-amber-700 font-semibold">{streakData.nextMilestone.badge.split(' ')[0]}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Assigned Work</div>
          <div className="text-3xl font-bold text-indigo-700 font-mono">
            {classAssignments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active drills from teacher
          </div>
        </div>
      </div>

      {/* WEEKLY TOP SPELLERS COMPETITIVE DASHBOARD WIDGET */}
      <WeeklyTopSpellersDashboardWidget
        spellers={weeklyData.spellers}
        currentUserSpeller={weeklyData.currentUserSpeller}
        currentUserRank={weeklyData.currentUserRank}
        meta={weeklyData.meta}
        onNavigate={onNavigate}
        onStartPractice={handleStartTodayPractice}
      />

      {/* ASSIGNED WORK SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Assigned Work from Your Teacher</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">{classAssignments.length} assignments active</span>
        </div>

        <div className="space-y-3">
          {classAssignments.map(asg => {
            const submissions = dataService.getAssignmentSubmissions(asg.id).filter(s => s.studentId === (currentUser?.id || student.id));
            const latestSub = submissions[0];
            const isCompleted = !!latestSub;
            const teacherComment = latestSub?.teacherComment || asg.teacherComments?.[currentUser?.id || student.id];

            return (
              <div
                key={asg.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{asg.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 uppercase">
                        {asg.mode || 'practice'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {asg.wordCount} words · Due: <strong>{asg.dueDate}</strong> · {asg.timeLimitMinutes} mins limit
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isCompleted ? (
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-emerald-700 block">{latestSub.accuracy}%</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartAssignment(asg)}
                        className="px-4 py-2 font-semibold text-xs text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Assignment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Teacher Comment if present */}
                {teacherComment && (
                  <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Teacher Feedback: </strong>
                      <span>"{teacherComment}"</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {classAssignments.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No active assignments currently assigned for your class. You can practice independently!
            </div>
          )}
        </div>
      </div>

      {/* SPLIT: YOUR WEAK AREAS & RECENT RESULTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Your Weak Areas (Keep Practicing) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">Your Weak Areas (Keep Practicing)</h2>
            </div>
            
            <button
              onClick={handlePracticeWeakWords}
              className="px-3 py-1 font-semibold text-[11px] text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer"
            >
              Practice Weak Words →
            </button>
          </div>

          <p className="text-slate-500 text-[11px]">
            Words you recently misspelled. Re-testing these words cements spelling memory before competition heats.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {weakWords.map(w => (
              <div
                key={w.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-1"
              >
                <div className="font-bold text-slate-900 text-sm">{w.word}</div>
                <div className="font-mono text-[10px] text-slate-400">{w.pronunciation}</div>
                <div className="text-[10px] text-rose-600 font-mono">
                  Review spelling
                </div>
              </div>
            ))}

            {weakWords.length === 0 && (
              <div className="col-span-2 py-6 text-center text-slate-500">
                You currently have no flagged mistakes! Outstanding accuracy.
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Results */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Practice Results</h2>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Full History →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentSessions.length > 0 ? (
              recentSessions.map(sess => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{sess.title}</div>
                    <div className="text-slate-500 text-[11px]">
                      {sess.correctCount} / {sess.attempts.length} correct · {Math.floor(sess.durationSeconds / 60)}m {sess.durationSeconds % 60}s
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-emerald-700 block">{sess.accuracy}%</span>
                    <span className="text-[10px] text-slate-400">+{sess.score} XP</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-500">
                Complete a spelling session to see your recent results here.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LATEST UNLOCKED ACHIEVEMENTS & SOCIAL SHARE SHOWCASE */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-50/30 p-6 rounded-2xl border border-amber-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              🏆
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Latest Achievements & Milestones</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {achievements.filter(a => a.unlocked).length} Unlocked
                </span>
              </h2>
              <p className="text-[11px] text-slate-600">
                Celebrate your spelling mastery and share your progress on social media
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShareModalMode('achievement');
                setIsShareModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Achievements</span>
            </button>

            <button
              onClick={() => onNavigate('achievements')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 px-2 py-1 cursor-pointer"
            >
              All Badges →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements
            .filter(a => a.unlocked)
            .slice(0, 3)
            .map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 rounded-xl bg-white/90 border border-amber-200/80 hover:border-amber-300 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold shrink-0">
                      ★
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1">{ach.title}</h4>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShareModalMode('achievement');
                      setIsShareModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-amber-600 p-1 rounded transition-colors cursor-pointer"
                    title={`Share "${ach.title}"`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {ach.description}
                </p>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{ach.unlockedAt ? `Unlocked ${ach.unlockedAt}` : 'Achieved'}</span>
                  <span className="font-mono text-amber-700 font-semibold">{ach.progressLabel}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Independent Training Modes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigate('practice-setup')}
            className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 text-left transition-colors cursor-pointer group"
          >
            <Zap className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Practice Hub</div>
            <div className="text-xs text-slate-600 mt-0.5">Configure custom drills</div>
          </button>

          <button
            onClick={() => onNavigate('competition')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <Trophy className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Competition Mode</div>
            <div className="text-xs text-slate-600 mt-0.5">Timed 60s rounds</div>
          </button>

          <button
            onClick={() => onNavigate('mistakes')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Mistakes Review</div>
            <div className="text-xs text-slate-600 mt-0.5">{weakWordIds.length} flagged words</div>
          </button>

          <button
            onClick={() => onNavigate('word-library')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Word Library</div>
            <div className="text-xs text-slate-600 mt-0.5">Explore {words.length} words</div>
          </button>

          <button
            onClick={() => onNavigate('weekly-top-spellers')}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-300 hover:border-amber-400 text-left transition-colors cursor-pointer group col-span-2 sm:col-span-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  🏆
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Weekly Top Spellers Competition</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900">
                      Rank #{weeklyData.currentUserRank}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    See where you stand among the top 10 secondary students based on frequency and accuracy this week
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </div>
          </button>

        </div>
      </div>

      {/* MODAL: JOIN CLASS WITH CODE */}
      {isJoinCodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Join a Teacher's Class</span>
              </div>
              <button onClick={() => { setIsJoinCodeOpen(false); setJoinMessage(null); }} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleJoinClassSubmit} className="space-y-3">
              <p className="text-slate-500">
                Enter the 6-character code given by your teacher to receive class assignments.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Class Join Code</label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. 7K4P9X"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase tracking-wider text-slate-900 text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {joinMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                  joinMessage.includes('Success') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {joinMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsJoinCodeOpen(false); setJoinMessage(null); }}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Join Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE PROGRESS MODAL */}
      <ShareProgressModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        streakData={streakData}
        studentName={currentUser?.name || student.name}
        studentClass={studentClassName}
        schoolName={currentUser?.schoolName || student.school}
        accuracy={enrolledStudent?.accuracy ?? student.accuracy}
        wordsMastered={enrolledStudent?.wordsMastered ?? student.wordsMastered}
        achievements={achievements}
        initialMode={shareModalMode}
      />

    </div>
  );
};
