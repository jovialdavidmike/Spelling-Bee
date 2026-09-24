import React, { useState } from 'react';
import { AppView, EnrolledStudent } from '../../types';
import { dataService } from '../../services/dataService';
import {
  Search,
  Users,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Download,
  KeyRound,
  Trash2,
  X,
  Upload,
  Check,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onSelectStudent: (id: string) => void;
  selectedClassFilter?: string;
}

export const TeacherStudents: React.FC<Props> = ({
  onNavigate,
  onSelectStudent,
  selectedClassFilter = 'all'
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState(selectedClassFilter);
  const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'words' | 'status'>('accuracy');
  const [sortDesc, setSortDesc] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single student form
  const [name, setName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [pin, setPin] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [notes, setNotes] = useState('');

  // Bulk student form
  const [bulkText, setBulkText] = useState(
    'Oluwaseun Bakare,CCA-SS1-007,1122\nFatima Bello,CCA-SS1-008,3344\nEmmanuel Dike,CCA-SS1-009,5566'
  );
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkValidation, setBulkValidation] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
    added: EnrolledStudent[];
  } | null>(null);

  const classes = dataService.getClasses();
  const students = dataService.getTeacherStudents();

  // Filter & Sort
  const filtered = students
    .filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        s.className.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === 'all' || s.className.toLowerCase().includes(classFilter.toLowerCase());
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'accuracy') comparison = a.accuracy - b.accuracy;
      else if (sortBy === 'words') comparison = a.wordsPracticed - b.wordsPracticed;
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      return sortDesc ? -comparison : comparison;
    });

  const handleExportCSV = () => {
    const csvData = dataService.exportClassResultsCSV(classFilter);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spellready_students_${classFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const classIdToUse = selectedClassId || (classes[0]?.id ?? 'class_ss1_gold');
    dataService.addStudent({
      name: name.trim(),
      classId: classIdToUse,
      studentCode: studentCode.trim() || undefined,
      pin: pin.trim() || undefined,
      parentContact: parentContact.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setName('');
    setStudentCode('');
    setPin('');
    setParentContact('');
    setNotes('');
  };

  const handleValidateAndBulkImport = (dryRun: boolean) => {
    const classIdToUse = bulkClassId || (classes[0]?.id ?? 'class_ss1_gold');
    if (dryRun) {
      // preview calculation
      const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const errors: string[] = [];
      let valid = 0;
      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes('name')) return;
        const parts = line.split(',');
        if (!parts[0] || parts[0].trim().length < 2) {
          errors.push(`Line ${idx + 1}: Name missing or too short`);
        } else {
          valid += 1;
        }
      });
      setBulkValidation({
        successCount: valid,
        errorCount: errors.length,
        errors,
        added: []
      });
    } else {
      const res = dataService.bulkAddStudents(bulkText, classIdToUse);
      setBulkValidation(res);
      if (res.errorCount === 0) {
        setTimeout(() => {
          setIsBulkModalOpen(false);
          setBulkValidation(null);
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Enrolled Students ({filtered.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student credentials, monitor spelling velocity, track mastery, and identify remedial candidates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or code (e.g. CCA-SS1-001)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Classes ({students.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="accuracy">Accuracy</option>
              <option value="words">Words Practiced</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() => setSortDesc(!sortDesc)}
              title="Toggle sort direction"
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

      </div>

      {/* Student List Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4">Student & Code</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-right">Words Practiced</th>
                <th className="py-3 px-4 text-right">Mastered</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors text-xs">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{student.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{student.studentCode} · PIN: {student.pin}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {student.className}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                    {student.wordsPracticed}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                    {student.wordsMastered}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={student.accuracy >= 85 ? 'text-emerald-700' : student.accuracy >= 75 ? 'text-slate-800' : 'text-amber-600'}>
                      {student.accuracy}%
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                      student.status === 'Strong'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : student.status === 'On Track'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : student.status === 'Needs Practice'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                    }`}>
                      {student.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {student.lastActive}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectStudent(student.id);
                        onNavigate('teacher-student-detail');
                      }}
                      className="px-2.5 py-1 font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Analytics & Mistakes →
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    No students match your current search or class filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map((student) => (
            <div key={student.id} className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{student.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{student.studentCode}</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-sm block ${student.accuracy >= 85 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {student.accuracy}%
                  </span>
                  <span className="text-[10px] text-slate-400">{student.wordsMastered} mastered</span>
                </div>
              </div>

              <div className="text-slate-500 flex items-center justify-between text-[11px]">
                <span>{student.className} · {student.wordsPracticed} words</span>
                <span className="font-semibold text-slate-700">{student.status}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onSelectStudent(student.id);
                    onNavigate('teacher-student-detail');
                  }}
                  className="px-3 py-1 font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
                >
                  View Profile & Assign →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL 1: ADD SINGLE STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add New Student Speller</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSingleStudent} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ebuka Adeleke"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assign to Class *</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Code (Optional)</label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Parent / Guardian Contact (Optional)</label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Teacher Notes / Observations</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Good memory; practice French origins"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK STUDENT IMPORT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Bulk Register Spellers</h2>
              </div>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkValidation(null); }} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <p className="text-slate-500">
              Paste names or CSV data below in the format: <br />
              <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Name,StudentCode,PIN</code> (one student per line).
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Target Class</label>
              <select
                value={bulkClassId}
                onChange={(e) => setBulkClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Student Records (CSV Format)</label>
              <textarea
                rows={5}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            {bulkValidation && (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                bulkValidation.errorCount === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {bulkValidation.errorCount === 0 ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                  <span>Ready to import {bulkValidation.successCount} valid spellers</span>
                </div>
                {bulkValidation.errorCount > 0 && (
                  <ul className="list-disc pl-5 text-[11px] text-amber-700">
                    {bulkValidation.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleValidateAndBulkImport(true)}
                className="px-3.5 py-2 font-medium text-indigo-700 hover:bg-indigo-50 rounded-xl border border-indigo-200 cursor-pointer"
              >
                Validate & Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsBulkModalOpen(false); setBulkValidation(null); }}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateAndBulkImport(false)}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Import Spellers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

