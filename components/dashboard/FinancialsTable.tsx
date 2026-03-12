import React, { useState, useMemo } from 'react';
import { Course, Enrollment, CourseFinancials } from '../../types';
import { useLanguage } from '../LanguageContext';

interface FinancialsTableProps {
  courses: Course[];
  enrollments: Enrollment[];
  financials: CourseFinancials[];
  onSaveFinancial?: (courseId: string, data: Partial<CourseFinancials>) => void;
}

interface EditForm {
  instructorPayout: number;
  venueRent: number;
  materialsCost: number;
  marketingCost: number;
  otherCosts: number;
}

const FinancialsTable: React.FC<FinancialsTableProps> = ({ courses, enrollments, financials, onSaveFinancial }) => {
  const { t } = useLanguage();
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    instructorPayout: 0,
    venueRent: 0,
    materialsCost: 0,
    marketingCost: 0,
    otherCosts: 0,
  });

  // Calculate revenue per course from paid enrollments
  const revenueMap = useMemo(() => {
    const map: Record<string, number> = {};
    enrollments.forEach((enrollment) => {
      if (enrollment.paymentStatus === 'paid') {
        map[enrollment.courseId] = (map[enrollment.courseId] || 0) + enrollment.paymentAmount;
      }
    });
    return map;
  }, [enrollments]);

  // Map financials by courseId
  const financialsMap = useMemo(() => {
    const map: Record<string, CourseFinancials> = {};
    financials.forEach((f) => {
      map[f.courseId] = f;
    });
    return map;
  }, [financials]);

  // Build row data
  const rows = useMemo(() => {
    return courses.map((course) => {
      const revenue = revenueMap[course.id] || 0;
      const fin = financialsMap[course.id];
      const instructorPayout = fin?.instructorPayout || 0;
      const venueRent = fin?.venueRent || 0;
      const materialsCost = fin?.materialsCost || 0;
      const marketingCost = fin?.marketingCost || 0;
      const otherCosts = fin?.otherCosts || 0;
      const totalCost = instructorPayout + venueRent + materialsCost + marketingCost + otherCosts;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        courseId: course.id,
        title: course.title,
        revenue,
        instructorPayout,
        venueRent,
        materialsCost,
        marketingCost,
        otherCosts,
        totalCost,
        profit,
        margin,
      };
    });
  }, [courses, revenueMap, financialsMap]);

  // Summary totals
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        revenue: acc.revenue + row.revenue,
        instructorPayout: acc.instructorPayout + row.instructorPayout,
        venueRent: acc.venueRent + row.venueRent,
        materialsCost: acc.materialsCost + row.materialsCost,
        marketingCost: acc.marketingCost + row.marketingCost,
        otherCosts: acc.otherCosts + row.otherCosts,
        totalCost: acc.totalCost + row.totalCost,
        profit: acc.profit + row.profit,
      }),
      { revenue: 0, instructorPayout: 0, venueRent: 0, materialsCost: 0, marketingCost: 0, otherCosts: 0, totalCost: 0, profit: 0 }
    );
  }, [rows]);

  const totalMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  const handleRowClick = (courseId: string) => {
    if (!onSaveFinancial) return;
    if (editingCourseId === courseId) {
      setEditingCourseId(null);
      return;
    }
    const fin = financialsMap[courseId];
    setEditForm({
      instructorPayout: fin?.instructorPayout || 0,
      venueRent: fin?.venueRent || 0,
      materialsCost: fin?.materialsCost || 0,
      marketingCost: fin?.marketingCost || 0,
      otherCosts: fin?.otherCosts || 0,
    });
    setEditingCourseId(courseId);
  };

  const handleSave = (courseId: string) => {
    if (!onSaveFinancial) return;
    onSaveFinancial(courseId, {
      instructorPayout: editForm.instructorPayout,
      venueRent: editForm.venueRent,
      materialsCost: editForm.materialsCost,
      marketingCost: editForm.marketingCost,
      otherCosts: editForm.otherCosts,
      updatedAt: Date.now(),
    });
    setEditingCourseId(null);
  };

  const formatCurrency = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatMargin = (val: number) => val.toFixed(1) + '%';

  const profitColor = (val: number) => (val >= 0 ? 'text-green-600' : 'text-red-600');

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:border-[#0da993] focus:bg-white outline-none transition-all';
  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-slate-400';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900">{t.dashboard?.course_financials || 'Course Financials'}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-start">
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400">{t.dashboard?.col_title || 'Course Title'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.total_revenue_financial || 'Revenue'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.instructor_payout || 'Instructor'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.venue_rent || 'Venue'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.materials_cost || 'Materials'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.marketing_cost || 'Marketing'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.other_costs || 'Other'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.total_cost || 'Total Cost'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.net_profit || 'Profit'}</th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 text-end">{t.dashboard?.profit_margin || 'Margin%'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <React.Fragment key={row.courseId}>
                <tr
                  onClick={() => handleRowClick(row.courseId)}
                  className={`border-t border-slate-50 ${onSaveFinancial ? 'cursor-pointer hover:bg-slate-50' : ''} ${editingCourseId === row.courseId ? 'bg-[#0da993]/10' : ''}`}
                >
                  <td className="px-4 py-3 font-bold text-slate-900">{row.title}</td>
                  <td className="px-4 py-3 text-end font-bold text-slate-700">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 text-end text-slate-600">{formatCurrency(row.instructorPayout)}</td>
                  <td className="px-4 py-3 text-end text-slate-600">{formatCurrency(row.venueRent)}</td>
                  <td className="px-4 py-3 text-end text-slate-600">{formatCurrency(row.materialsCost)}</td>
                  <td className="px-4 py-3 text-end text-slate-600">{formatCurrency(row.marketingCost)}</td>
                  <td className="px-4 py-3 text-end text-slate-600">{formatCurrency(row.otherCosts)}</td>
                  <td className="px-4 py-3 text-end font-bold text-slate-700">{formatCurrency(row.totalCost)}</td>
                  <td className={`px-4 py-3 text-end font-black ${profitColor(row.profit)}`}>{formatCurrency(row.profit)}</td>
                  <td className={`px-4 py-3 text-end font-bold ${profitColor(row.margin)}`}>{formatMargin(row.margin)}</td>
                </tr>

                {/* Inline edit form */}
                {editingCourseId === row.courseId && onSaveFinancial && (
                  <tr>
                    <td colSpan={10} className="px-4 py-4 bg-[#0da993]/5 border-t border-[#0da993]/15">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <label className={labelClass}>{t.dashboard?.instructor_payout || 'Instructor Payout'}</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.instructorPayout}
                            onChange={(e) => setEditForm({ ...editForm, instructorPayout: Number(e.target.value) })}
                            className={inputClass}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>{t.dashboard?.venue_rent || 'Venue Rent'}</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.venueRent}
                            onChange={(e) => setEditForm({ ...editForm, venueRent: Number(e.target.value) })}
                            className={inputClass}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>{t.dashboard?.materials_cost || 'Materials Cost'}</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.materialsCost}
                            onChange={(e) => setEditForm({ ...editForm, materialsCost: Number(e.target.value) })}
                            className={inputClass}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>{t.dashboard?.marketing_cost || 'Marketing Cost'}</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.marketingCost}
                            onChange={(e) => setEditForm({ ...editForm, marketingCost: Number(e.target.value) })}
                            className={inputClass}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>{t.dashboard?.other_costs || 'Other Costs'}</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.otherCosts}
                            onChange={(e) => setEditForm({ ...editForm, otherCosts: Number(e.target.value) })}
                            className={inputClass}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(row.courseId); }}
                          className="bg-[#0da993] text-white px-4 py-2 rounded-lg font-black text-xs hover:bg-[#0da993]/90 transition-all"
                        >
                          {t.dashboard?.save || 'Save'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCourseId(null); }}
                          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-black text-xs hover:bg-slate-300 transition-all"
                        >
                          {t.dashboard?.cancel || 'Cancel'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Summary row */}
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-black">
              <td className="px-4 py-3 text-slate-900">{t.dashboard?.financial_summary || 'Total'}</td>
              <td className="px-4 py-3 text-end text-slate-900">{formatCurrency(totals.revenue)}</td>
              <td className="px-4 py-3 text-end text-slate-700">{formatCurrency(totals.instructorPayout)}</td>
              <td className="px-4 py-3 text-end text-slate-700">{formatCurrency(totals.venueRent)}</td>
              <td className="px-4 py-3 text-end text-slate-700">{formatCurrency(totals.materialsCost)}</td>
              <td className="px-4 py-3 text-end text-slate-700">{formatCurrency(totals.marketingCost)}</td>
              <td className="px-4 py-3 text-end text-slate-700">{formatCurrency(totals.otherCosts)}</td>
              <td className="px-4 py-3 text-end text-slate-900">{formatCurrency(totals.totalCost)}</td>
              <td className={`px-4 py-3 text-end ${profitColor(totals.profit)}`}>{formatCurrency(totals.profit)}</td>
              <td className={`px-4 py-3 text-end ${profitColor(totalMargin)}`}>{formatMargin(totalMargin)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {courses.length === 0 && (
        <div className="p-8 text-center text-slate-400 text-sm">
          {t.dashboard?.no_data || 'No data available'}
        </div>
      )}
    </div>
  );
};

export default FinancialsTable;
