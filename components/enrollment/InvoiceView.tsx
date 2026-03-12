import React from 'react';
import { Enrollment } from '../../types';
import { useLanguage } from '../LanguageContext';

interface InvoiceViewProps {
  enrollment: Enrollment;
  isModal?: boolean;
  onClose?: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ enrollment, isModal = false, onClose }) => {
  const { t } = useLanguage();
  const handlePrint = () => {
    window.print();
  };

  const invoiceContent = (
    <div className="invoice-content max-w-2xl mx-auto bg-white p-8 sm:p-12">
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-content, .invoice-content * { visibility: visible; }
          .invoice-content { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
          .print-border { border: 1px solid #e2e8f0; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ELITE ACADEMY</h1>
          <p className="text-xs text-slate-400 font-bold mt-1">{t.invoice?.tagline || 'Excellence in Executive Education'}</p>
        </div>
        <div className="text-end">
          <p className="text-lg font-black text-slate-900">{t.invoice?.invoice_title || 'INVOICE'}</p>
          <p className="text-sm font-mono text-[#0da993] font-bold">{enrollment.invoiceNumber || 'N/A'}</p>
          <p className="text-xs text-slate-400 mt-1">{new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Student & Course Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.invoice?.bill_to || 'Bill To'}</p>
          <p className="text-sm font-bold text-slate-900">{enrollment.studentName}</p>
          <p className="text-xs text-slate-500">{enrollment.studentEmail}</p>
          {enrollment.studentPhone && <p className="text-xs text-slate-500">{enrollment.studentPhone}</p>}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.invoice?.course_details || 'Course Details'}</p>
          <p className="text-sm font-bold text-slate-900">{enrollment.courseTitle}</p>
          <p className="text-xs text-slate-500">{t.invoice?.enrollment_date || 'Enrollment Date'}: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-start py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.invoice?.description || 'Description'}</th>
              <th className="text-end py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.invoice?.amount || 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-4">
                <p className="text-sm font-bold text-slate-900">{enrollment.courseTitle}</p>
                <p className="text-xs text-slate-400">{t.invoice?.course_enrollment || 'Course Enrollment'}</p>
              </td>
              <td className="py-4 text-end text-sm font-bold text-slate-900">
                {enrollment.discountCode
                  ? ((enrollment.paymentAmount + (enrollment.discountAmount || 0)).toLocaleString())
                  : enrollment.paymentAmount.toLocaleString()
                } {enrollment.paymentCurrency}
              </td>
            </tr>
            {enrollment.discountCode && enrollment.discountAmount && (
              <tr className="border-b border-slate-100">
                <td className="py-3">
                  <p className="text-sm text-green-600">{t.invoice?.discount || 'Discount'} ({enrollment.discountCode})</p>
                </td>
                <td className="py-3 text-end text-sm font-bold text-green-600">
                  -{enrollment.discountAmount.toLocaleString()} {enrollment.paymentCurrency}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900">
              <td className="py-4 text-sm font-black text-slate-900">{t.invoice?.total_due || 'Total Due'}</td>
              <td className="py-4 text-end text-lg font-black text-slate-900">
                {enrollment.paymentAmount.toLocaleString()} {enrollment.paymentCurrency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.invoice?.payment_status || 'Payment Status'}</p>
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
            enrollment.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
            enrollment.paymentStatus === 'refunded' ? 'bg-red-50 text-red-500' :
            'bg-amber-50 text-amber-600'
          }`}>
            {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.invoice?.payment_method || 'Payment Method'}</p>
          <p className="text-sm text-slate-700 capitalize">{(enrollment.paymentMethod || 'N/A').replace(/_/g, ' ')}</p>
          {enrollment.paymentReference && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: {enrollment.paymentReference}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-500">Elite Academy</p>
        <p>15 Tahrir St, Downtown, Cairo, Egypt</p>
        <p>info@eliteacademy.com | +20 2 1234 5678</p>
        <p className="mt-3 text-[10px]">{t.invoice?.thank_you || 'Thank you for choosing Elite Academy. This invoice was generated electronically and is valid without a signature.'}</p>
      </div>

      {/* Print button */}
      <div className="no-print mt-8 flex justify-center">
        <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {t.invoice?.print || 'Print Invoice'}
        </button>
      </div>
    </div>
  );

  if (!isModal) return invoiceContent;

  return (
    <div className="fixed inset-0 z-[170] overflow-y-auto" style={{ animation: 'modalFadeIn 0.3s ease-out' }} onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative min-h-full flex items-start justify-center p-4">
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl my-8" style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
          {/* Close button */}
          <button onClick={onClose} className="no-print absolute top-4 end-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {invoiceContent}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
