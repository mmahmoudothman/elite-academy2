import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', fullPage }) => {
  const spinner = (
    <div className={`${sizes[size]} border-teal-200 border-t-teal-600 rounded-full animate-spin ${className}`} />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
