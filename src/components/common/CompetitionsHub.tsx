import React, { useState } from 'react';
import { AppView, UserRole, Competition, CompetitionMode, CompetitionStatus } from '../../types';
import { competitionService } from '../../services/competitionService';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataService';
import { voiceService } from '../../services/voiceService';
import {
  Trophy,
  Play,
  Plus,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Volume2,
  Copy,
  BarChart3,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Radio,
  Download
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSelectCompetition?: (competitionId: string) => void;
  currentRole: UserRole;
}

export const CompetitionsHub: React.FC<Props> = ({
  onNavigate,
  onShowToast,
  onSelectCompetition,
  currentRole
}) => {
  const isTeacher = currentRole === 'teacher';
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'scheduled' | 'completed' | 'simulations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isGeneratingSim, setIsGeneratingSim] = useState(false);

  const competitions = competitionService.getCompetitions();

  const filteredCompetitions = competitions.filter(c => {
    // Tab filter
    if (activeTab === 'live' && c.status !== 'live' && c.status !== 'ready') return false;
    if (activeTab === 'scheduled' && c.status !== 'scheduled') return false;
    if (activeTab === 'completed' && c.status !== 'completed') return false;
    if (activeTab === 'simulations' && !c.isSimulation) return false;

    // Mode filter
    if (modeFilter !== 'all' && c.mode !== modeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchClass = c.className.toLowerCase().includes(q);
      const matchCode = c.accessCode.toLowerCase().includes(q);
      if (!matchTitle && !matchClass && !matchCode) return false;
    }

    return true;
  });

  const handleLaunchSoloSimulation = () => {
    setIsGeneratingSim(true);
    try {
      const studentId = currentUser?.id || 'std_01';
      const sim = competitionService.createSoloSimulation(10, 30, studentId);
      voiceService.speakCompetitionOpening(sim.title);
      if (onSelectCompetition) {
        onSelectCompetition(sim.id);
      }
      onNavigate('competition-session');
    } catch (e: any) {
      onShowToast(e?.message || 'Failed to start simulation', 'error');
    } finally {
      setIsGeneratingSim(false);
    }
  };

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      onShowToast('Please enter an access code.', 'error');
      return;
    }

    const comp = competitionService.getCompetitionByCode(code);
    if (!comp) {
      onShowToast(`No competition found matching code "${code}".`, 'error');
      return;
    }

    setShowJoinModal(false);
    setJoinCodeInput('');
    if (onSelectCompetition) {
      onSelectCompetition(comp.id);
    }
    onShowToast(`Joined "${comp.title}"! Entering competition room...`, 'success');
    onNavigate('competition-session');
  };

  const handleEnterCompetition = (comp: Competition) => {
    if (onSelectCompetition) {
      onSelectCompetition(comp.id);
    }
    if (isTeacher) {
      if (comp.status === 'completed') {
        onNavigate('teacher-competition-results');
      } else {
        onNavigate('teacher-competition-live');
      }
    } else {
      if (comp.status === 'completed') {
        onNavigate('competition-results');
      } else {
        onNavigate('competition-session');
      }
    }
  };

  const handleDuplicate = (comp: Competition) => {
    const cloned = competitionService.duplicateCompetition(comp.id);
    if (cloned) {
      onShowToast(`Duplicated as "${cloned.title}"! Ready to edit or schedule.`, 'success');
    }
  };

  const getModeLabel = (mode: CompetitionMode) => {
    switch (mode) {
      case 'practice_simulation': return 'Solo Simulation';
      case 'timed_test': return 'Timed Speed Test';
      case 'class_competition': return 'Classroom Heat';
      case 'multi_round': return 'Multi-Round Tournament';
      case 'elimination': return 'Sudden-Death Elimination';
      default: return 'Spelling Heat';
    }
  };

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <Radio className="w-3 h-3 text-rose-600" />
            LIVE HEAT
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Ready to Start
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Trophy className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Draft
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Competition Engine • Nigerian & British Curriculum
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Spelling Bee Competition Arena
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Experience authentic spelling bee competition heats with natural Gemini Studio voice audio, authoritative timers, strict phonetic assessment, and elimination brackets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isTeacher ? (
              <>
                <button
                  onClick={handleLaunchSoloSimulation}
                  disabled={isGeneratingSim}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  {isGeneratingSim ? 'Launching...' : 'Solo Practice Simulation'}
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
                >
                  <Play className="w-4 h-4 text-indigo-300" />
                  Join by Code
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('teacher-competition-builder')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Create Competition
                </button>
                <button
                  onClick={handleLaunchSoloSimulation}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
                >
                  <Play className="w-4 h-4 text-amber-400" />
                  Test Simulation
                </button>
              </>
            )}
          </div>
        </div>

        {/* Gemini Voice Indicator */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Gemini Voice Active:</span>
            <span>gemini-3.8-flash-lite-tts (Studio Voice: Kore)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>•</span>
            <span>Authoritative Timestamp Timers</span>
            <span>•</span>
            <span>Zero-Distraction Focus Mode</span>
            <span>•</span>
            <span>Instant Remedial Practice Loops</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            All ({competitions.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${activeTab === 'live' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Live & Ready
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'scheduled' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'completed' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Past Results
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'simulations' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Solo Simulations
          </button>
        </div>

        {/* Search & Mode Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, class, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
            <option value="all">All Modes</option>
            <option value="multi_round">Multi-Round</option>
            <option value="timed_test">Timed Test</option>
            <option value="elimination">Elimination</option>
            <option value="class_competition">Class Heat</option>
            <option value="practice_simulation">Simulation</option>
          </select>
        </div>
      </div>

      {/* Competitions Grid */}
      {filteredCompetitions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No competitions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'Try clearing your search query or filters.' : 'There are currently no competitions matching this category.'}
          </p>
          {!isTeacher ? (
            <button
              onClick={handleLaunchSoloSimulation}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Launch Solo Simulation
            </button>
          ) : (
            <button
              onClick={() => onNavigate('teacher-competition-builder')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Competition
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompetitions.map((comp) => {
            const isLive = comp.status === 'live' || comp.status === 'ready';
            const isCompleted = comp.status === 'completed';
            const totalWords = comp.rounds.reduce((acc, r) => acc + r.wordIds.length, 0);

            return (
              <div
                key={comp.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(comp.status)}
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {comp.accessCode}
                    </span>
                  </div>

                  {/* Title & Mode */}
                  <div>
                    <div className="text-xs font-semibold text-indigo-600">
                      {getModeLabel(comp.mode)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mt-0.5">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {comp.description}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.participants?.length || comp.participantIds?.length || 0} Spellers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.rounds[0]?.settings.timePerWord || 30}s / word</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.rounds.length} {comp.rounds.length === 1 ? 'Round' : 'Rounds'} ({totalWords} wds)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">Gemini ({comp.settings.voiceModerator.voiceName || 'Kore'})</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    {comp.className}
                  </div>

                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <button
                        onClick={() => handleDuplicate(comp)}
                        title="Duplicate this competition"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEnterCompetition(comp)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isLive
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-slate-800 hover:bg-slate-900 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>{isTeacher ? 'Host Moderator' : 'Enter Heat'}</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <BarChart3 className="w-3 h-3" />
                          <span>View Results</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>{isTeacher ? 'Manage Heat' : 'Enter'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join By Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Join Spelling Competition</h2>
              <p className="text-xs text-slate-500">
                Enter the competition access code provided by your teacher (e.g. <span className="font-mono font-bold text-slate-700">SPB-7K4P</span>).
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Access Code
                </label>
                <input
                  type="text"
                  placeholder="SPB-XXXX"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full text-center text-lg tracking-widest font-mono font-bold uppercase py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Demo Access Codes ready to test: <strong className="font-mono">SPB-7K4P</strong> (Championship), <strong className="font-mono">SPB-2M9Y</strong> (Speed Test).
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Enter Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
