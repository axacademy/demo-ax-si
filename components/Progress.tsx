
import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  colorClass?: string;
}

export const Progress = ({ value, className, indicatorClassName, colorClass = 'bg-blue-600' }: ProgressProps) => {
  const progressValue = Math.max(0, Math.min(100, value || 0));

  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-700/50 ${className}`}>
      <div
        className={`h-full w-full flex-1 transition-all duration-500 ${colorClass} ${indicatorClassName}`}
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </div>
  );
};
