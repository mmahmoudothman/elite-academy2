import React, { useState, useEffect, useRef } from 'react';
import { Recording, RecordingStorageType, RecordingVisibility, ProcessingStatus, Course, StudentGroup } from '../../types';
import { useLanguage } from '../LanguageContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { isFirebaseConfigured } from '../../services/firebase';
import ImageUploader from './ImageUploader';

interface RecordingFormModalProps {
  isOpen: boolean;
  recording: Recording | null;
  courses: Course[];
  groups: StudentGroup[];
  onClose: () => void;
  onSave: (data: Omit<Recording, 'id'>) => void;
}

const EMPTY_RECORDING: Omit<Recording, 'id'> = {
  title: '',
  description: '',
  courseId: '',
  groupId: '',
  instructorId: '',
  storageType: 'youtube_unlisted',
  url: '',
  thumbnailUrl: '',
  durationSeconds: undefined,
  visibility: 'enrolled_only',
  processingStatus: 'ready',
  order: 0,
  viewCount: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const RecordingFormModal: React.FC<RecordingFormModalProps> = ({ isOpen, recording, courses, groups, onClose, onSave }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [form, setForm] = useState<Omit<Recording, 'id'>>(EMPTY_RECORDING);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGroups = groups.filter(g => !form.courseId || g.courseId === form.courseId);

  useEffect(() => {
    if (recording) {
      const { id, ...rest } = recording;
      setForm(rest);
    } else {
      setForm(EMPTY_RECORDING);
    }
    setErrors({});
    setUploadProgress(null);
    setUploading(false);
  }, [recording, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = d.form_title_required || 'Title is required';
    if (!form.courseId) errs.courseId = 'Course is required';
    if (form.storageType !== 'firebase_storage' && !form.url.trim()) errs.url = 'URL is required';
    return errs;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isFirebaseConfigured) return;

    setUploading(true);
    setUploadProgress(0);
    setForm(prev => ({ ...prev, processingStatus: 'uploading' as ProcessingStatus }));

    try {
      const storage = getStorage();
      const path = `recordings/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          setUploading(false);
          setUploadProgress(null);
          setForm(prev => ({ ...prev, processingStatus: 'failed' as ProcessingStatus }));
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setForm(prev => ({
            ...prev,
            url: downloadUrl,
            processingStatus: 'ready' as ProcessingStatus,
          }));
          setUploading(false);
          setUploadProgress(null);

          // Attempt to auto-detect duration
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = downloadUrl;
          video.onloadedmetadata = () => {
            setForm(prev => ({ ...prev, durationSeconds: Math.floor(video.duration) }));
          };
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(null);
      setForm(prev => ({ ...prev, processingStatus: 'failed' as ProcessingStatus }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ ...form, updatedAt: Date.now(), createdAt: form.createdAt || Date.now() });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-6">
          {recording ? (d.edit_recording || 'Edit Recording') : (d.upload_recording || 'Upload Recording')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.recording_title || 'Title'}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.title ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.field_description || 'Description'}</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          {/* Course & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.label_course || 'Course'}</label>
              <select
                value={form.courseId}
                onChange={(e) => { setForm({ ...form, courseId: e.target.value, groupId: '' }); setErrors(prev => ({ ...prev, courseId: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.courseId ? 'border-red-400' : 'border-slate-100'}`}
              >
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.groups_tab || 'Group'}</label>
              <select
                value={form.groupId || ''}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">{d.none_option || 'None'}</option>
                {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name.en}</option>)}
              </select>
            </div>
          </div>

          {/* Storage Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.storage_type || 'Storage Type'}</label>
            <div className="flex gap-2">
              {[
                { key: 'firebase_storage' as RecordingStorageType, label: d.firebase_storage || 'Upload File' },
                { key: 'youtube_unlisted' as RecordingStorageType, label: d.youtube_url || 'YouTube URL' },
                { key: 'external_url' as RecordingStorageType, label: d.external_url || 'External URL' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setForm({ ...form, storageType: opt.key, url: '' })}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    form.storageType === opt.key
                      ? 'bg-[#0da993] text-white border-[#0da993]'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-[#0da993]/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL / File input */}
          {form.storageType === 'firebase_storage' ? (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.video_file || 'Video File'}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{d.upload_progress || 'Upload Progress'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0da993] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {form.url && (
                <p className="text-xs text-green-600 font-bold truncate">{form.url}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {form.storageType === 'youtube_unlisted' ? (d.youtube_url || 'YouTube URL') : (d.external_url || 'External URL')}
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => { setForm({ ...form, url: e.target.value }); setErrors(prev => ({ ...prev, url: '' })); }}
                placeholder={form.storageType === 'youtube_unlisted' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.url ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
            </div>
          )}

          {/* Thumbnail */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.thumbnail || 'Thumbnail'}</label>
            <ImageUploader
              value={form.thumbnailUrl || ''}
              onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
              storagePath="recording-thumbnails"
              aspectRatio={16 / 9}
              maxWidth={640}
              quality={0.8}
            />
          </div>

          {/* Duration, Visibility, Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.field_duration || 'Duration'}</label>
              <input
                type="number"
                min={0}
                value={form.durationSeconds || ''}
                onChange={(e) => setForm({ ...form, durationSeconds: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 2700"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.visibility || 'Visibility'}</label>
              <select
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as RecordingVisibility })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="enrolled_only">{d.enrolled_only || 'Enrolled Only'}</option>
                <option value="public">{d.public_visibility || 'Public'}</option>
                <option value="unlisted">{d.unlisted_visibility || 'Unlisted'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.label_order || 'Order'}</label>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#0da993] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all mt-2 disabled:opacity-50"
          >
            {uploading ? (d.uploading || 'Uploading...') : (d.save || 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordingFormModal;
