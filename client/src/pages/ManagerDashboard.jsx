import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import api from '../services/api';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/manager');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleApprove = async (leaveId) => {
    try {
      await api.patch(`/api/leaves/${leaveId}/review`, { status: 'Approved' });
      fetchManagerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave request');
    }
  };

  const handleOpenReject = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      await api.patch(`/api/leaves/${selectedLeaveId}/review`, {
        status: 'Rejected',
        rejectionReason,
      });
      setRejectModalOpen(false);
      fetchManagerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, teamMembers, pendingLeaves } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-purple-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Team Manager Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Hello, {user?.name?.split(' ')[0] || 'Manager'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Monitor direct reports, review leave applications, and supervise departmental training progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/training"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-sm flex items-center gap-2 transition-all hover:scale-105"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Assign Training</span>
          </Link>
          <Link
            to="/attendance"
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Team Attendance</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Team Strength"
          value={stats?.totalTeamMembers || 0}
          subtitle="Direct reports & assigned staff"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          subtitle={`${stats?.teamAttendanceRate || 0}% active today`}
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Absent / Not Checked In"
          value={stats?.absentToday || 0}
          subtitle="Awaiting check-in"
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingLeaves || 0}
          subtitle="Requires your review"
          icon={CalendarDays}
          color="amber"
        />
      </div>

      {/* Main Grid: Pending Approvals & Team Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Team Leave Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending Leave Requests</h3>
              <p className="text-xs text-slate-500">Requires your approval or rejection</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              {pendingLeaves?.length || 0} Pending
            </span>
          </div>

          {pendingLeaves && pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
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
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{leave.user?.name}</h4>
                        <span className="text-[11px] text-slate-500 capitalize">
                          {leave.leaveType} Leave • {leave.days} day(s)
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                    "{leave.reason}"
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Dates: {new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReject(leave._id)}
                        className="px-3 py-1 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(leave._id)}
                        className="px-3 py-1 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              All team leave requests are currently cleared!
            </div>
          )}
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">My Team Roster</h3>
              <p className="text-xs text-slate-500">Employees under your managerial oversight</p>
            </div>
            <Link
              to="/employees"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Full directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {teamMembers && teamMembers.length > 0 ? (
              teamMembers.map((emp) => (
                <div key={emp._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden">
                      {emp.user?.avatar ? (
                        <img
                          src={emp.user.avatar}
                          alt={emp.user?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        emp.user?.name?.slice(0, 2).toUpperCase() || 'EM'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{emp.user?.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {emp.designation} • {emp.employeeId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={emp.status === 'Active' ? 'success' : 'default'}>
                      {emp.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No team members assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal with Reason requirement */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Leave Request"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Please state why this leave request is being declined. The reason will be sent in an
              in-app notification to the employee.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Conflict with scheduled sprint deadline; please reschedule for following week."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
