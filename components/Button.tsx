import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'green';
  size?: 'default' | 'lg';
}

export const Button = ({ children, className, variant = 'default', size = 'default', ...props }: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-offset-black transform hover:-translate-y-px active:translate-y-0";

  const variantClasses = {
    default: `bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] focus-visible:ring-blue-400`,
    outline: `border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-600 text-slate-300 focus-visible:ring-slate-500`,
    green: `bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:bg-green-500 hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] focus-visible:ring-green-400 font-semibold`,
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
