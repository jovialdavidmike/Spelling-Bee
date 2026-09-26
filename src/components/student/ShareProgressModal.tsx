import React, { useState, useRef, useEffect } from 'react';
import { StudentStreakData, Achievement } from '../../types';
import {
  Flame,
  Award,
  Trophy,
  Share2,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Target,
  BookOpen,
  CheckCircle2,
  Zap,
  Smartphone,
  Eye,
  Camera
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  streakData: StudentStreakData;
  studentName: string;
  studentClass?: string;
  schoolName?: string;
  accuracy: number;
  wordsMastered: number;
  achievements: Achievement[];
  initialMode?: 'all' | 'streak' | 'achievement';
}

export const ShareProgressModal: React.FC<Props> = ({
  isOpen,
  onClose,
  streakData,
  studentName,
  studentClass = 'SS 1 Gold',
  schoolName = 'SpellReady Academy',
  accuracy,
  wordsMastered,
  achievements,
  initialMode = 'all'
}) => {
  const [shareMode, setShareMode] = useState<'all' | 'streak' | 'achievement'>(initialMode);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unlocked achievements sorted by date (latest first)
  const unlockedAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''));

  const latestAchievement = unlockedAchievements[0] || achievements[0];

  useEffect(() => {
    if (unlockedAchievements.length > 0 && !selectedAchievementId) {
      setSelectedAchievementId(unlockedAchievements[0].id);
    }
  }, [unlockedAchievements, selectedAchievementId]);

  if (!isOpen) return null;

  const currentFeaturedAchievement =
    unlockedAchievements.find(a => a.id === selectedAchievementId) || latestAchievement;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://spellready.app';

  // Construct message based on mode
  const generateShareText = () => {
    const streakDays = streakData.currentStreak;
    const milestoneBadge = streakData.nextMilestone?.badge || 'Ember';

    if (shareMode === 'streak') {
      return `🔥 I've maintained an unbroken ${streakDays}-Day spelling streak on SpellReady! Practicing daily with ${accuracy}% accuracy and ${wordsMastered} mastered words to prepare for the National Spelling Bee. 🐝🏆\n\nChallenge yourself on SpellReady: ${appUrl} #SpellReady #SpellingBee #Streak #DailyPractice`;
    }

    if (shareMode === 'achievement' && currentFeaturedAchievement) {
      return `🏆 Milestone Unlocked! I just earned the "${currentFeaturedAchievement.title}" badge on SpellReady! (${currentFeaturedAchievement.description}) 🔥 Current Streak: ${streakDays} days | ${accuracy}% accuracy. 🐝✨\n\nTrain spelling with me: ${appUrl} #SpellReady #AchievementUnlocked #SpellingBee`;
    }

    // Default 'all'
    const topBadges = unlockedAchievements.slice(0, 2).map(a => `"${a.title}"`).join(' & ');
    return `🐝 SpellReady Progress Update!\n🔥 Current Practice Streak: ${streakDays} Days Unbroken\n🏆 Latest Achievements: ${topBadges || 'Active Learner'}\n🎯 Overall Accuracy: ${accuracy}%\n📚 Words Mastered: ${wordsMastered}\n\nJoin the spelling competition training: ${appUrl} #SpellReady #SpellingBee #StudentProgress #Consistency`;
  };

  const shareText = generateShareText();

  // Social sharing handlers
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SpellReady: ${studentName}'s Spelling Progress`,
          text: shareText,
          url: appUrl
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyText();
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // High-Resolution Graphic Canvas Renderer for Download / Image Share
  const drawSocialCardToCanvas = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve('');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      const width = 1200;
      const height = 630;
      canvas.width = width;
      canvas.height = height;

      // 1. Background gradient (rich deep navy to dark slate with gold warmth)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f172a'); // slate-900
      bgGrad.addColorStop(0.5, '#1e293b'); // slate-800
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Amber glow in top right & bottom left
      const glowGrad = ctx.createRadialGradient(width - 150, 100, 10, width - 150, 100, 450);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)'); // amber-500
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      const glowGrad2 = ctx.createRadialGradient(150, height - 100, 10, 150, height - 100, 450);
      glowGrad2.addColorStop(0, 'rgba(234, 88, 12, 0.18)'); // orange-600
      glowGrad2.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Decorative Border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'; // amber-400
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(38, 38, width - 76, height - 76);

      // 4. Header: Logo & Branding
      ctx.fillStyle = '#fbbf24'; // amber-400
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🐝 SPELLREADY', 70, 95);

      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('NATIONAL SPELLING BEE PRACTICE PLATFORM', 270, 95);

      // Top right badge
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.beginPath();
      ctx.roundRect(width - 290, 68, 220, 36, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('★ VERIFIED STUDENT PROGRESS', width - 275, 91);

      // 5. Student Identification Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(studentName, 70, 175);

      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.font = '20px sans-serif';
      ctx.fillText(`${studentClass}  ·  ${schoolName}`, 70, 212);

      // 6. Left Column: Big Streak Box
      const boxY = 250;
      const boxW = 480;
      const boxH = 260;

      // Streak Container
      const streakGrad = ctx.createLinearGradient(70, boxY, 70 + boxW, boxY + boxH);
      streakGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      streakGrad.addColorStop(1, 'rgba(234, 88, 12, 0.25)');
      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.roundRect(70, boxY, boxW, boxH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Flame & streak label
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🔥 DAILY PRACTICE STREAK', 105, boxY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 76px sans-serif';
      ctx.fillText(`${streakData.currentStreak}`, 105, boxY + 130);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('DAYS UNBROKEN', 215, boxY + 115);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Personal Longest: ${streakData.longestStreak} Days  ·  Tier: ${streakData.flameLevel.toUpperCase()}`, 105, boxY + 175);

      // Milestone status tag
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`✓ Active Daily Commitment  ·  ${streakData.nextMilestone?.badge || 'Bronze Ember'}`, 105, boxY + 220);

      // 7. Right Column: Latest Achievements Box
      const rightX = 580;
      const rightW = 550;
      const rightH = 260;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rightX, boxY, rightW, rightH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8'; // sky-400
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🏆 LATEST UNLOCKED ACHIEVEMENTS', rightX + 30, boxY + 45);

      // List top 3 unlocked achievements
      const displayAch = unlockedAchievements.slice(0, 3);
      displayAch.forEach((ach, idx) => {
        const itemY = boxY + 90 + idx * 52;

        // Badge circle icon
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.beginPath();
        ctx.arc(rightX + 45, itemY - 6, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '14px sans-serif';
        ctx.fillText('★', rightX + 40, itemY - 1);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(ach.title, rightX + 75, itemY - 1);

        // Date / category tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px sans-serif';
        const dateStr = ach.unlockedAt ? `Unlocked ${ach.unlockedAt}` : 'Unlocked';
        ctx.fillText(dateStr, rightX + 390, itemY - 1);
      });

      if (displayAch.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText('Working towards first milestone badges!', rightX + 45, boxY + 120);
      }

      // 8. Bottom Stats Strip (Accuracy, Mastered Words, XP)
      const footY = 555;
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('CUMULATIVE STATS:', 70, footY);

      ctx.fillStyle = '#34d399'; // emerald-400
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Accuracy: ${accuracy}%`, 250, footY);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Words Mastered: ${wordsMastered}`, 420, footY);

      ctx.fillStyle = '#a78bfa'; // violet-400
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Status: Competition Ready 🎯`, 650, footY);

      // Bottom right watermark URL
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('spellready.app', width - 170, footY);

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    });
  };

  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    try {
      const dataUrl = await drawSocialCardToCanvas();
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `spellready-streak-${studentName.toLowerCase().replace(/\s+/g, '-')}-${streakData.currentStreak}days.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyImage = async () => {
    setIsGeneratingImage(true);
    try {
      const canvas = canvasRef.current;
      await drawSocialCardToCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Check if ClipboardItem supports png write
          if (navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
          } else {
            handleDownloadImage();
          }
        } catch {
          handleDownloadImage();
        }
      }, 'image/png');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center shadow-xs shrink-0 font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Share Progress & Streak</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Showcase</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Celebrate your practice streak and milestones with friends and teachers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 font-bold text-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setShareMode('all')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                shareMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Summary</span>
            </button>

            <button
              onClick={() => setShareMode('streak')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                shareMode === 'streak'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Streak Highlight</span>
            </button>

            <button
              onClick={() => setShareMode('achievement')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                shareMode === 'achievement'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Achievement Badge</span>
            </button>
          </div>

          {/* If Achievement Mode: Selector to pick which achievement to highlight */}
          {shareMode === 'achievement' && unlockedAchievements.length > 0 && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 text-xs">
                Select Achievement to Feature:
              </label>
              <select
                value={selectedAchievementId}
                onChange={(e) => setSelectedAchievementId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {unlockedAchievements.map(a => (
                  <option key={a.id} value={a.id}>
                    🏆 {a.title} ({a.unlockedAt ? `Unlocked ${a.unlockedAt}` : 'Unlocked'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* LIVE SOCIAL PREVIEW CARD */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Visual Share Card Preview</span>
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                Optimized for Social Feeds
              </span>
            </div>

            {/* The Visual Card */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-5 sm:p-6 text-white border border-slate-800 shadow-lg space-y-4"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Top Brand Row */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                    🐝
                  </div>
                  <div>
                    <span className="font-extrabold tracking-wider text-xs text-amber-400 uppercase">
                      SPELLREADY
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                      Spelling Bee Prep
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {streakData.nextMilestone?.badge.split(' ')[0] || '🔥'} {streakData.flameLevel.toUpperCase()} LEVEL
                </span>
              </div>

              {/* Student Identity */}
              <div className="relative z-10 pt-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {studentName}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {studentClass} · {schoolName}
                </p>
              </div>

              {/* Card Main Highlight depending on mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                
                {/* Streak Metric Block */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/25 border border-amber-500/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                      Daily Streak
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">Unbroken</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono flex items-baseline gap-1.5">
                    <span>{streakData.currentStreak}</span>
                    <span className="text-sm font-semibold text-amber-200">Days</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Best: {streakData.longestStreak} days · {streakData.nextMilestone?.title}
                  </div>
                </div>

                {/* Achievements Block */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-sky-400" />
                      Latest Achievements
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {unlockedAchievements.length} Unlocked
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {unlockedAchievements.slice(0, 2).map(ach => (
                      <div key={ach.id} className="flex items-center gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] flex items-center justify-center shrink-0">
                          ★
                        </span>
                        <span className="font-semibold text-slate-100 truncate">
                          {ach.title}
                        </span>
                      </div>
                    ))}
                    {unlockedAchievements.length === 0 && (
                      <div className="text-[11px] text-slate-400">
                        Practice today to unlock your first trophy badge!
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Quick Stats */}
              <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-3">
                  <span>Accuracy: <strong className="text-emerald-400 font-mono">{accuracy}%</strong></span>
                  <span>·</span>
                  <span>Mastered: <strong className="text-amber-300 font-mono">{wordsMastered}</strong> words</span>
                </div>
                <div className="font-mono text-slate-500 text-[10px]">
                  #SpellReady
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA ONE-CLICK SHARE BUTTONS */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 text-xs block">
              Share Directly to Social Platforms:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={handleShareTwitter}
                className="p-2.5 rounded-xl border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current text-blue-600" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current text-indigo-700" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </button>

            </div>

            {/* Native Mobile Share Sheet (if supported) */}
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-1"
            >
              <Smartphone className="w-4 h-4" />
              <span>Share via Device Apps (Instagram, Messages, Telegram, etc.)</span>
            </button>
          </div>

          {/* DOWNLOAD GRAPHIC OR COPY IMAGE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-800 text-xs">Graphic Social Share Badge (PNG)</h4>
              </div>
              <span className="text-[10px] text-slate-400">1200 × 630 HD</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>{isGeneratingImage ? 'Rendering...' : 'Download Image Card'}</span>
              </button>

              <button
                onClick={handleCopyImage}
                disabled={isGeneratingImage}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Image Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Card to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COPY TEXT MESSAGE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 text-xs">
                Custom Social Post Text:
              </label>
              <button
                onClick={handleCopyText}
                className="text-amber-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={3}
              value={shareText}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-sans text-slate-700 focus:outline-none select-all"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encourages classmates to build their daily practice streaks</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Hidden canvas element for rendering high-res social image */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
