import React from 'react';
import { Instructor } from '../../types';
import { useLanguage } from '../LanguageContext';
import MediaDisplay from '../MediaDisplay';

interface InstructorsTableProps {
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (instructor: Instructor) => void;
  onDelete: (instructor: Instructor) => void;
}

const InstructorsTable: React.FC<InstructorsTableProps> = ({ instructors, onAdd, onEdit, onDelete }) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{t.dashboard.instructors_tab}</h2>
        <button
          onClick={onAdd}
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.dashboard.add_instructor}
        </button>
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
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_avatar}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_name}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_role}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_specialization}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_experience}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_video}</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_actions}</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{instructor.specialization}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">{instructor.experience}</td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(instructor)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(instructor)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
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
