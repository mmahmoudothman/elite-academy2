import React, { useState, useEffect } from 'react';
import { Quiz, QuizSubmission, QuizQuestion, Student } from '../../types';
import { useLanguage } from '../LanguageContext';
import * as fs from '../../services/firestoreService';

interface QuizSubmissionsModalProps {
  isOpen: boolean;
  quiz: Quiz | null;
  students?: Student[];
  onClose: () => void;
}

const QuizSubmissionsModal: React.FC<QuizSubmissionsModalProps> = ({ isOpen, quiz, students = [], onClose }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [gradingMarks, setGradingMarks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!quiz) return;
    const unsub1 = fs.subscribeQuizSubmissionsByQuiz(quiz.id, setSubmissions);
    const unsub2 = fs.subscribeQuizQuestions(quiz.id, (qs) => setQuestions(qs.sort((a, b) => a.order - b.order)));
    return () => { unsub1(); unsub2(); };
  }, [quiz?.id]);

  if (!isOpen || !quiz) return null;

  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded' || s.status === 'submitted');
  const avgScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.percentage, 0) / gradedSubmissions.length)
    : 0;
  const passRate = gradedSubmissions.length > 0
    ? Math.round((gradedSubmissions.filter(s => s.percentage >= quiz.passingScore).length / gradedSubmissions.length) * 100)
    : 0;

  const getStatusBadge = (status: QuizSubmission['status']) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      in_progress: { bg: 'bg-amber-50', text: 'text-amber-600', label: d.in_progress || 'In Progress' },
      submitted: { bg: 'bg-blue-50', text: 'text-blue-600', label: d.submitted_status || 'Submitted' },
      graded: { bg: 'bg-green-50', text: 'text-green-600', label: d.graded_status || 'Graded' },
    };
    const s = map[status] || map.submitted;
    return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getStudentName = (userId: string) => {
    const student = students.find(st => st.userId === userId || st.id === userId);
    return student?.name || userId;
  };
  const getStudentEmail = (userId: string) => {
    const student = students.find(st => st.userId === userId || st.id === userId);
    return student?.email || '';
  };

  const handleGrade = async (submissionId: string, questionId: string, marks: number) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Update the specific answer's marksAwarded
    const updatedAnswers = submission.answers.map(a =>
      a.questionId === questionId
        ? { ...a, marksAwarded: Math.min(marks, question.marks), isCorrect: marks > 0 }
        : a
    );

    // Recalculate total score
    let totalScore = 0;
    for (const q of questions) {
      const ans = updatedAnswers.find(a => a.questionId === q.id);
      if (q.questionType === 'short_answer' && ans?.marksAwarded != null) {
        totalScore += ans.marksAwarded;
      } else if (q.questionType !== 'short_answer') {
        if (ans?.isCorrect) {
          totalScore += q.marks;
        }
      }
    }

    const allShortAnswerGraded = questions
      .filter(q => q.questionType === 'short_answer')
      .every(q => updatedAnswers.find(a => a.questionId === q.id)?.marksAwarded != null);

    const percentage = quiz!.totalMarks > 0 ? Math.round((totalScore / quiz!.totalMarks) * 100) : 0;

    await fs.editQuizSubmission(submissionId, {
      answers: updatedAnswers,
      scoredMarks: totalScore,
      percentage,
      status: allShortAnswerGraded ? 'graded' : 'submitted',
      gradedAt: allShortAnswerGraded ? Date.now() : undefined,
    });
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

        <h3 className="text-xl font-black text-slate-900 mb-2">
          {d.submissions || 'Submissions'}: {quiz.title}
        </h3>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{totalSubmissions}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{d.total_submissions || 'Total'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-[#0da993]">{avgScore}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{d.avg_score || 'Avg Score'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-[#3d66f1]">{passRate}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{d.pass_rate || 'Pass Rate'}</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center">
            <p className="text-slate-400 font-medium">{d.no_submissions || 'No submissions yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-7 gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-2">{d.col_student || 'Student'}</div>
              <div>{d.attempt || 'Attempt'}</div>
              <div>{d.score || 'Score'}</div>
              <div>{d.percentage || '%'}</div>
              <div>{d.col_status || 'Status'}</div>
              <div>{d.col_date || 'Submitted'}</div>
            </div>

            {submissions
              .sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt))
              .map((sub) => (
              <div key={sub.id}>
                <div
                  className="grid grid-cols-2 sm:grid-cols-7 gap-2 px-4 py-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all items-center"
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                >
                  <div className="col-span-2 sm:col-span-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{getStudentName(sub.userId)}</p>
                    <p className="text-xs text-slate-400 truncate">{getStudentEmail(sub.userId)}</p>
                  </div>
                  <div className="text-sm font-bold text-slate-600">#{sub.attemptNumber}</div>
                  <div className="text-sm font-bold text-slate-900">{sub.scoredMarks}/{sub.totalMarks}</div>
                  <div className={`text-sm font-bold ${sub.percentage >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                    {sub.percentage}%
                  </div>
                  <div>{getStatusBadge(sub.status)}</div>
                  <div className="text-xs text-slate-400 font-medium">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}
                  </div>
                </div>

                {/* Expanded: Per-question breakdown */}
                {expandedId === sub.id && (
                  <div className="mt-2 ms-4 space-y-2 pb-2">
                    {questions.map((q, qi) => {
                      const ansObj = sub.answers.find(a => a.questionId === q.id);
                      const answerText = ansObj?.selectedOptionId || ansObj?.textAnswer || '';
                      const isCorrect = ansObj?.isCorrect || false;
                      const gradedMark = ansObj?.marksAwarded;
                      const displayAnswer = q.questionType === 'mcq' && q.options
                        ? q.options.find(o => o.id === answerText)?.text || answerText
                        : answerText;
                      const correctDisplay = q.questionType === 'mcq' && q.options
                        ? q.options.find(o => o.isCorrect)?.text || q.correctAnswer
                        : q.correctAnswer;

                      return (
                        <div key={q.id} className="bg-white border border-slate-100 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-500 mb-1">Q{qi + 1}: {q.questionText}</p>
                              <p className="text-sm font-bold text-slate-800">
                                {d.answer || 'Answer'}: {displayAnswer || '-'}
                              </p>
                              {q.questionType !== 'short_answer' && (
                                <p className={`text-xs font-bold mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                  {isCorrect
                                    ? (d.correct || 'Correct')
                                    : `${d.incorrect || 'Incorrect'} (${d.correct_answer || 'Correct'}: ${correctDisplay})`}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              {q.questionType === 'short_answer' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max={q.marks}
                                    value={gradingMarks[`${sub.id}_${q.id}`] ?? gradedMark ?? ''}
                                    onChange={(e) => setGradingMarks(prev => ({
                                      ...prev,
                                      [`${sub.id}_${q.id}`]: Number(e.target.value),
                                    }))}
                                    className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center focus:border-[#0da993] outline-none"
                                    placeholder="0"
                                  />
                                  <span className="text-xs text-slate-400 font-bold">/{q.marks}</span>
                                  <button
                                    onClick={() => {
                                      const m = gradingMarks[`${sub.id}_${q.id}`] ?? gradedMark ?? 0;
                                      handleGrade(sub.id, q.id, m);
                                    }}
                                    className="px-2 py-1 bg-[#0da993] text-white rounded-lg text-[10px] font-bold hover:bg-[#0da993]/90 transition-all"
                                  >
                                    {d.grade || 'Grade'}
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                  {isCorrect ? q.marks : 0}/{q.marks}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

export default QuizSubmissionsModal;
