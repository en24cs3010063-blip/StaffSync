import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Send,
  Trash2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import api from '../services/api';

const LeaveManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const isManagerOrHR = user?.role === 'manager' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState(isManagerOrHR ? 'review' : 'myLeaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [reviewLeaves, setReviewLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Apply Leave Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Reject Modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/api/leaves/my-leaves');
      setMyLeaves(res.data.data || []);
      setBalances(res.data.balances || {});
    } catch (err) {
      console.error('Failed to load my leaves:', err);
    }
  };

  const fetchReviewLeaves = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/api/leaves', { params });
      setReviewLeaves(res.data.data || []);
    } catch (err) {
      console.error('Failed to load leaves for review:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchMyLeaves(), isManagerOrHR ? fetchReviewLeaves() : Promise.resolve()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [statusFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError(null);

    try {
      await api.post('/api/leaves', applyForm);
      setIsApplyOpen(false);
      setApplyForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
      loadAll();
      alert('Leave application submitted successfully!');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleReviewAction = async (leaveId, status) => {
    if (status === 'Rejected') {
      setRejectingId(leaveId);
      setRejectionReason('');
      setIsRejectOpen(true);
      return;
    }

    try {
      await api.patch(`/api/leaves/${leaveId}/review`, { status });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave request');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      await api.patch(`/api/leaves/${rejectingId}/review`, {
        status: 'Rejected',
        rejectionReason,
      });
      setIsRejectOpen(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancelMyLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await api.patch(`/api/leaves/${leaveId}/cancel`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for time off, monitor remaining entitlements, and review departmental leave applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isManagerOrHR && (
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Approvals Queue
              </button>
              <button
                onClick={() => setActiveTab('myLeaves')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'myLeaves' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                My Leaves
              </button>
            </div>
          )}

          <button
            onClick={() => setIsApplyOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white shadow-md shadow-brand-600/20 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Entitlement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Annual Paid Leave</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {(balances.annual?.total || 18) - (balances.annual?.used || 0)}{' '}
              <span className="text-xs font-normal text-slate-400">available</span>
            </span>
            <span className="text-xs text-slate-400">Total: {balances.annual?.total || 18} days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-brand-600 h-1.5 rounded-full"
              style={{
                width: `${(((balances.annual?.total || 18) - (balances.annual?.used || 0)) / (balances.annual?.total || 18)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Sick Leave</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {(balances.sick?.total || 10) - (balances.sick?.used || 0)}{' '}
              <span className="text-xs font-normal text-slate-400">available</span>
            </span>
            <span className="text-xs text-slate-400">Total: {balances.sick?.total || 10} days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{
                width: `${(((balances.sick?.total || 10) - (balances.sick?.used || 0)) / (balances.sick?.total || 10)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Casual Leave</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {(balances.casual?.total || 8) - (balances.casual?.used || 0)}{' '}
              <span className="text-xs font-normal text-slate-400">available</span>
            </span>
            <span className="text-xs text-slate-400">Total: {balances.casual?.total || 8} days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-amber-600 h-1.5 rounded-full"
              style={{
                width: `${(((balances.casual?.total || 8) - (balances.casual?.used || 0)) / (balances.casual?.total || 8)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab: Approvals Queue (Manager & HR) */}
      {isManagerOrHR && activeTab === 'review' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Team Requests for Review</h3>
              <p className="text-xs text-slate-500">Approve or reject leave requests with feedback notes</p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Applicant</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Days</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviewLeaves.length > 0 ? (
                  reviewLeaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{l.user?.name}</td>
                      <td className="py-3 px-3 text-slate-600">{l.employee?.department?.name || 'General'}</td>
                      <td className="py-3 px-3 capitalize font-medium text-slate-700">{l.leaveType}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{l.days}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="py-3 px-3">
                        <Badge>{l.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReviewAction(l._id, 'Approved')}
                              className="px-2.5 py-1 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReviewAction(l._id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {l.reviewedBy ? `Reviewed by ${l.reviewedBy.name?.split(' ')[0]}` : 'Decided'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No leave requests found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: My Personal Leaves */}
      {(!isManagerOrHR || activeTab === 'myLeaves') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">My Leave Applications History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Leave Type</th>
                  <th className="py-3 px-3">Date Range</th>
                  <th className="py-3 px-3">Days</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Review Remarks</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.length > 0 ? (
                  myLeaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 capitalize">{l.leaveType}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{l.days} days</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                      <td className="py-3 px-3">
                        <Badge>{l.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                        {l.rejectionReason || (l.status === 'Approved' ? 'Approved by manager' : 'Pending review')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {l.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelMyLeave(l._id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No leave requests filed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Submit Leave Request">
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          {applyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Leave Classification *</label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="annual">Annual / Vacation Leave (Available: {(balances.annual?.total || 18) - (balances.annual?.used || 0)} days)</option>
              <option value="sick">Sick Leave (Available: {(balances.sick?.total || 10) - (balances.sick?.used || 0)} days)</option>
              <option value="casual">Casual Leave (Available: {(balances.casual?.total || 8) - (balances.casual?.used || 0)} days)</option>
              <option value="maternityPaternity">Maternity / Paternity Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason *</label>
            <textarea
              required
              rows={3}
              placeholder="State the objective for this leave..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyLoading}
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{applyLoading ? 'Submitting...' : 'Apply'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Decline Leave Request">
        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Please specify why this leave request is being declined so the applicant receives proper context.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Project critical launch window conflict..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
