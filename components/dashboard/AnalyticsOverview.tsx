import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../LanguageContext';
import { Enrollment, Course, DashboardStats, Student, ContactSubmission } from '../../types';
import { useAnalytics } from '../../hooks/useAnalytics';
import { getAnalyticsEvents, getEventsByDateRange } from '../../services/analyticsTracker';
import { StatSkeleton } from '../ui/Skeleton';

interface AnalyticsOverviewProps {
  enrollments: Enrollment[];
  courses: Course[];
  stats: DashboardStats;
  students?: Student[];
  contacts?: ContactSubmission[];
  loading?: boolean;
}

const COLORS = ['#0da993', '#3d66f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

type DateRange = '7d' | '30d' | '90d' | 'all';

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ enrollments, courses, stats, students = [], contacts = [], loading }) => {
  const { t } = useLanguage();
  const { monthlyData, courseAnalytics, statusBreakdown, paymentBreakdown, totalRevenue, categoryRevenue } = useAnalytics(enrollments, courses, students);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Compute date range bounds
  const dateRangeBounds = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    switch (dateRange) {
      case '7d': return { start: now - 7 * dayMs, end: now };
      case '30d': return { start: now - 30 * dayMs, end: now };
      case '90d': return { start: now - 90 * dayMs, end: now };
      case 'all': return { start: 0, end: now };
    }
  }, [dateRange]);

  // Get analytics events filtered by date range
  const filteredEvents = useMemo(() => {
    if (dateRange === 'all') return getAnalyticsEvents();
    return getEventsByDateRange(dateRangeBounds.start, dateRangeBounds.end);
  }, [dateRange, dateRangeBounds]);

  // Event counts by type
  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {
      page_view: 0,
      course_view: 0,
      enrollment_start: 0,
      enrollment_complete: 0,
      contact_submit: 0,
      whatsapp_click: 0,
      social_click: 0,
      cta_click: 0,
      search: 0,
    };
    filteredEvents.forEach(e => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    });
    return counts;
  }, [filteredEvents]);

  // Filter enrollments by date range
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => e.enrolledAt >= dateRangeBounds.start && e.enrolledAt <= dateRangeBounds.end);
  }, [enrollments, dateRangeBounds]);

  // Filtered contacts count
  const filteredContacts = useMemo(() => {
    const filtered = contacts.filter((c) => c.submittedAt >= dateRangeBounds.start && c.submittedAt <= dateRangeBounds.end);
    return {
      total: filtered.length,
      responded: filtered.filter((c) => c.status === 'responded').length,
    };
  }, [contacts, dateRangeBounds]);

  // KPI calculations
  const kpis = useMemo(() => {
    const courseViews = eventCounts.course_view;
    const enrollmentCompletes = eventCounts.enrollment_complete;
    const conversionRate = courseViews > 0 ? (enrollmentCompletes / courseViews) * 100 : 0;

    const paidEnrollments = filteredEnrollments.filter(e => e.paymentStatus === 'paid');
    const totalPaidRevenue = paidEnrollments.reduce((sum, e) => sum + e.paymentAmount, 0);
    const uniqueStudents = new Set(filteredEnrollments.map(e => e.studentId)).size;
    const avgRevenuePerStudent = uniqueStudents > 0 ? totalPaidRevenue / uniqueStudents : 0;

    const contactResponseRate = filteredContacts.total > 0 ? (filteredContacts.responded / filteredContacts.total) * 100 : 0;

    const courseFillRates = courses.map(c => c.capacity > 0 ? (c.enrolled / c.capacity) * 100 : 0);
    const avgFillRate = courseFillRates.length > 0 ? courseFillRates.reduce((a, b) => a + b, 0) / courseFillRates.length : 0;

    return { conversionRate, avgRevenuePerStudent, contactResponseRate, avgFillRate };
  }, [eventCounts, filteredEnrollments, filteredContacts, courses]);

  // Conversion funnel data
  const funnelData = useMemo(() => {
    const steps = [
      { name: 'Page Views', value: eventCounts.page_view, fill: '#0da993' },
      { name: 'Course Views', value: eventCounts.course_view, fill: '#3d66f1' },
      { name: 'Enrollment Starts', value: eventCounts.enrollment_start, fill: '#f59e0b' },
      { name: 'Enrollments Completed', value: eventCounts.enrollment_complete, fill: '#10b981' },
    ];
    return steps;
  }, [eventCounts]);

  // Top performing courses
  const topCourses = useMemo(() => {
    // Count views and enrollments per course from analytics events
    const courseViewCounts: Record<string, number> = {};
    const courseEnrollCounts: Record<string, number> = {};

    filteredEvents.forEach(e => {
      if (e.eventType === 'course_view' && e.entityId) {
        courseViewCounts[e.entityId] = (courseViewCounts[e.entityId] || 0) + 1;
      }
      if (e.eventType === 'enrollment_complete' && e.entityId) {
        courseEnrollCounts[e.entityId] = (courseEnrollCounts[e.entityId] || 0) + 1;
      }
    });

    return courses.map(c => {
      const views = courseViewCounts[c.id] || 0;
      const enrolls = courseEnrollCounts[c.id] || 0;
      const revenue = filteredEnrollments
        .filter(e => e.courseId === c.id && e.paymentStatus === 'paid')
        .reduce((sum, e) => sum + e.paymentAmount, 0);
      const fillRate = c.capacity > 0 ? ((c.enrolled / c.capacity) * 100) : 0;

      return { id: c.id, title: c.title, views, enrollments: enrolls, revenue, fillRate };
    }).sort((a, b) => b.enrollments - a.enrollments || b.views - a.views).slice(0, 8);
  }, [courses, filteredEvents, filteredEnrollments]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
    );
  }

  const filteredTotalRevenue = filteredEnrollments
    .filter(e => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.paymentAmount, 0);

  const summaryCards = [
    { label: t.dashboard?.total_revenue || 'Total Revenue', value: `$${(filteredTotalRevenue / 1000).toFixed(1)}k`, color: 'bg-emerald-50 text-emerald-600', icon: '$' },
    { label: t.dashboard?.total_enrollments || 'Enrollments', value: filteredEnrollments.length, color: 'bg-amber-50 text-amber-600', icon: '#' },
    { label: t.dashboard?.total_students || 'Students', value: stats.totalStudents, color: 'bg-[#3d66f1]/10 text-[#3d66f1]', icon: 'U' },
    { label: t.dashboard?.new_contacts || 'New Messages', value: stats.totalContacts, color: 'bg-blue-50 text-blue-600', icon: 'M' },
  ];

  const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }));

  const dateRangeOptions: { key: DateRange; label: string }[] = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-2">
        {dateRangeOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              dateRange === opt.key
                ? 'bg-[#0da993] text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-[#0da993]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${card.color} mb-3 sm:mb-4 text-lg font-black`}>{card.icon}</div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{card.value}</p>
            <p className="text-xs sm:text-sm font-bold text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Conversion Rate</p>
          <p className="text-xl sm:text-2xl font-black text-[#0da993]">{kpis.conversionRate.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Enrollments / Course Views</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Avg Revenue / Student</p>
          <p className="text-xl sm:text-2xl font-black text-[#3d66f1]">${kpis.avgRevenuePerStudent.toFixed(0)}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Paid Revenue / Students</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Response Rate</p>
          <p className="text-xl sm:text-2xl font-black text-amber-600">{kpis.contactResponseRate.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Responded / Total Contacts</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Course Fill Rate</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{kpis.avgFillRate.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Avg Enrolled / Capacity</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <h4 className="text-sm font-black text-slate-900 mb-4">Conversion Funnel</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {funnelData.map((step, i) => {
            const prevValue = i > 0 ? funnelData[i - 1].value : 0;
            const convPct = i > 0 && prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(1) : null;
            return (
              <div key={step.name} className="relative">
                <div
                  className="rounded-xl p-4 text-center text-white"
                  style={{ backgroundColor: step.fill }}
                >
                  <p className="text-2xl sm:text-3xl font-black">{step.value}</p>
                  <p className="text-[10px] sm:text-xs font-bold opacity-90 mt-1">{step.name}</p>
                </div>
                {convPct !== null && (
                  <div className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-[9px] font-black text-slate-600 shadow-sm whitespace-nowrap">
                      {convPct}%
                    </div>
                  </div>
                )}
                {convPct !== null && (
                  <p className="sm:hidden text-center text-[10px] font-bold text-slate-400 mt-1">
                    {convPct}% from previous
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.enrollment_trend || 'Enrollment Trend'}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0da993" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0da993" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }} />
              <Area type="monotone" dataKey="enrollments" stroke="#0da993" strokeWidth={2} fill="url(#enrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.revenue_trend || 'Revenue Trend'}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }} />
              <Line type="monotone" dataKey="revenue" stroke="#3d66f1" strokeWidth={2} dot={{ r: 4, fill: '#3d66f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Courses Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <h4 className="text-sm font-black text-slate-900 mb-4">Top Performing Courses</h4>
        {topCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-start py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Course</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Views</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollments</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                  <th className="text-center py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900 max-w-[200px] truncate">{c.title}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-600">{c.views}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-600">{c.enrollments}</td>
                    <td className="py-3 px-2 text-center font-bold text-[#0da993]">${c.revenue.toLocaleString()}</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(c.fillRate, 100)}%`,
                              backgroundColor: c.fillRate >= 90 ? '#ef4444' : c.fillRate >= 70 ? '#f59e0b' : '#10b981',
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{c.fillRate.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px] text-slate-400 text-sm font-bold">{t.dashboard?.no_data || 'No data available'}</div>
        )}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Rankings */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.course_rankings || 'Course Rankings'}</h4>
          {courseAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courseAnalytics.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="courseTitle" width={120} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }} />
                <Bar dataKey="enrollments" fill="#0da993" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm font-bold">{t.dashboard?.no_data || 'No data available'}</div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.status_breakdown || 'Status Breakdown'}</h4>
          {enrollments.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {statusData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{item.name}</span>
                    <span className="text-slate-400 ms-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm font-bold">{t.dashboard?.no_data || 'No data available'}</div>
          )}
        </div>
      </div>

      {/* Category Revenue */}
      {categoryRevenue.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.revenue_by_category || 'Revenue by Category'}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 13 }} />
              <Bar dataKey="value" fill="#3d66f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsOverview;
