import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Sparkles,
  Send,
  Building,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import api from '../services/api';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchNote, setPunchNote] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMessage, setPunchMessage] = useState(null);

  // Apply Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [leaveSubmitLoading, setLeaveSubmitLoading] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/employee');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setPunchLoading(true);
      setPunchMessage(null);
      const res = await api.post('/api/attendance/check-in', { note: punchNote });
      setPunchMessage({ success: true, text: res.data.message });
      setPunchNote('');
      fetchDashboardData();
    } catch (err) {
      setPunchMessage({
        success: false,
        text: err.response?.data?.message || 'Failed to check in',
      });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setPunchLoading(true);
      setPunchMessage(null);
      const res = await api.post('/api/attendance/check-out', { note: punchNote });
      setPunchMessage({ success: true, text: res.data.message });
      setPunchNote('');
      fetchDashboardData();
    } catch (err) {
      setPunchMessage({
        success: false,
        text: err.response?.data?.message || 'Failed to check out',
      });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveSubmitLoading(true);
    setLeaveError(null);

    try {
      await api.post('/api/leaves', leaveForm);
      setIsLeaveModalOpen(false);
      setLeaveForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
      fetchDashboardData();
      alert('Leave application submitted successfully!');
    } catch (err) {
      setLeaveError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLeaveSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { employee, todayAttendance, stats, recentAttendance, recentLeaves } = analytics || {};
  const leaveBalances = employee?.leaveBalances || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-brand-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-800/80 text-white font-bold text-xl flex items-center justify-center ring-4 ring-white/10 overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase() || 'EM'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                {employee?.employeeId || 'EMP-1003'}
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              {employee?.designation} • {employee?.department?.name || 'Engineering'}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Reporting to: {employee?.manager?.name || 'Marcus Sterling'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
          <Link
            to="/training"
            className="px-4 py-2.5 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-xs border border-brand-500/30 transition-all flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>My Courses</span>
          </Link>
        </div>
      </div>

      {/* Attendance Clock In/Out Console */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Today's Attendance Station</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Server-synchronized timestamp: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Status Display & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {punchMessage && (
              <span
                className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                  punchMessage.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {punchMessage.text}
              </span>
            )}

            {!todayAttendance ? (
              // Not checked in yet
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional check-in note..."
                  value={punchNote}
                  onChange={(e) => setPunchNote(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleCheckIn}
                  disabled={punchLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clock In</span>
                </button>
              </div>
            ) : !todayAttendance.checkOut ? (
              // Checked in, currently working
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">
                    ● Currently On Shift
                  </span>
                  <span className="text-xs text-slate-500">
                    In at {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={handleCheckOut}
                  disabled={punchLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              </div>
            ) : (
              // Shift completed today
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Shift Finished: <strong>{todayAttendance.workHours} hrs</strong> (
                  {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Remaining Leave Balances</h3>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            Apply now
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Annual / Paid Leave</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">
                {(leaveBalances.annual?.total || 18) - (leaveBalances.annual?.used || 0)}{' '}
                <span className="text-xs font-normal text-slate-400">days left</span>
              </span>
              <span className="text-xs text-slate-400">
                Used: {leaveBalances.annual?.used || 0} / {leaveBalances.annual?.total || 18}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div
                className="bg-brand-600 h-1.5 rounded-full"
                style={{
                  width: `${(((leaveBalances.annual?.total || 18) - (leaveBalances.annual?.used || 0)) / (leaveBalances.annual?.total || 18)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Sick Leave</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">
                {(leaveBalances.sick?.total || 10) - (leaveBalances.sick?.used || 0)}{' '}
                <span className="text-xs font-normal text-slate-400">days left</span>
              </span>
              <span className="text-xs text-slate-400">
                Used: {leaveBalances.sick?.used || 0} / {leaveBalances.sick?.total || 10}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{
                  width: `${(((leaveBalances.sick?.total || 10) - (leaveBalances.sick?.used || 0)) / (leaveBalances.sick?.total || 10)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Casual Leave</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">
                {(leaveBalances.casual?.total || 8) - (leaveBalances.casual?.used || 0)}{' '}
                <span className="text-xs font-normal text-slate-400">days left</span>
              </span>
              <span className="text-xs text-slate-400">
                Used: {leaveBalances.casual?.used || 0} / {leaveBalances.casual?.total || 8}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div
                className="bg-amber-600 h-1.5 rounded-full"
                style={{
                  width: `${(((leaveBalances.casual?.total || 8) - (leaveBalances.casual?.used || 0)) / (leaveBalances.casual?.total || 8)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Attendance History & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Log */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Attendance Records</h3>
              <p className="text-xs text-slate-500">Your logged work days & hours</p>
            </div>
            <Link to="/attendance" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check-In</th>
                  <th className="py-2.5 px-3">Check-Out</th>
                  <th className="py-2.5 px-3">Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttendance && recentAttendance.length > 0 ? (
                  recentAttendance.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.date}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In progress'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.workHours || '—'} hrs</td>
                      <td className="py-2.5 px-3">
                        <Badge>{item.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No attendance logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Applications Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">My Leave Applications</h3>
              <p className="text-xs text-slate-500">Track request status and manager remarks</p>
            </div>
            <Link to="/leaves" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>All requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeaves && recentLeaves.length > 0 ? (
              recentLeaves.map((l) => (
                <div key={l._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {l.leaveType} Leave ({l.days} days)
                    </span>
                    <Badge>{l.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">"{l.reason}"</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <span>
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </span>
                    {l.rejectionReason && (
                      <span className="text-rose-600 font-medium truncate max-w-[150px]">
                        Note: {l.rejectionReason}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No leave requests filed recently.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Leave"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          {leaveError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{leaveError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Leave Type
            </label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="annual">Annual / Paid Leave ({leaveBalances.annual?.total - leaveBalances.annual?.used} days available)</option>
              <option value="sick">Sick Leave ({leaveBalances.sick?.total - leaveBalances.sick?.used} days available)</option>
              <option value="casual">Casual Leave ({leaveBalances.casual?.total - leaveBalances.casual?.used} days available)</option>
              <option value="maternityPaternity">Maternity / Paternity Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Leave *
            </label>
            <textarea
              required
              rows={3}
              placeholder="State the objective or reason for your leave request..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={leaveSubmitLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{leaveSubmitLoading ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
