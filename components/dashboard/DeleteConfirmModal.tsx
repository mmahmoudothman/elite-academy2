import React from 'react';
import { useLanguage } from '../LanguageContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warningMessage?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, warningMessage }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900">{t.dashboard.delete_confirm_title}</h3>
          <p className="text-sm text-slate-500 font-medium">{t.dashboard.delete_confirm_msg}</p>
          {warningMessage && (
            <p className="text-sm text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">{warningMessage}</p>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            {t.dashboard.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
          >
            {t.dashboard.delete}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
