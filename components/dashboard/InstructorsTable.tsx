import React from 'react';
import { Instructor } from '../../types';
import { useLanguage } from '../LanguageContext';
import MediaDisplay from '../MediaDisplay';

interface InstructorsTableProps {
  instructors: Instructor[];
  onAdd?: () => void;
  onEdit?: (instructor: Instructor) => void;
  onDelete?: (instructor: Instructor) => void;
  onToggleVisibility?: (instructor: Instructor) => void;
}

const InstructorsTable: React.FC<InstructorsTableProps> = ({ instructors, onAdd, onEdit, onDelete, onToggleVisibility }) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{t.dashboard.instructors_tab}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.dashboard.add_instructor}
          </button>
        )}
      </div>

      {instructors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{t.dashboard.no_instructors}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.col_avatar}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_name}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_role}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{t.dashboard.col_specialization}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.col_experience}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t.dashboard.col_video}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t.dashboard.col_visibility}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_actions}</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 hidden md:table-cell">
                      <MediaDisplay
                        src={instructor.image}
                        alt={instructor.name}
                        className="w-10 h-10 rounded-full object-cover"
                        fallbackIcon="user"
                        showPlayOverlay={false}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{instructor.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{instructor.role}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{instructor.specialization}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs hidden md:table-cell">{instructor.experience}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {instructor.videoUrl ? (
                        <MediaDisplay
                          src={instructor.videoUrl}
                          alt={`${instructor.name} video`}
                          className="w-16 h-10 rounded-lg object-cover"
                          fallbackIcon="video"
                          thumbnail
                        />
                      ) : (
                        <span className="text-xs text-slate-300 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <button
                        onClick={() => onToggleVisibility?.(instructor)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          instructor.visible !== false
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={t.dashboard.toggle_visibility}
                      >
                        {instructor.visible !== false ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {t.dashboard.visible}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            {t.dashboard.hidden}
                          </span>
                        )}
                      </button>
                    </td>
                    {(onEdit || onDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                        <button
                          onClick={() => onEdit(instructor)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        )}
                        {onDelete && (
                        <button
                          onClick={() => onDelete(instructor)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsTable;
