import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  // Automatic variant mapping based on common status terms
  let resolvedVariant = variant;
  if (typeof children === 'string') {
    const text = children.toLowerCase();
    if (['present', 'active', 'approved', 'completed'].includes(text)) resolvedVariant = 'success';
    else if (['pending', 'in progress', 'half-day', 'probation'].includes(text)) resolvedVariant = 'warning';
    else if (['absent', 'rejected', 'terminated', 'cancelled', 'critical'].includes(text)) resolvedVariant = 'danger';
    else if (['high', 'manager'].includes(text)) resolvedVariant = 'purple';
    else if (['admin'].includes(text)) resolvedVariant = 'primary';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variantStyles[resolvedVariant] || variantStyles.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
