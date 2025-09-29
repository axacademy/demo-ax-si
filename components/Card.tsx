import React from 'react';

const CARD_CLASSES = "bg-slate-900/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl shadow-black/30";

// FIX: Update Card props to accept all standard div element props, including `style`, to allow for animations and other attributes.
export const Card = ({ children, className, ...props }: React.ComponentProps<'div'>) => (
  <div className={`${CARD_CLASSES} ${className || ''}`} {...props}>
    {children}
  </div>
);

// FIX: Update CardHeader props to accept all standard div element props. This makes children optional and resolves type errors.
export const CardHeader = ({ children, className, ...props }: React.ComponentProps<'div'>) => (
  <div className={`p-6 border-b border-slate-800 ${className || ''}`} {...props}>
    {children}
  </div>
);

// FIX: Update CardTitle props to accept all standard h3 element props. This makes children optional and resolves type errors.
export const CardTitle = ({ children, className, ...props }: React.ComponentProps<'h3'>) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-slate-100 ${className || ''}`} {...props}>
    {children}
  </h3>
);

// FIX: Update CardContent props to accept all standard div element props, which allows passing `dangerouslySetInnerHTML`.
export const CardContent = ({ children, className, ...props }: React.ComponentProps<'div'>) => (
  <div className={`p-6 ${className || ''}`} {...props}>
    {children}
  </div>
);