import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#0f172a',
        color: '#fff',
        fontWeight: 700,
        fontSize: '14px',
        borderRadius: '12px',
        padding: '12px 16px',
      },
      success: {
        iconTheme: { primary: '#0d9488', secondary: '#fff' },
      },
      error: {
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      },
    }}
  />
);

export default ToastProvider;
