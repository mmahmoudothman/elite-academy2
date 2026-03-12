import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizQuestion, QuestionType } from '../../types';
import { useLanguage } from '../LanguageContext';
import * as fs from '../../services/firestoreService';

interface QuizQuestionEditorProps {
  quiz: Quiz;
  onBack: () => void;
  onUpdateQuiz: (id: string, data: Partial<Quiz>) => void;
}

const EMPTY_QUESTION: Omit<QuizQuestion, 'id'> = {
  questionType: 'mcq',
  questionText: '',
  options: [
    { id: '0', text: '', isCorrect: true },
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
  ],
  correctAnswer: '0',
  marks: 1,
  explanation: '',
  order: 0,
};

const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = ({ quiz, onBack, onUpdateQuiz }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = fs.subscribeQuizQuestions(quiz.id, (data) => {
      setQuestions(data.sort((a, b) => a.order - b.order));
    });
    return () => unsub();
  }, [quiz.id]);

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const syncQuizMeta = useCallback((qs: QuizQuestion[]) => {
    const total = qs.reduce((sum, q) => sum + q.marks, 0);
    onUpdateQuiz(quiz.id, { questionCount: qs.length, totalMarks: total });
  }, [quiz.id, onUpdateQuiz]);

  const handleAddQuestion = async () => {
    setSaving(true);
    const newOrder = questions.length;
    const data: Omit<QuizQuestion, 'id'> = {
      ...EMPTY_QUESTION,
      order: newOrder,
    };
    await fs.createQuizQuestion(quiz.id, data);
    // sync will happen via subscription, but update quiz meta
    syncQuizMeta([...questions, { ...data, id: 'temp' } as QuizQuestion]);
    setSaving(false);
  };

  const handleUpdateQuestion = async (questionId: string, data: Partial<QuizQuestion>) => {
    await fs.editQuizQuestion(quiz.id, questionId, data);
    const updated = questions.map(q => q.id === questionId ? { ...q, ...data } : q);
    syncQuizMeta(updated);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await fs.removeQuizQuestion(quiz.id, questionId);
    const remaining = questions.filter(q => q.id !== questionId);
    // Re-order remaining
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].order !== i) {
        await fs.editQuizQuestion(quiz.id, remaining[i].id, { order: i });
      }
    }
    syncQuizMeta(remaining);
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= questions.length) return;

    await fs.editQuizQuestion(quiz.id, questions[idx].id, { order: swapIdx });
    await fs.editQuizQuestion(quiz.id, questions[swapIdx].id, { order: idx });
  };

  const handleTypeChange = (questionId: string, newType: QuestionType) => {
    let defaults: Partial<QuizQuestion> = { questionType: newType };
    if (newType === 'mcq') {
      defaults.options = [
        { id: '0', text: '', isCorrect: true },
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
      ];
      defaults.correctAnswer = '0';
    } else if (newType === 'true_false') {
      defaults.options = [
        { id: 'true', text: 'True', isCorrect: true },
        { id: 'false', text: 'False', isCorrect: false },
      ];
      defaults.correctAnswer = 'true';
    } else {
      defaults.options = [];
      defaults.correctAnswer = '';
    }
    handleUpdateQuestion(questionId, defaults);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{quiz.title}</h2>
            <p className="text-sm text-slate-400 font-bold">
              {questions.length} {d.questions_count || 'questions'} &middot; {d.total_marks || 'Total Marks'}: {totalMarks}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddQuestion}
          disabled={saving}
          className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {d.add_question || 'Add Question'}
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_questions || 'No questions yet. Click "Add Question" to start.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, idx) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={idx}
              total={questions.length}
              onUpdate={(data) => handleUpdateQuestion(question.id, data)}
              onDelete={() => handleDeleteQuestion(question.id)}
              onMove={(dir) => handleMoveQuestion(question.id, dir)}
              onTypeChange={(type) => handleTypeChange(question.id, type)}
              d={d}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onUpdate: (data: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onTypeChange: (type: QuestionType) => void;
  d: any;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, total, onUpdate, onDelete, onMove, onTypeChange, d }) => {
  const [text, setText] = useState(question.questionText);
  const [options, setOptions] = useState<Array<{id: string; text: string; isCorrect: boolean}>>(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || '');
  const [marks, setMarks] = useState(question.marks);
  const [explanation, setExplanation] = useState(question.explanation || '');

  // Sync local state when question changes from subscription
  useEffect(() => {
    setText(question.questionText);
    setOptions(question.options || []);
    setCorrectAnswer(question.correctAnswer || '');
    setMarks(question.marks);
    setExplanation(question.explanation || '');
  }, [question]);

  const saveField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], text: value };
    setOptions(updated);
    saveField('options', updated);
  };

  const addOption = () => {
    const updated = [...options, { id: String(options.length), text: '', isCorrect: false }];
    setOptions(updated);
    saveField('options', updated);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    // Adjust correct answer if needed
    const correctIdx = parseInt(correctAnswer);
    if (idx === correctIdx) {
      const newOptions = updated.map((o, i) => ({ ...o, isCorrect: i === 0 }));
      setOptions(newOptions);
      setCorrectAnswer('0');
      saveField('correctAnswer', '0');
      saveField('options', newOptions);
    } else if (idx < correctIdx) {
      const newCorrect = String(correctIdx - 1);
      setCorrectAnswer(newCorrect);
      saveField('correctAnswer', newCorrect);
      saveField('options', updated);
    } else {
      saveField('options', updated);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-[#0da993]/10 text-[#0da993] rounded-lg flex items-center justify-center text-sm font-black">
            {index + 1}
          </span>
          <select
            value={question.questionType}
            onChange={(e) => onTypeChange(e.target.value as QuestionType)}
            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-[#0da993] outline-none"
          >
            <option value="mcq">{d.mcq || 'Multiple Choice'}</option>
            <option value="true_false">{d.true_false || 'True/False'}</option>
            <option value="short_answer">{d.short_answer || 'Short Answer'}</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-1 mb-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.question_text || 'Question Text'}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => saveField('questionText', text)}
          rows={2}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
        />
      </div>

      {/* MCQ Options */}
      {question.questionType === 'mcq' && (
        <div className="space-y-2 mb-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.options || 'Options'}</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={correctAnswer.split(',').includes(String(i))}
                onChange={() => {
                  const newCorrect = String(i);
                  setCorrectAnswer(newCorrect);
                  saveField('correctAnswer', newCorrect);
                  const updatedOpts = options.map((o, idx) => ({ ...o, isCorrect: idx === i }));
                  setOptions(updatedOpts);
                  saveField('options', updatedOpts);
                }}
                className="w-4 h-4 accent-[#0da993]"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`${d.option || 'Option'} ${i + 1}`}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:border-[#0da993] outline-none transition-all"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-xs font-bold text-[#0da993] hover:text-[#0da993]/80 transition-all"
          >
            + {d.add_option || 'Add Option'}
          </button>
        </div>
      )}

      {/* True/False */}
      {question.questionType === 'true_false' && (
        <div className="space-y-2 mb-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.correct_answer || 'Correct Answer'}</label>
          <div className="flex gap-4">
            {['true', 'false'].map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`tf_${question.id}`}
                  checked={correctAnswer === val}
                  onChange={() => { setCorrectAnswer(val); saveField('correctAnswer', val); }}
                  className="w-4 h-4 accent-[#0da993]"
                />
                <span className="text-sm font-bold text-slate-700 capitalize">{val === 'true' ? (d.true_label || 'True') : (d.false_label || 'False')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Short Answer */}
      {question.questionType === 'short_answer' && (
        <div className="space-y-1 mb-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.correct_answer || 'Correct Answer'}</label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            onBlur={() => saveField('correctAnswer', correctAnswer)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
          />
        </div>
      )}

      {/* Marks & Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.marks || 'Marks'}</label>
          <input
            type="number"
            min="0"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            onBlur={() => saveField('marks', marks)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.explanation || 'Explanation'}</label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            onBlur={() => saveField('explanation', explanation)}
            placeholder={d.optional || 'Optional'}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionEditor;
