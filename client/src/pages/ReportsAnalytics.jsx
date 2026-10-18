import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import api from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/analytics/admin');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    // Generate CSV content
    const headers = ['Category', 'Metric', 'Value'];
    const rows = [
      ['Workforce', 'Total Employees', data.stats?.totalEmployees || 0],
      ['Workforce', 'Active Staff', data.stats?.activeEmployees || 0],
      ['Workforce', 'Total Managers', data.stats?.totalManagers || 0],
      ['Attendance', 'Present Today', data.stats?.presentToday || 0],
      ['Attendance', 'Absent Today', data.stats?.absentToday || 0],
      ['Attendance', 'Attendance Rate Today (%)', `${data.stats?.attendanceRateToday || 0}%`],
      ['Leaves', 'Pending Leaves', data.stats?.pendingLeaves || 0],
      ['Leaves', 'Approved Leaves', data.leaveStats?.approved || 0],
      ['Leaves', 'Rejected Leaves', data.leaveStats?.rejected || 0],
    ];

    if (data.departmentStats) {
      data.departmentStats.forEach((d) => {
        rows.push(['Department Headcount', `${d.name} (${d.code})`, d.count]);
      });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => `"${e.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staffsync-hrms-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, departmentStats, attendanceTrend, leaveStats } = data || {};

  const leavePieData = [
    { name: 'Approved', value: leaveStats?.approved || 0 },
    { name: 'Pending', value: leaveStats?.pending || 0 },
    { name: 'Rejected', value: leaveStats?.rejected || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & HR Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual analytics across staff attendance, department allocations, and leave trends.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={stats?.totalEmployees || 0}
          subtitle="All registered staff"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Daily Attendance Rate"
          value={`${stats?.attendanceRateToday || 0}%`}
          subtitle="Turnout today"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Approved Leaves"
          value={leaveStats?.approved || 0}
          subtitle="Granted applications"
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingLeaves || 0}
          subtitle="Awaiting action"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Area Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Weekly Attendance Trend</h3>
          <p className="text-xs text-slate-500 mb-4">Historical daily attendance counts over past 7 days</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Employees Present"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Department Headcount Ratio</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of employees by operating department</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Staff Count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {departmentStats?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV Export & Audit Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Operational Metric Summary</h3>
            <p className="text-xs text-slate-500">Structured data breakdown ready for audit and report filing</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Metric Name</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Workforce Size</td>
                <td className="py-2.5 px-3 text-slate-600">Total Active Employees</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{stats?.activeEmployees || 0}</td>
                <td className="py-2.5 px-3"><span className="text-emerald-600 font-medium">Optimal</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Attendance</td>
                <td className="py-2.5 px-3 text-slate-600">Daily Presence Rate</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{stats?.attendanceRateToday || 0}%</td>
                <td className="py-2.5 px-3"><span className="text-emerald-600 font-medium">Tracked</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Leave Compliance</td>
                <td className="py-2.5 px-3 text-slate-600">Pending Reviews</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{stats?.pendingLeaves || 0}</td>
                <td className="py-2.5 px-3"><span className="text-amber-600 font-medium">Review Needed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
