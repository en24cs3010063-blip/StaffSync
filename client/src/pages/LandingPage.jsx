import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Staff<span className="text-brand-400">Sync</span>
              </span>
              <span className="text-[10px] block font-medium uppercase tracking-wider text-slate-400">
                Enterprise HR Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-brand-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Production-Grade MERN Architecture with Role-Based Access</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
            Simplify Human Resources.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300">
              Empower Every Team.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            StaffSync is a unified, full-stack Human Resource Management System engineered with MongoDB,
            Express, React, and Node.js. Featuring dedicated workspaces for HR Executives, Team Managers,
            and Employees with automated attendance, leave approvals, and talent analytics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-white shadow-xl shadow-brand-600/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Open Evaluation Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#roles"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              View System Roles
            </a>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="mt-12 p-4 max-w-2xl mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Preloaded Demo Credentials (1-Click Login in App)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-indigo-300 block">HR / Admin</span>
                <span className="text-slate-400 block truncate">hr@staffsync.demo</span>
                <span className="text-slate-500 text-[10px]">Demo@12345</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-purple-300 block">Manager</span>
                <span className="text-slate-400 block truncate">manager@staffsync.demo</span>
                <span className="text-slate-500 text-[10px]">Demo@12345</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-emerald-300 block">Employee</span>
                <span className="text-slate-400 block truncate">employee@staffsync.demo</span>
                <span className="text-slate-500 text-[10px]">Demo@12345</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered For Modern Workforce Operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Attendance & Clock-In</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Daily digital check-in and check-out with automatic duration calculation, duplicate
                check-in prevention, and server-side timezone synchronization.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Leave Workflow & Balances</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Employees request annual, sick, or casual leaves with balance auto-deduction, overlap validation,
                manager approval queues, and rejection reason tracking.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Employee Directory & Org Chart</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Centralized talent repository with department tagging, managerial reporting chains,
                status toggles, and full profile inspection.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Training & Skill Development</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Assign upskilling programs, provide curriculum resource links, monitor completion percentages,
                and collect employee course feedback.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interactive Analytics & Reports</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time visual dashboards with Recharts for 7-day attendance trends, department headcounts,
                leave status distributions, and CSV exports.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">JWT Security & Role Gates</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Role-based routing, bcrypt hashed passwords, protected REST endpoints, and granular
                access control ensuring data segregation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workspaces Section */}
      <section id="roles" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Target Experiences</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Three Distinct Roles. Tailored Workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* HR Card */}
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-indigo-500/30 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Role 1</span>
            <h3 className="text-2xl font-bold text-white mb-4">HR / Administrator</h3>
            <p className="text-slate-300 text-sm mb-6 flex-1">
              Complete oversight over the entire organization. Manage employees, create departments, review all leaves, publish company notices, and analyze trends.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Org-wide dashboard statistics</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Add, edit & deactivate employees</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Create & assign departments</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Export CSV analytics reports</li>
            </ul>
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors"
            >
              Sign In as HR Director
            </Link>
          </div>

          {/* Manager Card */}
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-purple-500/30 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Role 2</span>
            <h3 className="text-2xl font-bold text-white mb-4">Team Manager</h3>
            <p className="text-slate-300 text-sm mb-6 flex-1">
              Direct visibility into assigned team members. Review attendance reports, approve or reject leave requests with custom comments, and assign training.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Team roster & real-time presence</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Approve / Reject leave requests</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Assign skill training programs</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Monitor team completion rates</li>
            </ul>
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs text-white transition-colors"
            >
              Sign In as Manager
            </Link>
          </div>

          {/* Employee Card */}
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-emerald-500/30 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Role 3</span>
            <h3 className="text-2xl font-bold text-white mb-4">Employee</h3>
            <p className="text-slate-300 text-sm mb-6 flex-1">
              Personalized employee portal. Record daily attendance, check remaining leave balances, submit leave applications, access trainings, and view announcements.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Daily check-in & check-out punch</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Apply for leave & check balances</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Track assigned training modules</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Company news & announcements</li>
            </ul>
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-colors"
            >
              Sign In as Employee
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-400">
        <p>© 2026 StaffSync HRMS. Engineered with MongoDB, Express, React, and Node.js.</p>
        <p className="mt-1 text-slate-500">College Major Project Demonstration & Submission</p>
      </footer>
    </div>
  );
};

export default LandingPage;
