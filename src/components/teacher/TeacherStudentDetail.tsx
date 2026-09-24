import React, { useState } from 'react';
import { AppView, EnrolledStudent, Word } from '../../types';
import { dataService } from '../../services/dataService';
import {
  ArrowLeft,
  User,
  Award,
  BookOpen,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  MessageSquare,
  Save,
  Check
} from 'lucide-react';

interface Props {
  studentId: string;
  onNavigate: (view: AppView) => void;
  onLaunchTargetedAssign?: (wordIds: string[], studentName: string) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherStudentDetail: React.FC<Props> = ({
  studentId,
  onNavigate,
  onLaunchTargetedAssign,
  onShowToast
}) => {
  const student = dataService.getEnrolledStudentById(studentId) || dataService.getTeacherStudents()[0];
  const [notes, setNotes] = useState(student.notes || '');
  const [teacherComment, setTeacherComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);

  const studentWeakWords: Word[] = (student.weakWords || ['w1', 'w6', 'w12', 'w20'])
    .map(id => dataService.getWordById(id))
    .filter(Boolean) as Word[];

  const studentSubmissions = dataService.getAssignments().map(asg => {
    const subs = dataService.getAssignmentSubmissions(asg.id).filter(s => s.studentId === student.id);
    return {
      assignment: asg,
      submission: subs[0]
    };
  });

  const handleSaveNotes = () => {
    dataService.updateEnrolledStudent(student.id, { notes });
    onShowToast('Teacher diagnostic notes saved.');
  };

  const handleCreateTargetedPractice = () => {
    const wordIds = studentWeakWords.map(w => w.id);
    if (wordIds.length === 0) {
      onShowToast('No recorded mistakes found for this student.');
      return;
    }

    if (onLaunchTargetedAssign) {
      onLaunchTargetedAssign(wordIds, student.name);
    } else {
      dataService.createTargetedAssignmentFromWeakWords(student.classId, wordIds, `Remedial Drill: ${student.name}'s Weak Words`);
      onShowToast(`Targeted assignment created with ${wordIds.length} weak words for ${student.name}!`);
      onNavigate('teacher-dashboard');
    }
  };

  const handleSendFeedbackComment = (asgId: string) => {
    if (!teacherComment.trim()) return;
    const subs = dataService.getAssignmentSubmissions(asgId).find(s => s.studentId === student.id);
    if (subs) {
      dataService.addTeacherComment(subs.id, teacherComment.trim());
      setCommentSaved(true);
      onShowToast('Teacher feedback comment sent to student dashboard.');
      setTimeout(() => setCommentSaved(false), 3000);
    } else {
      // Create a submission stub to hold the comment
      dataService.addNotification({
        targetRole: 'student',
        targetUserId: student.id,
        title: 'Feedback from Teacher David Mike',
        message: teacherComment.trim(),
        type: 'comment',
        linkView: 'student-dashboard'
      });
      onShowToast('Direct comment sent to student.');
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-xs">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('teacher-students')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Students</span>
      </button>

      {/* Student Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-800 font-bold text-xl flex items-center justify-center shrink-0">
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Candidate Profile</span>
            <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">{student.className}</span>
              <span>·</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">Code: {student.studentCode}</span>
              <span>·</span>
              <span className="font-mono text-slate-500">PIN: {student.pin}</span>
            </div>
            {student.parentContact && (
              <div className="text-[11px] text-slate-400 pt-0.5">Parent Contact: {student.parentContact}</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCreateTargetedPractice}
            className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Create Targeted Practice</span>
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500">Overall Accuracy</div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">{student.accuracy}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Status: {student.status}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500">Words Practiced</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{student.wordsPracticed}</div>
          <div className="text-[11px] text-emerald-600 mt-1">{student.wordsMastered} Mastered</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500">Practice Streak</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{student.streakDays} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Daily consistency</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500">Weak Words Flagged</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{studentWeakWords.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Need remedial focus</div>
        </div>
      </div>

      {/* MISTAKE HISTORY & FREQUENTLY MISSED WORDS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">Student Mistake History & Weak Words</h2>
          </div>

          <button
            onClick={handleCreateTargetedPractice}
            className="px-3 py-1.5 font-semibold text-xs text-slate-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-700" />
            <span>Create Assignment from These Words</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {studentWeakWords.map(w => (
            <div key={w.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{w.word}</span>
                <span className="font-mono text-[11px] text-slate-500">{w.pronunciation}</span>
              </div>
              <div className="text-[11px] text-slate-600 leading-tight line-clamp-1">{w.definition}</div>
              <div className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-mono">
                Common typo: {w.commonMisspellings?.[0] || 'misspelled'}
              </div>
            </div>
          ))}

          {studentWeakWords.length === 0 && (
            <div className="col-span-2 py-8 text-center text-slate-500">
              No outstanding spelling mistakes recorded for this student.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENTS PERFORMANCE & TEACHER FEEDBACK */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Assigned Homework & Test Records</h2>
        
        <div className="space-y-3">
          {studentSubmissions.map(({ assignment, submission }) => (
            <div key={assignment.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{assignment.title}</h3>
                  <div className="text-slate-500 text-[11px]">Due: {assignment.dueDate} · Mode: {assignment.mode || 'practice'}</div>
                </div>

                <div className="text-right">
                  {submission ? (
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-700">{submission.accuracy}%</span>
                      <span className="text-[11px] text-slate-400 block">Completed</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Incomplete / In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Existing comment or Leave comment */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Leave encouraging feedback or focus areas for this student..."
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleSendFeedbackComment(assignment.id)}
                  className="px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {commentSaved ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{commentSaved ? 'Sent!' : 'Send Comment'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEACHER DIAGNOSTIC NOTES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Educator Diagnostic Notes</h2>
        <p className="text-xs text-slate-500">
          Private annotations regarding phonetic habits, vowel combination patterns, or stage confidence.
        </p>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter instructional notes, phonics observations, or parent call log..."
          className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Save Diagnostic Note
          </button>
        </div>
      </div>

    </div>
  );
};

