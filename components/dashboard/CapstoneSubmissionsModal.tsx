import React, { useState, useMemo } from 'react';
import { Capstone, CapstoneSubmission, CapstoneSubmissionStatus, Student } from '../../types';
import { useLanguage } from '../LanguageContext';

interface CapstoneSubmissionsModalProps {
  isOpen: boolean;
  capstone: Capstone | null;
  submissions: CapstoneSubmission[];
  students?: Student[];
  onClose: () => void;
  onGrade: (submissionId: string, data: { score: number; feedback: string; status: CapstoneSubmissionStatus }) => void;
}

const CapstoneSubmissionsModal: React.FC<CapstoneSubmissionsModalProps> = ({
  isOpen, capstone, submissions, students = [], onClose, onGrade,
}) => {
  const { t } = useLanguage();
  const d = t.dashboard;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeStatus, setGradeStatus] = useState<'graded' | 'resubmit_requested'>('graded');

  const filteredSubmissions = useMemo(() => {
    if (!capstone) return [];
    return submissions.filter(s => s.capstoneId === capstone.id);
  }, [submissions, capstone]);

  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const graded = filteredSubmissions.filter(s => s.status === 'graded').length;
    const late = filteredSubmissions.filter(s => s.isLate).length;
    const gradedSubs = filteredSubmissions.filter(s => s.status === 'graded' && s.score != null);
    const avgScore = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubs.length)
      : 0;
    return { total, graded, late, avgScore };
  }, [filteredSubmissions]);

  if (!isOpen || !capstone) return null;

  const getStatusBadge = (status: CapstoneSubmissionStatus) => {
    const styles: Record<CapstoneSubmissionStatus, string> = {
      assigned: 'bg-slate-100 text-slate-500',
      submitted: 'bg-blue-50 text-blue-600',
      under_review: 'bg-amber-50 text-amber-600',
      graded: 'bg-emerald-50 text-emerald-600',
      late: 'bg-red-50 text-red-600',
      resubmit_requested: 'bg-purple-50 text-purple-600',
    };
    const labels: Record<CapstoneSubmissionStatus, string> = {
      assigned: d.assigned || 'Assigned',
      submitted: d.submitted || 'Submitted',
      under_review: d.under_review || 'Under Review',
      graded: d.graded || 'Graded',
      late: d.late || 'Late',
      resubmit_requested: d.resubmit_requested || 'Resubmit Requested',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const startGrading = (sub: CapstoneSubmission) => {
    setGradingId(sub.id);
    setGradeScore(sub.score || 0);
    setGradeFeedback(sub.feedback || '');
    setGradeStatus('graded');
    setExpandedId(sub.id);
  };

  const saveGrade = () => {
    if (!gradingId) return;
    onGrade(gradingId, { score: gradeScore, feedback: gradeFeedback, status: gradeStatus });
    setGradingId(null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-5 sm:p-8 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-2">{capstone.title}</h3>
        <p className="text-sm text-slate-400 font-medium mb-6">{d.view_submissions || 'Submissions'}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.total_submissions || 'Total'}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{stats.graded}</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{d.graded || 'Graded'}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{stats.avgScore}/{capstone.maxScore}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{d.avg_score || 'Avg Score'}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-red-600">{stats.late}</p>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{d.late || 'Late'}</p>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-12 text-center">
            <p className="text-slate-400 font-medium">{d.no_submissions || 'No submissions yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map(sub => (
              <div key={sub.id} className="border border-slate-100 rounded-xl overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{students.find(st => st.userId === sub.userId || st.id === sub.userId)?.name || sub.userId}</p>
                    <p className="text-xs text-slate-400">{students.find(st => st.userId === sub.userId || st.id === sub.userId)?.email || ''}</p>
                  </div>
                  <div className="hidden sm:block">{getStatusBadge(sub.status)}</div>
                  <div className="text-xs text-slate-500 font-medium hidden md:block">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}
                  </div>
                  <div className="text-sm font-bold text-slate-700 hidden sm:block">
                    {sub.score != null ? `${sub.score}/${capstone.maxScore}` : '-'}
                  </div>
                  {sub.isLate && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold hidden md:block">
                      {d.late || 'LATE'}
                    </span>
                  )}
                  <div className="text-xs text-slate-400 font-medium hidden lg:block">
                    {sub.resubmissionCount > 0 ? `${sub.resubmissionCount}x` : '-'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startGrading(sub); }}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                      title={d.save_grade || 'Grade'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === sub.id && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-4">
                    {/* Mobile status */}
                    <div className="sm:hidden">{getStatusBadge(sub.status)}</div>

                    {/* Text Response */}
                    {sub.textResponse && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.text_response || 'Text Response'}</p>
                        <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                          {sub.textResponse}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {sub.links && sub.links.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.links || 'Links'}</p>
                        <div className="space-y-1">
                          {sub.links.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-[#3d66f1] hover:underline truncate"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {sub.files && sub.files.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.files || 'Files'}</p>
                        <div className="space-y-1">
                          {sub.files.map((file, i) => (
                            <a
                              key={i}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-[#3d66f1] hover:underline"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {file.name}
                              {file.sizeBytes && <span className="text-slate-400 text-xs">({(file.sizeBytes / 1024 / 1024).toFixed(1)} MB)</span>}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grading Panel */}
                    {gradingId === sub.id && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-black text-slate-900">{d.grade_submission || 'Grade Submission'}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.score_label || 'Score'} (0-{capstone.maxScore})</label>
                            <input
                              type="number"
                              min="0"
                              max={capstone.maxScore}
                              value={gradeScore}
                              onChange={(e) => setGradeScore(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.submission_status || 'Status'}</label>
                            <select
                              value={gradeStatus}
                              onChange={(e) => setGradeStatus(e.target.value as 'graded' | 'resubmit_requested')}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                            >
                              <option value="graded">{d.graded || 'Graded'}</option>
                              <option value="resubmit_requested">{d.resubmit_requested || 'Resubmit Requested'}</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.feedback || 'Feedback'}</label>
                          <textarea
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setGradingId(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                          >
                            {d.cancel || 'Cancel'}
                          </button>
                          <button
                            onClick={saveGrade}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#0da993] rounded-xl hover:bg-[#0da993]/90 transition-all"
                          >
                            {d.save_grade || 'Save Grade'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Existing grade display (when not in grading mode) */}
                    {gradingId !== sub.id && sub.feedback && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.feedback || 'Feedback'}</p>
                        <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                          {sub.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CapstoneSubmissionsModal;
