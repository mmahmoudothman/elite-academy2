import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz, QuizQuestion, QuizSubmission } from '../../types';
import { createQuizSubmission, subscribeQuizQuestions } from '../../services/firestoreService';

interface QuizTakerProps {
  quiz: Quiz;
  existingSubmissions: QuizSubmission[];
  onBack: () => void;
  onSubmitted: () => void;
}

type Phase = 'intro' | 'taking' | 'results';

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, existingSubmissions, onBack, onSubmitted }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const s = t.student;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const unsub = subscribeQuizQuestions(quiz.id, (qs) => setQuestions(qs.sort((a, b) => a.order - b.order)));
    return () => unsub();
  }, [quiz.id]);

  const userSubmissions = existingSubmissions.filter(sub => sub.userId === user?.id);
  const bestSubmission = userSubmissions.length > 0
    ? userSubmissions.reduce((best, sub) => sub.percentage > best.percentage ? sub : best)
    : null;
  const attemptsUsed = userSubmissions.length;
  const canRetake = attemptsUsed < quiz.maxAttempts;

  const [phase, setPhase] = useState<Phase>(
    userSubmissions.length > 0 && !canRetake ? 'results' : 'intro'
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(bestSubmission);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gradeAndSubmitRef = useRef<() => Promise<void>>();

  gradeAndSubmitRef.current = async () => {
    if (!user || submitting) return;
    setSubmitting(true);

    let scoredMarks = 0;
    const submissionAnswers: QuizSubmission['answers'] = [];

    for (const q of questions) {
      const userAnswer = (answers[q.id] || '').trim().toLowerCase();
      let isCorrect = false;

      if (q.questionType === 'mcq') {
        const correctOption = q.options.find(o => o.isCorrect);
        isCorrect = userAnswer === correctOption?.id;
      } else if (q.questionType === 'true_false') {
        isCorrect = userAnswer === (q.correctAnswer || '').trim().toLowerCase();
      } else if (q.questionType === 'short_answer') {
        isCorrect = userAnswer === (q.correctAnswer || '').trim().toLowerCase();
      }

      if (isCorrect) scoredMarks += q.marks;

      submissionAnswers.push({
        questionId: q.id,
        selectedOptionId: q.questionType === 'mcq' ? answers[q.id] : undefined,
        textAnswer: q.questionType !== 'mcq' ? answers[q.id] : undefined,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0,
      });
    }

    const percentage = quiz.totalMarks > 0 ? Math.round((scoredMarks / quiz.totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const submission: Omit<QuizSubmission, 'id'> = {
      quizId: quiz.id,
      courseId: quiz.courseId,
      userId: user.id,
      answers: submissionAnswers,
      startedAt: startTimeRef.current,
      submittedAt: Date.now(),
      totalMarks: quiz.totalMarks,
      scoredMarks,
      percentage,
      passed,
      attemptNumber: attemptsUsed + 1,
      status: 'submitted',
    };

    try {
      setSubmitError('');
      const id = await createQuizSubmission(submission);
      const result = { ...submission, id } as QuizSubmission;
      setSubmissionResult(result);
      setPhase('results');
      onSubmitted();
    } catch {
      setSubmitError(language === 'ar' ? 'فشل تقديم الاختبار. يرجى المحاولة مرة أخرى.' : 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const gradeAndSubmit = useCallback(() => {
    return gradeAndSubmitRef.current?.() ?? Promise.resolve();
  }, []);

  useEffect(() => {
    if (phase !== 'taking' || timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          gradeAndSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft === null]);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    startTimeRef.current = Date.now();
    if (quiz.timeLimitMinutes) setTimeLeft(quiz.timeLimitMinutes * 60);

    if (quiz.shuffleQuestions) {
      setQuestions(prev => shuffleArray(prev));
    }
    if (quiz.shuffleOptions) {
      setQuestions(prev => prev.map(q => ({
        ...q,
        options: q.options ? shuffleArray(q.options) : q.options,
      })));
    }

    setPhase('taking');
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (window.confirm(s.quiz_confirm_submit)) {
      if (timerRef.current) clearInterval(timerRef.current);
      gradeAndSubmit();
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (phase === 'intro') {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-[#0da993] transition-colors">
          <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {s.back}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
          {quiz.description && <p className="text-slate-600 mb-6">{quiz.description}</p>}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">{s.quiz_question}s</div>
              <div className="text-lg font-bold text-slate-900">{questions.length}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">{s.quiz_time_limit}</div>
              <div className="text-lg font-bold text-slate-900">
                {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} ${s.quiz_minutes}` : s.quiz_no_limit}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">{s.quiz_attempts}</div>
              <div className="text-lg font-bold text-slate-900">{attemptsUsed} / {quiz.maxAttempts}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-500">{s.passing_score}</div>
              <div className="text-lg font-bold text-slate-900">{quiz.passingScore}%</div>
            </div>
          </div>

          {bestSubmission && (
            <div className={`rounded-xl p-4 mb-6 ${bestSubmission.passed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="text-sm font-medium mb-1">
                {bestSubmission.passed ? s.quiz_passed : s.quiz_failed} - {s.quiz_score}: {bestSubmission.percentage}%
              </div>
            </div>
          )}

          {canRetake ? (
            <button
              onClick={startQuiz}
              className="w-full py-3 bg-[#0da993] text-white rounded-xl font-bold hover:bg-[#0da993]/90 transition-colors"
            >
              {attemptsUsed > 0 ? s.quiz_try_again : s.start_quiz}
            </button>
          ) : (
            <div className="text-center text-slate-500 py-3">{s.quiz_max_attempts_reached}</div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'taking') {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <div className="space-y-4">
        {/* Timer and progress header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">{quiz.title}</h3>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
                timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : timeLeft < 300 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Question navigation pills */}
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  idx === currentQuestion
                    ? 'bg-[#0da993] text-white'
                    : answers[q.id]
                    ? 'bg-[#0da993]/20 text-[#0da993]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="text-sm text-slate-500 mb-2">
            {s.quiz_question} {currentQuestion + 1} {s.quiz_of} {questions.length}
            <span className="ms-2 text-xs bg-slate-100 px-2 py-0.5 rounded">
              {question.marks} pts
            </span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-6">{question.questionText}</h4>

          {question.questionType === 'mcq' && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    answers[question.id] === option.id
                      ? 'border-[#0da993] bg-[#0da993]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => handleAnswer(question.id, option.id)}
                    className="w-4 h-4 text-[#0da993] focus:ring-[#0da993]"
                  />
                  <span className="text-slate-700">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {question.questionType === 'true_false' && (
            <div className="flex gap-4">
              {['true', 'false'].map(val => (
                <button
                  key={val}
                  onClick={() => handleAnswer(question.id, val)}
                  className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-colors ${
                    answers[question.id] === val
                      ? 'border-[#0da993] bg-[#0da993]/5 text-[#0da993]'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {val === 'true' ? s.true_label : s.false_label}
                </button>
              ))}
            </div>
          )}

          {question.questionType === 'short_answer' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={s.short_answer_placeholder}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#0da993] focus:ring-1 focus:ring-[#0da993] outline-none resize-none"
              rows={4}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {s.quiz_prev}
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#0da993] text-white rounded-xl font-bold hover:bg-[#0da993]/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? s.loading : s.submit_quiz}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="px-6 py-2.5 bg-[#3d66f1] text-white rounded-xl font-medium hover:bg-[#3d66f1]/90 transition-colors"
            >
              {s.quiz_next}
            </button>
          )}
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{submitError}</div>
        )}
      </div>
    );
  }

  // Results phase
  const result = submissionResult;
  if (!result) return null;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-[#0da993] transition-colors">
        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {s.quiz_back_to_quizzes}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{s.quiz_results}</h2>
        <h3 className="text-lg text-slate-600 mb-6">{quiz.title}</h3>

        <div className={`text-center p-8 rounded-2xl mb-6 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-6xl font-black mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.percentage}%
          </div>
          <div className={`text-lg font-bold ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.passed ? s.quiz_passed : s.quiz_failed}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {result.scoredMarks} / {result.totalMarks} pts
          </div>
        </div>

        {quiz.showResultsToStudent && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">{s.question_breakdown}</h4>
            {questions.map((q, idx) => {
              const ansObj = result.answers.find(a => a.questionId === q.id);
              const isCorrect = ansObj?.isCorrect || false;

              let displayUserAnswer = ansObj?.selectedOptionId || ansObj?.textAnswer || '-';
              let displayCorrectAnswer = q.correctAnswer || '';

              if (q.questionType === 'mcq' && q.options) {
                const selectedOpt = q.options.find(o => o.id === ansObj?.selectedOptionId);
                displayUserAnswer = selectedOpt?.text || displayUserAnswer;
                const correctOpt = q.options.find(o => o.isCorrect);
                displayCorrectAnswer = correctOpt?.text || displayCorrectAnswer;
              } else if (q.questionType === 'true_false') {
                displayUserAnswer = (ansObj?.textAnswer || '') === 'true' ? s.true_label : (ansObj?.textAnswer || '') === 'false' ? s.false_label : '-';
                displayCorrectAnswer = q.correctAnswer === 'true' ? s.true_label : s.false_label;
              }

              return (
                <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-900">
                      {idx + 1}. {q.questionText}
                    </span>
                    {isCorrect ? (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-slate-500">{s.quiz_your_answer}: </span>
                      <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {displayUserAnswer || '-'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div>
                        <span className="text-slate-500">{s.quiz_correct_answer}: </span>
                        <span className="text-green-700 font-medium">{displayCorrectAnswer}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-2 text-slate-600 bg-white/60 p-2 rounded-lg text-xs">
                        <span className="font-medium">{s.quiz_explanation}:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            {s.quiz_back_to_quizzes}
          </button>
          {canRetake && (
            <button
              onClick={startQuiz}
              className="flex-1 py-3 bg-[#0da993] text-white rounded-xl font-bold hover:bg-[#0da993]/90 transition-colors"
            >
              {s.quiz_try_again}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
