
import React from 'react';

// FIX: Update IconProps to accept all standard SVG element props. This allows passing attributes like x, y, width, and height.
type IconProps = React.SVGProps<SVGSVGElement>;

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Brain = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 5a3 3 0 1 0-5.993.129 4 4 0 0 0-3.52 3.52A4 4 0 0 0 5 12.5a3 3 0 0 0 5.993-.129 4 4 0 0 0 3.52-3.52A4 4 0 0 0 12 5Z" /><path d="M12 5a3 3 0 1 1 5.993.129 4 4 0 0 1 3.52 3.52A4 4 0 0 1 19 12.5a3 3 0 0 1-5.993-.129 4 4 0 0 1-3.52-3.52A4 4 0 0 1 12 5Z" /><path d="M5 12.5a4 4 0 0 0-2.48 3.52A3 3 0 0 0 5 20a4 4 0 0 0 3.52-2.48A4 4 0 0 0 5 14a3 3 0 0 0 0-1.5" /><path d="M19 12.5a4 4 0 0 1 2.48 3.52A3 3 0 0 1 19 20a4 4 0 0 1-3.52-2.48A4 4 0 0 1 19 14a3 3 0 0 1 0-1.5" /><path d="M12 20a3 3 0 0 0 5.993-.129A4 4 0 0 0 21.5 16a4 4 0 0 0-2.48-3.52" /><path d="M12 20a3 3 0 0 1-5.993-.129A4 4 0 0 1 2.5 16a4 4 0 0 1 2.48-3.52" /><path d="M12 5V2" /><path d="M12 22v-2" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const BarChart3 = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 3v18h18" /><path d="M7 16V7" /><path d="M12 16v-4" /><path d="M17 16v-7" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Users = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Shield = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Wrench = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Trophy = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const RotateCcw = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const FileText = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const ChevronLeft = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const ChevronRight = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// FIX: Update component signature to accept and spread additional props to the SVG element.
export const Download = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const AiIcon = ({ className, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M12 8v8" />
    <path d="m12 16-4-3" />
    <path d="m12 16 4-3" />
  </svg>
);
