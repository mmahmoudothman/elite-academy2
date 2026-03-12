import React from 'react';
import { Course } from '../../types';
import { useLanguage } from '../LanguageContext';
import MediaDisplay from '../MediaDisplay';

interface CoursesTableProps {
  courses: Course[];
  onAdd?: () => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onToggleVisibility?: (course: Course) => void;
}

const CoursesTable: React.FC<CoursesTableProps> = ({ courses, onAdd, onEdit, onDelete, onToggleVisibility }) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{t.dashboard.courses_tab}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.dashboard.add_course}
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{t.dashboard.no_courses}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.field_image}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_title}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{t.dashboard.col_category}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.col_instructor}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_price}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{t.dashboard.col_level}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.col_enrolled}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard.col_rating}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t.dashboard.col_visibility}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard.col_actions}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 hidden md:table-cell">
                      <MediaDisplay
                        src={course.image}
                        alt={course.title}
                        className="w-16 h-10 rounded-lg object-cover"
                        fallbackIcon="image"
                        showPlayOverlay={false}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{course.title}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="px-3 py-1 bg-[#0da993]/10 text-[#0da993] rounded-lg text-xs font-bold">{course.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{course.instructor}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{course.price} {course.currency}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        course.level === 'Advanced' ? 'bg-red-50 text-red-600' :
                        course.level === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                        'bg-green-50 text-green-600'
                      }`}>{course.level}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{course.enrolled.toLocaleString()}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="font-bold text-slate-900">{course.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <button
                        onClick={() => onToggleVisibility?.(course)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          course.visible !== false
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={t.dashboard.toggle_visibility}
                      >
                        {course.visible !== false ? (
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
                          onClick={() => onEdit(course)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                          title={t.dashboard?.edit || "Edit"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        )}
                        {onDelete && (
                        <button
                          onClick={() => onDelete(course)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title={t.dashboard?.delete || "Delete"}
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

export default CoursesTable;
