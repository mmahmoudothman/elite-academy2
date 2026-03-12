import React, { useState } from 'react';
import { Ad, AdPlacement, AdStatus } from '../../types';
import { useLanguage } from '../LanguageContext';

interface AdsTableProps {
  ads: Ad[];
  onAdd?: () => void;
  onEdit?: (ad: Ad) => void;
  onDelete?: (ad: Ad) => void;
  onToggleStatus?: (ad: Ad) => void;
}

const statusColors: Record<AdStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-50 text-emerald-600',
  paused: 'bg-amber-50 text-amber-600',
  expired: 'bg-red-50 text-red-600',
};

const placementColors: Record<AdPlacement, string> = {
  banner: 'bg-blue-50 text-blue-600',
  popup: 'bg-purple-50 text-purple-600',
  sidebar: 'bg-[#0da993]/10 text-[#0da993]',
  inline: 'bg-amber-50 text-amber-600',
};

const AdsTable: React.FC<AdsTableProps> = ({ ads, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'all'>('all');
  const [placementFilter, setPlacementFilter] = useState<AdPlacement | 'all'>('all');

  const filtered = ads.filter(ad => {
    if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
    if (placementFilter !== 'all' && ad.placement !== placementFilter) return false;
    return true;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const computeCTR = (impressions: number, clicks: number) => {
    if (!impressions) return '0.00%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  const selectClass = 'px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-[#0da993] outline-none transition-all';

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">{t.dashboard?.ads_tab || 'Ads'}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AdStatus | 'all')}
            className={selectClass}
          >
            <option value="all">{t.dashboard?.filter_all_statuses || 'All Statuses'}</option>
            <option value="draft">{t.dashboard?.status_draft || 'Draft'}</option>
            <option value="active">{t.dashboard?.status_active || 'Active'}</option>
            <option value="paused">{t.dashboard?.status_paused || 'Paused'}</option>
            <option value="expired">{t.dashboard?.status_expired || 'Expired'}</option>
          </select>
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value as AdPlacement | 'all')}
            className={selectClass}
          >
            <option value="all">{t.dashboard?.filter_all_placements || 'All Placements'}</option>
            <option value="banner">{t.dashboard?.placement_banner || 'Banner'}</option>
            <option value="popup">{t.dashboard?.placement_popup || 'Popup'}</option>
            <option value="sidebar">{t.dashboard?.placement_sidebar || 'Sidebar'}</option>
            <option value="inline">{t.dashboard?.placement_inline || 'Inline'}</option>
          </select>
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.dashboard?.add_ad || 'Add Ad'}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{t.dashboard?.no_ads || 'No ads found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_title || 'Title'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_placement || 'Placement'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_status || 'Status'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_date_range || 'Date Range'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_impressions || 'Impressions'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_clicks || 'Clicks'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_ctr || 'CTR'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{t.dashboard?.col_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">
                      {ad.title[language] || ad.title.en}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${placementColors[ad.placement]}`}>
                        {ad.placement.charAt(0).toUpperCase() + ad.placement.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[ad.status]}`}>
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {ad.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {ad.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {computeCTR(ad.impressions, ad.clicks)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(ad)}
                            className="p-2 text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                            title={t.dashboard?.edit || 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onToggleStatus && (
                          <button
                            onClick={() => onToggleStatus(ad)}
                            className={`p-2 rounded-lg transition-all ${
                              ad.status === 'active'
                                ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={ad.status === 'active' ? (t.dashboard?.pause || 'Pause') : (t.dashboard?.activate || 'Activate')}
                          >
                            {ad.status === 'active' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(ad)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title={t.dashboard?.delete || 'Delete'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
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

export default AdsTable;
