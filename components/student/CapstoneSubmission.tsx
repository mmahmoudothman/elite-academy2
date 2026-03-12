import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Capstone, CapstoneSubmission as CapstoneSubmissionType } from '../../types';
import { createCapstoneSubmission, editCapstoneSubmission } from '../../services/firestoreService';
import { uploadImage } from '../../services/firebase';

interface CapstoneSubmissionProps {
  capstone: Capstone;
  existingSubmission?: CapstoneSubmissionType;
  onBack: () => void;
  onSubmitted: () => void;
}

const CapstoneSubmissionComponent: React.FC<CapstoneSubmissionProps> = ({
  capstone,
  existingSubmission,
  onBack,
  onSubmitted,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const s = t.student;

  const [textResponse, setTextResponse] = useState(existingSubmission?.textResponse || '');
  const [links, setLinks] = useState<string[]>(existingSubmission?.links || ['']);
  const [files, setFiles] = useState<CapstoneSubmissionType['files']>(existingSubmission?.files || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isGraded = existingSubmission?.status === 'graded';
  const isReadOnly = isGraded;

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError('');
    try {
      const path = `capstone-files/${user.id}/${capstone.id}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setFiles([...files, {
        name: file.name,
        url,
        storagePath: path,
        sizeBytes: file.size,
        mimeType: file.type,
      }]);
    } catch {
      setError(language === 'ar' ? 'فشل رفع الملف. يرجى المحاولة مرة أخرى.' : 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!textResponse.trim()) {
      setError(s.capstone_response + ' is required');
      return;
    }

    if (!window.confirm(s.capstone_submit_confirm)) return;

    setSubmitting(true);
    setError('');

    const filteredLinks = links.filter(l => l.trim() !== '');

    try {
      if (existingSubmission && existingSubmission.status !== 'graded') {
        await editCapstoneSubmission(existingSubmission.id, {
          textResponse,
          links: filteredLinks,
          files,
          status: 'submitted',
          submittedAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        const now = Date.now();
        const isLate = capstone.dueDate ? now > capstone.dueDate : false;
        await createCapstoneSubmission({
          capstoneId: capstone.id,
          courseId: capstone.courseId,
          userId: user.id,
          textResponse,
          links: filteredLinks,
          files,
          status: isLate ? 'late' : 'submitted',
          submittedAt: now,
          maxScore: capstone.maxScore,
          isLate,
          resubmissionCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
      onSubmitted();
    } catch {
      setError(language === 'ar' ? 'فشل التقديم. يرجى المحاولة مرة أخرى.' : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    assigned: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    graded: 'bg-green-100 text-green-700',
    late: 'bg-red-100 text-red-700',
    resubmit_requested: 'bg-purple-100 text-purple-700',
  };

  const statusLabel: Record<string, string> = {
    assigned: s.capstone_draft,
    submitted: s.capstone_submitted,
    under_review: s.under_review,
    graded: s.capstone_graded,
    late: s.late,
    resubmit_requested: s.capstone_returned,
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-[#0da993] transition-colors"
      >
        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {s.back}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{capstone.title}</h2>
            </div>
            {existingSubmission && (
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${statusColor[existingSubmission.status]}`}>
                {statusLabel[existingSubmission.status]}
              </span>
            )}
          </div>

          {capstone.dueDate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {s.capstone_due_date}: {new Date(capstone.dueDate).toLocaleDateString()}
            </div>
          )}

          {capstone.maxScore > 0 && existingSubmission?.score !== undefined && (
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#0da993]">
              {s.capstone_score}: {existingSubmission.score} / {capstone.maxScore}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 mb-2">{s.capstone_instructions}</h3>
          <div className="text-slate-700 whitespace-pre-wrap text-sm">{capstone.instructions}</div>
        </div>

        {/* Rubric */}
        {capstone.rubric && (
          <div className="p-6 border-b border-slate-100 bg-amber-50/50">
            <h3 className="font-bold text-slate-900 mb-2">{s.capstone_rubric}</h3>
            <div className="text-slate-700 whitespace-pre-wrap text-sm">{capstone.rubric}</div>
          </div>
        )}

        {/* Feedback (if graded/returned) */}
        {existingSubmission?.feedback && (
          <div className="p-6 border-b border-slate-100 bg-blue-50">
            <h3 className="font-bold text-slate-900 mb-2">{s.capstone_feedback}</h3>
            <div className="text-slate-700 whitespace-pre-wrap text-sm">{existingSubmission.feedback}</div>
          </div>
        )}

        {/* Response */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">{s.capstone_response}</label>
            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              disabled={isReadOnly}
              rows={10}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#0da993] focus:ring-1 focus:ring-[#0da993] outline-none resize-y disabled:bg-slate-50 disabled:text-slate-500"
              placeholder={s.short_answer_placeholder}
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">{s.capstone_links}</label>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    disabled={isReadOnly}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-[#0da993] focus:ring-1 focus:ring-[#0da993] outline-none disabled:bg-slate-50"
                  />
                  {!isReadOnly && links.length > 1 && (
                    <button
                      onClick={() => handleRemoveLink(idx)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <button
                  onClick={handleAddLink}
                  className="text-sm text-[#0da993] hover:text-[#0da993]/80 font-medium"
                >
                  + {s.capstone_add_link}
                </button>
              )}
            </div>
          </div>

          {/* Files */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">{s.capstone_files}</label>
            {files.length > 0 && (
              <div className="space-y-2 mb-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-[#3d66f1] hover:underline truncate">
                      {file.name || `File ${idx + 1}`}
                    </a>
                    {!isReadOnly && (
                      <button onClick={() => handleRemoveFile(idx)} className="text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!isReadOnly && (
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-[#0da993] hover:text-[#0da993] cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? s.loading : s.capstone_upload_file}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || !textResponse.trim()}
                className="px-8 py-3 bg-[#0da993] text-white rounded-xl font-bold hover:bg-[#0da993]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? s.loading : s.submit_capstone}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapstoneSubmissionComponent;
