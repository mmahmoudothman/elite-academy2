import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useDataManager } from '../hooks/useDataManager';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { useAnalyticsTracker, usePageView } from '../hooks/useAnalyticsTracker';
import { stripHtml } from '../utils/sanitize';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { addContact } = useDataManager();
  const { config } = useSiteConfig();
  const { track } = useAnalyticsTracker();
  usePageView('contact');

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'general', inquiryType: 'general', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lastSubmit, setLastSubmit] = useState(0);

  // Capture source page from query param or referrer
  const [sourcePage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('from') || document.referrer || 'direct';
  });

  const inquiryTypes = [
    { value: 'general', label: t.contact?.inquiry_general || 'General Inquiry' },
    { value: 'course_info', label: t.contact?.inquiry_course_info || 'Course Information' },
    { value: 'corporate', label: t.contact?.inquiry_corporate || 'Corporate Training' },
    { value: 'partnership', label: t.contact?.inquiry_partnership || 'Partnership' },
    { value: 'technical', label: t.contact?.inquiry_technical || 'Technical Support' },
    { value: 'billing', label: t.contact?.inquiry_billing || 'Billing/Payment' },
    { value: 'feedback', label: t.contact?.inquiry_feedback || 'Feedback' },
  ];

  const subjects = [
    { value: 'general', label: t.contact?.subject_general || 'General Inquiry' },
    { value: 'enrollment', label: t.contact?.subject_enrollment || 'Course Enrollment' },
    { value: 'partnership', label: t.contact?.subject_partnership || 'Partnership' },
    { value: 'support', label: t.contact?.subject_support || 'Technical Support' },
    { value: 'other', label: t.contact?.subject_other || 'Other' },
  ];

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return t.contact?.name_required || 'Name is required';
        if (value.trim().length < 2) return t.contact?.name_min_2 || 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return t.contact?.email_required || 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.contact?.email_invalid_format || 'Invalid email';
        return '';
      case 'phone':
        if (value.trim() && !/^\+?[\d\s\-()]{7,20}$/.test(value.trim())) return t.contact?.phone_invalid_format || 'Invalid phone number';
        return '';
      case 'message':
        if (!value.trim()) return t.contact?.message_required || 'Message is required';
        if (value.trim().length < 10) return t.contact?.message_min_10 || 'Message must be at least 10 characters';
        return '';
      default:
        return '';
    }
  }, [t]);

  // Real-time validation as user types
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    for (const field of Object.keys(touched)) {
      if (touched[field]) {
        const error = validateField(field, (form as any)[field] || '');
        if (error) newErrors[field] = error;
      }
    }
    setErrors(newErrors);
  }, [form, touched, validateField]);

  const validate = () => {
    const e: Record<string, string> = {};
    const fieldsToValidate = ['name', 'email', 'phone', 'message'];
    const allTouched: Record<string, boolean> = {};
    for (const field of fieldsToValidate) {
      allTouched[field] = true;
      const error = validateField(field, (form as any)[field] || '');
      if (error) e[field] = error;
    }
    setTouched(prev => ({ ...prev, ...allTouched }));
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Rate limit: 30 seconds between submissions
    if (Date.now() - lastSubmit < 30000) {
      toast.error(t.contact?.rate_limit || 'Please wait before sending another message.');
      return;
    }

    setLoading(true);
    setLastSubmit(Date.now());
    try {
      await addContact({
        name: stripHtml(form.name),
        email: stripHtml(form.email),
        phone: stripHtml(form.phone),
        subject: stripHtml(form.subject),
        message: stripHtml(form.message),
        inquiryType: form.inquiryType,
        sourcePage,
        status: 'new',
        submittedAt: Date.now(),
      });
      track('contact_submit', { metadata: { subject: form.subject, inquiryType: form.inquiryType } });
      // Telegram notification (fire and forget)
      import('../services/telegramService').then(({ notifyNewContact }) => {
        notifyNewContact(form.name, form.subject, form.inquiryType);
      }).catch(() => {});
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: 'general', inquiryType: 'general', message: '' });
      setTouched({});
      toast.success(t.contact?.success || 'Message sent successfully!');
    } catch {
      toast.error(t.contact?.error || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build WhatsApp URL with pre-filled message
  const whatsappNumber = (config.socialLinks?.whatsapp || '').replace(/[^0-9]/g, '');
  const whatsappPrefill = encodeURIComponent(t.contact?.whatsapp_prefill || 'Hello, I would like to inquire about Elite Academy courses.');
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappPrefill}` : config.socialLinks?.whatsapp || '#';

  const inputClass = (field: string) =>
    `w-full bg-slate-50 border ${errors[field] && touched[field] ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm sm:text-base`;

  const socialLinksData = [
    { href: config.socialLinks?.instagram, label: 'Instagram', color: 'hover:text-pink-500', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /> },
    { href: config.socialLinks?.linkedin, label: 'LinkedIn', color: 'hover:text-blue-600', icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
    { href: config.socialLinks?.twitter, label: 'Twitter/X', color: 'hover:text-slate-800', icon: <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /> },
    { href: config.socialLinks?.facebook, label: 'Facebook', color: 'hover:text-blue-500', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
  ].filter(s => s.href);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-black text-[#0da993] uppercase tracking-[0.3em]">{t.contact?.badge || 'Get in Touch'}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-slate-900 mt-4">{t.contact?.title || 'Contact Us'}</h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium mt-4">{t.contact?.subtitle || 'We\'d love to hear from you. Reach out through any channel below.'}</p>
          </div>

          {/* WhatsApp CTA Banner */}
          <div className="mb-8 sm:mb-12">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-2xl mx-auto py-4 sm:py-5 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.99]"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div className="text-center sm:text-start">
                <p className="text-lg sm:text-xl font-black">{t.contact?.whatsapp_cta || 'Chat on WhatsApp'}</p>
                <p className="text-sm text-green-100 font-medium">{t.contact?.whatsapp_desc || 'Chat with us instantly'}</p>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="md:col-span-2 lg:col-span-3">
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{t.contact?.success_title || 'Message Sent!'}</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6">{t.contact?.success_desc || 'Our team will get back to you within 24 hours.'}</p>
                  <button onClick={() => setSuccess(false)} className="px-6 py-2.5 bg-[#0da993] text-white rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all">
                    {t.contact?.send_another || 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 space-y-4 sm:space-y-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.name || 'Full Name'} *</label>
                      <input type="text" value={form.name} onChange={e => update('name', e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, name: true }))} className={inputClass('name')} placeholder={t.form?.name_placeholder || 'Your name'} />
                      {errors.name && touched.name && <p className="text-xs text-red-500 font-bold mt-1 ms-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.email || 'Email'} *</label>
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, email: true }))} className={inputClass('email')} placeholder="you@email.com" />
                      {errors.email && touched.email && <p className="text-xs text-red-500 font-bold mt-1 ms-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.phone || 'Phone'}</label>
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, phone: true }))} className={inputClass('phone')} placeholder="+20 100..." />
                      {errors.phone && touched.phone && <p className="text-xs text-red-500 font-bold mt-1 ms-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.contact?.subject_label || 'Subject'}</label>
                      <select value={form.subject} onChange={e => update('subject', e.target.value)} className={`${inputClass('subject')} appearance-none`}>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Inquiry Type Dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.contact?.inquiry_type_label || 'Inquiry Type'}</label>
                    <select value={form.inquiryType} onChange={e => update('inquiryType', e.target.value)} className={`${inputClass('inquiryType')} appearance-none`}>
                      {inquiryTypes.map(it => <option key={it.value} value={it.value}>{it.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.contact?.message_label || 'Message'} *</label>
                    <textarea value={form.message} onChange={e => update('message', e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, message: true }))} rows={5} className={`${inputClass('message')} resize-none`} placeholder={t.contact?.message_placeholder || 'How can we help you?'} />
                    {errors.message && touched.message && <p className="text-xs text-red-500 font-bold mt-1 ms-1">{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0da993] text-white font-bold rounded-xl hover:bg-[#0da993]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {loading ? (t.contact?.sending || 'Sending...') : (t.contact?.send || 'Send Message')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="md:col-span-1 lg:col-span-2 space-y-6">
              {/* Email */}
              <a href={`mailto:${config.contactEmail}`} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-[#0da993]/10 rounded-xl flex items-center justify-center text-[#0da993] flex-shrink-0 group-hover:bg-[#0da993] group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.contact?.email_label || 'Email Us'}</p>
                  <p className="text-sm font-bold text-slate-900">{config.contactEmail}</p>
                </div>
              </a>

              {/* Phone */}
              <a href={`tel:${config.contactPhone}`} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-[#0da993]/10 rounded-xl flex items-center justify-center text-[#0da993] flex-shrink-0 group-hover:bg-[#0da993] group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.contact?.phone_label || 'Call Us'}</p>
                  <p className="text-sm font-bold text-slate-900">{config.contactPhone}</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 bg-green-50 rounded-2xl border border-green-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">WhatsApp</p>
                  <p className="text-sm font-bold text-slate-900">{t.contact?.whatsapp_desc || 'Chat with us instantly'}</p>
                </div>
              </a>

              {/* Addresses */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.contact?.locations || 'Our Locations'}</p>
                <div className="space-y-3">
                  {config.addresses.map((addr, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#0da993] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-bold text-slate-700">{addr.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.contact?.follow_us || 'Follow Us'}</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinksData.map((social, i) => (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-400 ${social.color} hover:shadow-md border border-slate-200 transition-all`} title={social.label}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{social.icon}</svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
