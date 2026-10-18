import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  TrendingUp,
  Building,
  PlusCircle,
  Bell,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const HRDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/admin');
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch HR dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickReviewLeave = async (leaveId, status) => {
    try {
      await api.patch(`/api/leaves/${leaveId}/review`, {
        status,
        rejectionReason: status === 'Rejected' ? 'Reviewed and rejected by HR administration.' : undefined,
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave request');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { stats, departmentStats, attendanceTrend, recentLeaves, recentEmployees } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-brand-900/10">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
            HR & Administration Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Administrator'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time workforce intelligence, employee attendance rates, and pending approval workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/employees"
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Employees</span>
          </Link>
          <Link
            to="/announcements"
            className="px-4 py-2.5 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-xs border border-brand-500/40 transition-all flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Post Notice</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workforce"
          value={stats?.totalEmployees || 0}
          subtitle={`${stats?.activeEmployees || 0} Active Staff`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle={`${stats?.attendanceRateToday || 0}% Daily Turnout`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentToday || 0}
          subtitle="Not checked in today"
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          subtitle="Requires attention"
          icon={CalendarDays}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">7-Day Attendance Trend</h3>
              <p className="text-xs text-slate-500">Employee presence over the past week</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Live Feed
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Present Staff"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#presentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Headcount Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Department Distribution</h3>
              <p className="text-xs text-slate-500">Staff allocation across business divisions</p>
            </div>
            <Link to="/employees" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
              View all
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Staff Count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Tables Section: Pending Leaves & Recent Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leaves Requiring Review */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending Leave Requests</h3>
              <p className="text-xs text-slate-500">Applications awaiting managerial or HR sign-off</p>
            </div>
            <Link
              to="/leaves"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLeaves && recentLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {leave.user?.avatar ? (
                            <img
                              src={leave.user.avatar}
                              alt={leave.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            leave.user?.name?.slice(0, 2).toUpperCase() || 'EM'
                          )}
                        </div>
                        <span className="truncate max-w-[120px]">{leave.user?.name || 'Staff Member'}</span>
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-600">{leave.leaveType}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {leave.days} day(s)
                        <span className="block text-[10px] text-slate-400">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge>{leave.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickReviewLeave(leave._id, 'Approved')}
                              title="Approve"
                              className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleQuickReviewLeave(leave._id, 'Rejected')}
                              title="Reject"
                              className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No leave requests currently pending.
            </div>
          )}
        </div>

        {/* Quick Operations Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Administrative Shortcuts</h3>
            <p className="text-xs text-slate-500 mb-5">Rapid workflow triggers for HR operations</p>

            <div className="space-y-3">
              <Link
                to="/employees"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700">Add New Employee</p>
                    <p className="text-[10px] text-slate-500">Create login and profile</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/announcements"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700">Publish Notice</p>
                    <p className="text-[10px] text-slate-500">Broadcast to all teams</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/reports"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700">Export HR Reports</p>
                    <p className="text-[10px] text-slate-500">CSV & monthly logs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Logged in as <strong className="text-slate-700">{user?.email}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
