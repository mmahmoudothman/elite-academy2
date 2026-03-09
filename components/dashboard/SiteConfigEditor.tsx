import React, { useState, useEffect } from 'react';
import { SiteConfig } from '../../types';
import { useLanguage } from '../LanguageContext';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import toast from 'react-hot-toast';

const SiteConfigEditor: React.FC = () => {
  const { t } = useLanguage();
  const { config, updateConfig } = useSiteConfig();
  const [form, setForm] = useState<SiteConfig>(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(config); }, [config]);

  const update = (path: string, value: any) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined || obj[keys[i]] === null) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(form);
      toast.success(t.dashboard?.config_saved || 'Settings saved successfully');
    } catch {
      toast.error(t.dashboard?.config_error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm';
  const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">{t.dashboard?.settings_tab || 'Site Settings'}</h3>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-60">
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? (t.dashboard?.saving || 'Saving...') : (t.dashboard?.save || 'Save Changes')}
        </button>
      </div>

      {/* Hero Content */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.hero_settings || 'Hero Section'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Hero Badge (EN)</label>
            <input value={form.heroBadge?.en || ''} onChange={e => update('heroBadge.en', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hero Badge (AR)</label>
            <input value={form.heroBadge?.ar || ''} onChange={e => update('heroBadge.ar', e.target.value)} className={inputClass} dir="rtl" />
          </div>
          <div>
            <label className={labelClass}>Hero Title (EN)</label>
            <input value={form.heroTitle?.en || ''} onChange={e => update('heroTitle.en', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hero Title (AR)</label>
            <input value={form.heroTitle?.ar || ''} onChange={e => update('heroTitle.ar', e.target.value)} className={inputClass} dir="rtl" />
          </div>
          <div>
            <label className={labelClass}>Subtitle (EN)</label>
            <textarea value={form.heroSubtitle?.en || ''} onChange={e => update('heroSubtitle.en', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Subtitle (AR)</label>
            <textarea value={form.heroSubtitle?.ar || ''} onChange={e => update('heroSubtitle.ar', e.target.value)} className={`${inputClass} resize-none`} rows={2} dir="rtl" />
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.company_info || 'Company Information'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name (EN)</label>
            <input value={form.companyName?.en || ''} onChange={e => update('companyName.en', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Company Name (AR)</label>
            <input value={form.companyName?.ar || ''} onChange={e => update('companyName.ar', e.target.value)} className={inputClass} dir="rtl" />
          </div>
          <div>
            <label className={labelClass}>Contact Email</label>
            <input value={form.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} className={inputClass} type="email" />
          </div>
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input value={form.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} className={inputClass} type="tel" />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.social_links || 'Social Media Links'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['whatsapp', 'instagram', 'linkedin', 'twitter', 'facebook'] as const).map(platform => (
            <div key={platform}>
              <label className={labelClass}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
              <input value={form.socialLinks?.[platform] || ''} onChange={e => update(`socialLinks.${platform}`, e.target.value)} className={inputClass} placeholder={`https://${platform}.com/...`} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.footer_settings || 'Footer'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Footer Text (EN)</label>
            <textarea value={form.footerText?.en || ''} onChange={e => update('footerText.en', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Footer Text (AR)</label>
            <textarea value={form.footerText?.ar || ''} onChange={e => update('footerText.ar', e.target.value)} className={`${inputClass} resize-none`} rows={2} dir="rtl" />
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Announcement Banner</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Announcement Text (EN)</label>
            <input value={form.announcement?.en || ''} onChange={e => update('announcement.en', e.target.value)} className={inputClass} placeholder="e.g. New courses available!" />
          </div>
          <div>
            <label className={labelClass}>Announcement Text (AR)</label>
            <input value={form.announcement?.ar || ''} onChange={e => update('announcement.ar', e.target.value)} className={inputClass} dir="rtl" placeholder="مثال: دورات جديدة متاحة!" />
          </div>
          <div>
            <label className={labelClass}>Link URL (Optional)</label>
            <input value={form.announcement?.link || ''} onChange={e => update('announcement.link', e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className={labelClass}>Visible</label>
            <button
              type="button"
              onClick={() => update('announcement.visible', !form.announcement?.visible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.announcement?.visible ? 'bg-teal-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.announcement?.visible ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.whatsapp_config || 'WhatsApp Configuration'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.dashboard?.whatsapp_number || 'WhatsApp Number'}</label>
            <input value={form.whatsappNumber || ''} onChange={e => update('whatsappNumber', e.target.value)} className={inputClass} placeholder="+20 104 074 2770" />
            <p className="text-[10px] text-slate-400 mt-1">Phone number with country code (used for floating button)</p>
          </div>
          <div>
            <label className={labelClass}>WhatsApp Link (wa.me)</label>
            <input value={form.socialLinks?.whatsapp || ''} onChange={e => update('socialLinks.whatsapp', e.target.value)} className={inputClass} placeholder="https://wa.me/201040742770" />
          </div>
          <div>
            <label className={labelClass}>Default Message (EN)</label>
            <input value={form.whatsappMessage?.en || ''} onChange={e => update('whatsappMessage.en', e.target.value)} className={inputClass} placeholder="Hello! I'm interested..." />
          </div>
          <div>
            <label className={labelClass}>Default Message (AR)</label>
            <input value={form.whatsappMessage?.ar || ''} onChange={e => update('whatsappMessage.ar', e.target.value)} className={inputClass} dir="rtl" placeholder="مرحباً! أنا مهتم..." />
          </div>
        </div>
      </div>

      {/* Telegram Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">{t.dashboard?.telegram_config || 'Telegram Notifications'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.dashboard?.bot_token || 'Bot Token'}</label>
            <input value={(form as any).telegram?.botToken || ''} onChange={e => update('telegram.botToken', e.target.value)} className={inputClass} placeholder="123456:ABC-DEF..." type="password" />
          </div>
          <div>
            <label className={labelClass}>{t.dashboard?.chat_id || 'Chat ID'}</label>
            <input value={(form as any).telegram?.chatId || ''} onChange={e => update('telegram.chatId', e.target.value)} className={inputClass} placeholder="-100123456789" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className={labelClass}>{t.dashboard?.telegram_enabled || 'Enabled'}</label>
            <button
              type="button"
              onClick={() => update('telegram.enabled', !(form as any).telegram?.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(form as any).telegram?.enabled ? 'bg-teal-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(form as any).telegram?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={async () => {
                try {
                  // Save current form to localStorage first so test reads latest values
                  const current = { ...form, updatedAt: Date.now() };
                  localStorage.setItem('elite_academy_site_config', JSON.stringify(current));
                  const { sendTestMessage } = await import('../../services/telegramService');
                  const ok = await sendTestMessage();
                  if (ok) toast.success(t.dashboard?.test_sent || 'Test message sent!');
                  else toast.error(t.dashboard?.telegram_test_failed || 'Failed - check bot token and chat ID');
                } catch { toast.error(t.dashboard?.telegram_test_failed || 'Failed to send test message'); }
              }}
              className="mt-5 px-4 py-2.5 border border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all"
            >
              {t.dashboard?.test_telegram || 'Send Test Message'}
            </button>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Notification Types</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'newRegistration', label: t.dashboard?.notify_registration || 'New Registration' },
              { key: 'newEnrollment', label: t.dashboard?.notify_enrollment || 'New Enrollment' },
              { key: 'newPayment', label: t.dashboard?.notify_payment || 'New Payment' },
              { key: 'newContact', label: t.dashboard?.notify_contact || 'New Contact' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as any).telegram?.notifications?.[key] ?? false}
                  onChange={e => update(`telegram.notifications.${key}`, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-slate-600">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-60">
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? (t.dashboard?.saving || 'Saving...') : (t.dashboard?.save || 'Save Changes')}
        </button>
      </div>
    </div>
  );
};

export default SiteConfigEditor;
