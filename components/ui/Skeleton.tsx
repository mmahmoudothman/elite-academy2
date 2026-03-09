import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <Skeleton className="aspect-[16/9] rounded-none" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between pt-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className={`h-4 ${i === 0 ? 'w-10 h-10 rounded-full' : 'w-full'}`} />
      </td>
    ))}
  </tr>
);

export const StatSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100">
    <Skeleton className="w-12 h-12 rounded-xl mb-4" />
    <Skeleton className="h-8 w-20 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-6">
    <div className="max-w-3xl w-full text-center space-y-6">
      <Skeleton className="h-6 w-48 mx-auto rounded-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-5 w-2/3 mx-auto" />
      <div className="flex justify-center gap-4 pt-4">
        <Skeleton className="h-14 w-40 rounded-2xl" />
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
    </div>
  </div>
);

export const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
    <Skeleton className="aspect-[16/9] rounded-none" />
    <div className="p-5 sm:p-6 lg:p-8 space-y-4">
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export default Skeleton;
