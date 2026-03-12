import React, { useState, useEffect, useMemo } from 'react';
import { Capstone, Course, StudentGroup } from '../../types';
import { useLanguage } from '../LanguageContext';

interface CapstoneFormModalProps {
  isOpen: boolean;
  capstone: Capstone | null;
  courses: Course[];
  groups: StudentGroup[];
  onClose: () => void;
  onSave: (data: Omit<Capstone, 'id'>) => void;
}

const EMPTY_CAPSTONE: Omit<Capstone, 'id'> = {
  title: '',
  courseId: '',
  groupId: undefined,
  instructorId: '',
  instructions: '',
  rubric: '',
  dueDate: undefined,
  maxScore: 100,
  allowLateSubmission: false,
  latePenaltyPercent: 0,
  allowedFileTypes: ['pdf', 'docx', 'zip'],
  maxFileSizeMB: 50,
  resources: [],
  status: 'draft',
  publishedAt: undefined,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const CapstoneFormModal: React.FC<CapstoneFormModalProps> = ({ isOpen, capstone, courses, groups, onClose, onSave }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [form, setForm] = useState<Omit<Capstone, 'id'>>(EMPTY_CAPSTONE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileTypesStr, setFileTypesStr] = useState('pdf,docx,zip');

  useEffect(() => {
    if (capstone) {
      const { id, ...rest } = capstone;
      setForm(rest);
      setFileTypesStr(rest.allowedFileTypes.join(','));
    } else {
      setForm(EMPTY_CAPSTONE);
      setFileTypesStr('pdf,docx,zip');
    }
    setErrors({});
  }, [capstone, isOpen]);

  const filteredGroups = useMemo(() => {
    if (!form.courseId) return [];
    return groups.filter(g => g.courseId === form.courseId && g.isActive);
  }, [groups, form.courseId]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = d.form_title_required || 'Title is required';
    if (!form.courseId) errs.courseId = 'Course is required';
    if (!form.instructions.trim()) errs.instructions = d.instructions_required || 'Instructions are required';
    if (form.maxScore <= 0) errs.maxScore = 'Max score must be greater than 0';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      ...form,
      allowedFileTypes: fileTypesStr.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  const addResource = () => {
    setForm({ ...form, resources: [...form.resources, { type: 'link', name: '', url: '' }] });
  };

  const removeResource = (index: number) => {
    setForm({ ...form, resources: form.resources.filter((_, i) => i !== index) });
  };

  const updateResource = (index: number, field: 'type' | 'name' | 'url', value: string) => {
    const updated = [...form.resources];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, resources: updated });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-6">
          {capstone ? (d.edit_capstone || 'Edit Capstone') : (d.create_capstone || 'Create Capstone')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.capstone_title || 'Capstone Title'}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.title ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Course & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.col_course || 'Course'}</label>
              <select
                value={form.courseId}
                onChange={(e) => { setForm({ ...form, courseId: e.target.value, groupId: undefined }); setErrors(prev => ({ ...prev, courseId: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.courseId ? 'border-red-400' : 'border-slate-100'}`}
              >
                <option value="">{d.filter_all_courses || 'Select Course'}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.group || 'Group'} ({d.optional || 'Optional'})</label>
              <select
                value={form.groupId || ''}
                onChange={(e) => setForm({ ...form, groupId: e.target.value || undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">{d.none_option || 'None'}</option>
                {filteredGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name.en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.instructions || 'Instructions'}</label>
            <textarea
              value={form.instructions}
              onChange={(e) => { setForm({ ...form, instructions: e.target.value }); setErrors(prev => ({ ...prev, instructions: '' })); }}
              rows={4}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none ${errors.instructions ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.instructions && <p className="text-red-500 text-xs mt-1">{errors.instructions}</p>}
          </div>

          {/* Rubric */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.rubric || 'Rubric'} ({d.optional || 'Optional'})</label>
            <textarea
              value={form.rubric || ''}
              onChange={(e) => setForm({ ...form, rubric: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          {/* Due Date & Max Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.due_date || 'Due Date'} ({d.optional || 'Optional'})</label>
              <input
                type="datetime-local"
                value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.max_score || 'Max Score'}</label>
              <input
                type="number"
                min="1"
                value={form.maxScore}
                onChange={(e) => { setForm({ ...form, maxScore: Number(e.target.value) }); setErrors(prev => ({ ...prev, maxScore: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.maxScore ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.maxScore && <p className="text-red-500 text-xs mt-1">{errors.maxScore}</p>}
            </div>
          </div>

          {/* Late Submission Toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, allowLateSubmission: !form.allowLateSubmission })}
                className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${form.allowLateSubmission ? 'bg-[#0da993]' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.allowLateSubmission ? 'end-1' : 'start-1'}`} />
              </div>
              <span className="text-sm font-bold text-slate-700">{d.allow_late || 'Allow Late Submission'}</span>
            </label>
            {form.allowLateSubmission && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.late_penalty || 'Late Penalty %'}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.latePenaltyPercent}
                  onChange={(e) => setForm({ ...form, latePenaltyPercent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                />
              </div>
            )}
          </div>

          {/* File Types & Max Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.allowed_file_types || 'Allowed File Types'}</label>
              <input
                type="text"
                value={fileTypesStr}
                onChange={(e) => setFileTypesStr(e.target.value)}
                placeholder="pdf,docx,zip"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.max_file_size || 'Max File Size (MB)'}</label>
              <input
                type="number"
                min="1"
                value={form.maxFileSizeMB}
                onChange={(e) => setForm({ ...form, maxFileSizeMB: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.resources || 'Resources'}</label>
              <button
                type="button"
                onClick={addResource}
                className="text-xs font-bold text-[#0da993] hover:text-[#0da993]/80 transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {d.add_resource || 'Add Resource'}
              </button>
            </div>
            {form.resources.map((resource, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                <select
                  value={resource.type}
                  onChange={(e) => updateResource(idx, 'type', e.target.value as 'file' | 'link')}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="link">{d.link_type || 'Link'}</option>
                  <option value="file">{d.file_type || 'File'}</option>
                </select>
                <input
                  type="text"
                  placeholder={d.resource_name || 'Name'}
                  value={resource.name}
                  onChange={(e) => updateResource(idx, 'name', e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={resource.url}
                  onChange={(e) => updateResource(idx, 'url', e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeResource(idx)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0da993] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all mt-2"
          >
            {d.save || 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CapstoneFormModal;
