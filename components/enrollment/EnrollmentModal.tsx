import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDataManager } from '../../hooks/useDataManager';
import { useAnalyticsTracker } from '../../hooks/useAnalyticsTracker';
import { stripHtml } from '../../utils/sanitize';
import { checkRateLimit, getRemainingCooldown } from '../../utils/rateLimit';
import toast from 'react-hot-toast';

interface EnrollmentModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
}

type Step = 'details' | 'info' | 'payment' | 'confirm';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${y}${m}${d}-${seq}`;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, course, onClose }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addEnrollment, updateCourse, enrollments: existingEnrollments } = useDataManager();
  const { track } = useAnalyticsTracker();

  // Track enrollment_start when modal opens
  useEffect(() => {
    if (isOpen && course) {
      track('enrollment_start', { entityType: 'course', entityId: course.id, metadata: { courseTitle: course.title } });
    }
  }, [isOpen, course?.id]); // eslint-disable-line

  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'EG',
    preferredLanguage: (user?.preferredLanguage || language || 'en') as 'en' | 'ar',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'credit_card' | 'cash',
    notes: '',
    discountCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    paymentReference: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [installmentPlan, setInstallmentPlan] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);

  if (!isOpen || !course) return null;

  const isFull = course.capacity > 0 && course.enrolled >= course.capacity;
  const availableSpots = course.capacity > 0 ? Math.max(0, course.capacity - course.enrolled) : Infinity;
  const alreadyEnrolled = existingEnrollments.some(e => e.courseId === course.id && e.studentEmail === (user?.email || form.email) && e.status !== 'cancelled');

  const totalDue = Math.max(0, course.price - discountAmount);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t.contact?.name_required || 'Required';
    if (!form.email.trim()) e.email = t.contact?.email_required || 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.contact?.email_invalid || 'Invalid email';
    if (!form.phone.trim()) e.phone = t.form?.phone_required || 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyDiscount = () => {
    const code = form.discountCode.trim().toUpperCase();
    if (!code) return;
    // Demo discount codes
    if (code === 'ELITE10') {
      setDiscountAmount(course.price * 0.1);
      setDiscountApplied(true);
      toast.success('10% discount applied!');
    } else if (code === 'ELITE20') {
      setDiscountAmount(course.price * 0.2);
      setDiscountApplied(true);
      toast.success('20% discount applied!');
    } else {
      toast.error('Invalid discount code');
      setDiscountApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleNext = () => {
    if (step === 'details') setStep('info');
    else if (step === 'info') {
      if (validateInfo()) setStep('payment');
    }
    else if (step === 'payment') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'info') setStep('details');
    else if (step === 'payment') setStep('info');
    else if (step === 'confirm') setStep('payment');
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    // Rate limit: 3 enrollments per 10 minutes
    if (!checkRateLimit('enrollment', 3, 10 * 60 * 1000)) {
      const cooldown = Math.ceil(getRemainingCooldown('enrollment', 10 * 60 * 1000) / 60000);
      toast.error(`Too many enrollment attempts. Please wait ${cooldown} minute(s).`);
      return;
    }
    const isDuplicate = existingEnrollments.some(e => e.courseId === course.id && e.studentEmail === form.email && e.status !== 'cancelled');
    if (isDuplicate) {
      toast.error(t.enrollment?.already_enrolled || 'You are already enrolled in this course');
      return;
    }
    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      let paymentReference = '';
      if (form.paymentMethod === 'credit_card' && form.cardNumber.length >= 4) {
        paymentReference = `**** ${form.cardNumber.slice(-4)}`;
      } else if (form.paymentMethod === 'bank_transfer' && form.paymentReference) {
        paymentReference = form.paymentReference;
      }

      // Generate installments if plan enabled
      const installments = installmentPlan ? Array.from({ length: installmentCount }, (_, i) => ({
        id: `inst_${Date.now()}_${i}`,
        enrollmentId: '', // will be set after enrollment creation
        amount: Math.round((totalDue / installmentCount) * 100) / 100,
        currency: course.currency,
        dueDate: Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000, // monthly intervals
        status: i === 0 ? 'due' as const : 'upcoming' as const,
      })) : undefined;

      await addEnrollment({
        studentId: user?.id || `guest_${Date.now()}`,
        studentName: stripHtml(form.name),
        studentEmail: form.email,
        studentPhone: form.phone,
        courseId: course.id,
        courseTitle: course.title,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: form.paymentMethod,
        paymentAmount: totalDue,
        paymentCurrency: course.currency,
        enrolledAt: Date.now(),
        notes: stripHtml(form.notes),
        invoiceNumber,
        discountCode: discountApplied ? form.discountCode.trim().toUpperCase() : undefined,
        discountAmount: discountApplied ? discountAmount : undefined,
        paymentReference: paymentReference || undefined,
        installmentPlan: installmentPlan || undefined,
        installmentCount: installmentPlan ? installmentCount : undefined,
        installments: installments || undefined,
      });
      await updateCourse(course.id, { enrolled: (course.enrolled || 0) + 1 });
      track('enrollment_complete', { entityType: 'course', entityId: course.id, metadata: { courseTitle: course.title, paymentMethod: form.paymentMethod } });
      // Telegram notification (fire and forget)
      import('../../services/telegramService').then(({ notifyNewEnrollment }) => {
        notifyNewEnrollment(form.name, course.title, totalDue, course.currency);
      }).catch(() => {});
      toast.success(t.enrollment?.success || 'Enrollment submitted successfully!');
      setStep('details');
      setAgreedToTerms(false);
      setDiscountApplied(false);
      setDiscountAmount(0);
      onClose();
    } catch {
      toast.error(t.enrollment?.error || 'Enrollment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setErrors({});
    setAgreedToTerms(false);
    onClose();
  };

  const countries = [
    { code: 'EG', label: t.form?.egypt || 'Egypt' },
    { code: 'SA', label: t.form?.saudi || 'Saudi Arabia' },
    { code: 'AE', label: t.form?.uae || 'UAE' },
    { code: 'KW', label: t.form?.kuwait || 'Kuwait' },
    { code: 'QA', label: t.form?.qatar || 'Qatar' },
  ];

  const steps: { key: Step; label: string }[] = [
    { key: 'details', label: t.enrollment?.step_details || 'Course' },
    { key: 'info', label: t.enrollment?.step_info || 'Info' },
    { key: 'payment', label: t.enrollment?.step_payment || 'Payment' },
    { key: 'confirm', label: t.enrollment?.step_confirm || 'Review' },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  const inputClass = (field: string) =>
    `w-full bg-slate-50 border ${errors[field] ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm`;

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto" style={{ animation: 'modalFadeIn 0.3s ease-out' }} onClick={handleClose}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl p-5 sm:p-8 sm:my-4" style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
          {/* Close */}
          <button onClick={handleClose} className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Step indicator with labels */}
          <div className="flex items-center gap-0 mb-6">
            {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center" style={{ minWidth: 48 }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < stepIndex ? 'bg-teal-600 text-white' : i === stepIndex ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-slate-100 text-slate-400'}`}>
                    {i < stepIndex ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-[9px] font-bold mt-1 ${i <= stepIndex ? 'text-teal-600' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-[-12px] ${i < stepIndex ? 'bg-teal-600' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step: Course Details */}
          {step === 'details' && (
            <div className="space-y-5" style={{ animation: 'modalFadeIn 0.25s ease-out' }}>
              <div>
                <span className="bg-teal-50 text-teal-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">{course.category}</span>
                <h3 className="text-xl font-black text-slate-900 mt-3">{course.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{course.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.enrollment?.instructor_label || 'Instructor'}</p>
                  <p className="text-sm font-black text-slate-900">{course.instructor}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.enrollment?.duration || 'Duration'}</p>
                  <p className="text-sm font-black text-slate-900">{course.duration}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.enrollment?.level || 'Level'}</p>
                  <p className="text-sm font-black text-slate-900">{course.level}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.enrollment?.price || 'Price'}</p>
                  <p className="text-sm font-black text-teal-600">{course.price} {course.currency}</p>
                </div>
              </div>

              {/* Available spots */}
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">{t.enrollment?.available_spots || 'Available Spots'}</span>
                <span className={`text-sm font-black ${availableSpots <= 5 && availableSpots > 0 ? 'text-amber-600' : availableSpots === 0 ? 'text-red-600' : 'text-teal-600'}`}>
                  {availableSpots === Infinity ? 'Unlimited' : availableSpots}
                </span>
              </div>

              {isFull ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm font-bold text-amber-700">{t.enrollment?.full || 'This course is currently full'}</p>
                  <p className="text-xs text-amber-600 mt-1">{t.enrollment?.waitlist_message || 'You can join the waitlist and we will notify you when a spot opens up.'}</p>
                </div>
              ) : alreadyEnrolled ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-blue-700">{t.enrollment?.already_enrolled || 'You are already enrolled in this course'}</p>
                </div>
              ) : (
                <button onClick={handleNext} className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all active:scale-[0.98]">
                  {t.enrollment?.continue || 'Continue Enrollment'}
                </button>
              )}
            </div>
          )}

          {/* Step: Student Info */}
          {step === 'info' && (
            <div className="space-y-4" style={{ animation: 'modalFadeIn 0.25s ease-out' }}>
              <h3 className="text-lg font-black text-slate-900">{t.enrollment?.your_info || 'Your Information'}</h3>
              {user && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 text-xs font-bold text-teal-700">
                  {t.enrollment?.prefilled || 'Pre-filled from your profile. You can edit if needed.'}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.form?.name || 'Full Name'} *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} className={inputClass('name')} placeholder={t.form?.name_placeholder || 'Your full name'} />
                {errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.form?.email || 'Email'} *</label>
                  <input value={form.email} onChange={e => update('email', e.target.value)} className={inputClass('email')} placeholder="you@email.com" />
                  {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.form?.phone || 'Phone'} *</label>
                  <input value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass('phone')} placeholder="+20..." />
                  {errors.phone && <p className="text-xs text-red-500 font-bold mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.form?.country || 'Country'} *</label>
                  <select value={form.country} onChange={e => update('country', e.target.value)} className={`${inputClass('country')} appearance-none`}>
                    {countries.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.enrollment?.preferred_language || 'Preferred Language'}</label>
                  <select value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)} className={`${inputClass('preferredLanguage')} appearance-none`}>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">{t.enrollment?.back || 'Back'}</button>
                <button onClick={handleNext} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all">{t.enrollment?.next || 'Next'}</button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <div className="space-y-4" style={{ animation: 'modalFadeIn 0.25s ease-out' }}>
              <h3 className="text-lg font-black text-slate-900">{t.enrollment?.payment_info || 'Payment Information'}</h3>

              {/* Payment method cards */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.enrollment?.method || 'Payment Method'}</label>
                <div className="space-y-2">
                  {/* Bank Transfer */}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === 'bank_transfer' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.paymentMethod === 'bank_transfer' ? 'border-teal-600' : 'border-slate-300'}`}>
                      {form.paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                    </div>
                    <div className="flex-1" onClick={() => update('paymentMethod', 'bank_transfer')}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="text-sm font-black text-slate-800">{t.enrollment?.bank_transfer || 'Bank Transfer'}</span>
                      </div>
                      {form.paymentMethod === 'bank_transfer' && (
                        <div className="mt-3 bg-white rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                          <p className="font-bold text-slate-800">{t.enrollment?.bank_details || 'Bank Details:'}</p>
                          <p>Bank: National Bank of Egypt (NBE)</p>
                          <p>Account: 1234-5678-9012-3456</p>
                          <p>IBAN: EG38 0019 0005 0000 0000 1234 5678</p>
                          <p>SWIFT: NBEGEGCX</p>
                          <div className="mt-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.enrollment?.transfer_reference || 'Transfer Reference'}</label>
                            <input value={form.paymentReference} onChange={e => update('paymentReference', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-teal-500 outline-none" placeholder="Enter transfer reference..." />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === 'credit_card' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.paymentMethod === 'credit_card' ? 'border-teal-600' : 'border-slate-300'}`}>
                      {form.paymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                    </div>
                    <div className="flex-1" onClick={() => update('paymentMethod', 'credit_card')}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        <span className="text-sm font-black text-slate-800">{t.enrollment?.credit_card || 'Credit Card'}</span>
                      </div>
                      {form.paymentMethod === 'credit_card' && (
                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.enrollment?.card_number || 'Card Number'}</label>
                            <input value={form.cardNumber} onChange={e => update('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-teal-500 outline-none" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.enrollment?.card_expiry || 'Expiry'}</label>
                              <input value={form.cardExpiry} onChange={e => update('cardExpiry', e.target.value.slice(0, 5))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-teal-500 outline-none" placeholder="MM/YY" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">CVV</label>
                              <input value={form.cardCvv} onChange={e => update('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))} type="password" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-teal-500 outline-none" placeholder="***" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Cash */}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.paymentMethod === 'cash' ? 'border-teal-600' : 'border-slate-300'}`}>
                      {form.paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                    </div>
                    <div className="flex-1" onClick={() => update('paymentMethod', 'cash')}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span className="text-sm font-black text-slate-800">{t.enrollment?.cash || 'Cash'}</span>
                      </div>
                      {form.paymentMethod === 'cash' && (
                        <div className="mt-3 bg-white rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                          <p className="font-bold text-slate-800">{t.enrollment?.office_locations || 'Office Locations:'}</p>
                          <p>Cairo: 15 Tahrir St, Downtown, Cairo</p>
                          <p>Riyadh: King Fahd Rd, Al Olaya District</p>
                          <p>Dubai: Business Bay, Executive Tower B</p>
                          <p className="text-[10px] text-slate-400 mt-1">Office hours: Sun-Thu, 9AM-5PM</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Promo / Discount Code */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.enrollment?.discount_code || 'Promo / Discount Code'}</label>
                <div className="flex gap-2">
                  <input value={form.discountCode} onChange={e => { update('discountCode', e.target.value); if (discountApplied) { setDiscountApplied(false); setDiscountAmount(0); } }} className={`flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-teal-500 outline-none ${discountApplied ? 'border-green-300 bg-green-50' : ''}`} placeholder="Enter code..." disabled={discountApplied} />
                  {discountApplied ? (
                    <button onClick={() => { setDiscountApplied(false); setDiscountAmount(0); update('discountCode', ''); }} className="px-4 py-2.5 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
                      {t.enrollment?.remove || 'Remove'}
                    </button>
                  ) : (
                    <button onClick={handleApplyDiscount} className="px-4 py-2.5 text-sm font-bold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50">
                      {t.enrollment?.apply || 'Apply'}
                    </button>
                  )}
                </div>
              </div>

              {/* Installment Plan */}
              {totalDue >= 1000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={installmentPlan}
                      onChange={e => setInstallmentPlan(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm font-bold text-slate-800">{t.dashboard?.enable_installments || 'Pay in installments'}</span>
                  </label>
                  {installmentPlan && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-600">{t.dashboard?.num_installments || 'Number of installments'}:</label>
                      <select
                        value={installmentCount}
                        onChange={e => setInstallmentCount(Number(e.target.value))}
                        className="bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:border-teal-500 outline-none"
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={6}>6</option>
                      </select>
                      <span className="text-xs text-slate-500">
                        ({Math.round((totalDue / installmentCount) * 100) / 100} {course.currency}/{t.dashboard?.installment_amount || 'each'})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t.enrollment?.notes || 'Notes (optional)'}</label>
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)} className={`${inputClass('notes')} resize-none`} rows={2} placeholder={t.enrollment?.notes_placeholder || 'Any special requests...'} />
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.enrollment?.course_price || 'Course Price'}</span>
                  <span className="font-bold text-slate-700">{course.price} {course.currency}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">{t.enrollment?.discount_label || 'Discount'} ({form.discountCode.toUpperCase()})</span>
                    <span className="font-bold text-green-600">-{discountAmount} {course.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-800">{t.enrollment?.total || 'Total Due'}</span>
                  <span className="text-lg font-black text-teal-600">{totalDue} {course.currency}</span>
                </div>
                {installmentPlan && (
                  <div className="flex justify-between text-xs text-blue-600 pt-1">
                    <span>{installmentCount} {t.dashboard?.installments || 'installments'}</span>
                    <span className="font-bold">{Math.round((totalDue / installmentCount) * 100) / 100} {course.currency} / {t.dashboard?.installment_amount || 'each'}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">{t.enrollment?.back || 'Back'}</button>
                <button onClick={handleNext} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all">{t.enrollment?.review || 'Review'}</button>
              </div>
            </div>
          )}

          {/* Step: Review & Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4" style={{ animation: 'modalFadeIn 0.25s ease-out' }}>
              <h3 className="text-lg font-black text-slate-900">{t.enrollment?.confirm_title || 'Review & Confirm'}</h3>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.enrollment?.course_details || 'Course Details'}</p>
                <div className="flex justify-between"><span className="text-slate-500">{t.enrollment?.course_label || 'Course'}</span><span className="font-bold text-slate-900 text-right max-w-[60%] truncate">{course.title}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.enrollment?.instructor_label || 'Instructor'}</span><span className="font-bold text-slate-900">{course.instructor}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.enrollment?.duration || 'Duration'}</span><span className="font-bold text-slate-900">{course.duration}</span></div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.enrollment?.student_details || 'Student Details'}</p>
                <div className="flex justify-between"><span className="text-slate-500">{t.form?.name || 'Name'}</span><span className="font-bold text-slate-900">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.form?.email || 'Email'}</span><span className="font-bold text-slate-900">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.form?.phone || 'Phone'}</span><span className="font-bold text-slate-900">{form.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.form?.country || 'Country'}</span><span className="font-bold text-slate-900">{countries.find(c => c.code === form.country)?.label}</span></div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.enrollment?.payment_summary || 'Payment Summary'}</p>
                <div className="flex justify-between"><span className="text-slate-500">{t.enrollment?.method || 'Method'}</span><span className="font-bold text-slate-900 capitalize">{form.paymentMethod.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">{t.enrollment?.course_price || 'Price'}</span><span className="font-bold text-slate-700">{course.price} {course.currency}</span></div>
                {discountApplied && (
                  <div className="flex justify-between"><span className="text-green-600">{t.enrollment?.discount_label || 'Discount'}</span><span className="font-bold text-green-600">-{discountAmount} {course.currency}</span></div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-800">{t.enrollment?.total || 'Total'}</span><span className="font-black text-teal-600 text-lg">{totalDue} {course.currency}</span></div>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition-all">
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <span className="text-xs text-slate-600 leading-relaxed">
                  {t.enrollment?.terms_text || 'I agree to the Terms & Conditions and understand that my enrollment is subject to confirmation. I acknowledge that payment must be completed within 48 hours to secure my spot.'}
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">{t.enrollment?.back || 'Back'}</button>
                <button onClick={handleSubmit} disabled={loading || !agreedToTerms} className={`flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${agreedToTerms ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? (t.enrollment?.submitting || 'Submitting...') : (t.enrollment?.submit || 'Confirm & Enroll')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
