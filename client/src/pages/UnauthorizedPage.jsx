import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

const UnauthorizedPage = () => {
  const { user } = useSelector((state) => state.auth);

  const getHomePath = () => {
    if (user?.role === 'admin') return '/dashboard/hr';
    if (user?.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Restricted (403)</h1>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          You do not have administrative permissions to view this resource. Role-based access control
          restricts this module to authorized accounts only.
        </p>
        <Link
          to={getHomePath()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
