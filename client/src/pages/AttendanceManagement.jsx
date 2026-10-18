import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Users,
  Building,
  TrendingUp,
} from 'lucide-react';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import api from '../services/api';

const AttendanceManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const isManagerOrHR = user?.role === 'manager' || user?.role === 'admin';
  const isHR = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'team' | 'org'
  const [personalData, setPersonalData] = useState({ summary: {}, data: [] });
  const [teamData, setTeamData] = useState([]);
  const [orgData, setOrgData] = useState({ summary: {}, data: [] });
  const [loading, setLoading] = useState(true);

  // Month filter for personal logs
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Punch in/out state
  const [todayStatus, setTodayStatus] = useState(null);
  const [punchNote, setPunchNote] = useState('');
  const [punchMsg, setPunchMsg] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/api/attendance/today');
      setTodayStatus(res.data.data);
    } catch (err) {
      console.error('Failed to get today status:', err);
    }
  };

  const fetchPersonalAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/my-history', {
        params: { month: selectedMonth, year: selectedYear },
      });
      setPersonalData(res.data);
    } catch (err) {
      console.error('Failed to load my attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/team');
      setTeamData(res.data.data || []);
    } catch (err) {
      console.error('Failed to load team attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/organization');
      setOrgData(res.data);
    } catch (err) {
      console.error('Failed to load organization attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'personal') {
      fetchPersonalAttendance();
    } else if (activeTab === 'team') {
      fetchTeamAttendance();
    } else if (activeTab === 'org') {
      fetchOrgAttendance();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const handleCheckIn = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg(null);
      const res = await api.post('/api/attendance/check-in', { note: punchNote });
      setPunchMsg({ success: true, text: res.data.message });
      setPunchNote('');
      fetchTodayStatus();
      if (activeTab === 'personal') fetchPersonalAttendance();
    } catch (err) {
      setPunchMsg({ success: false, text: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg(null);
      const res = await api.post('/api/attendance/check-out', { note: punchNote });
      setPunchMsg({ success: true, text: res.data.message });
      setPunchNote('');
      fetchTodayStatus();
      if (activeTab === 'personal') fetchPersonalAttendance();
    } catch (err) {
      setPunchMsg({ success: false, text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily working hours, manage timestamps, and inspect organizational attendance records.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Log
          </button>
          {isManagerOrHR && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Team Roster
            </button>
          )}
          {isHR && (
            <button
              onClick={() => setActiveTab('org')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'org' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Org Overview
            </button>
          )}
        </div>
      </div>

      {/* Daily Digital Punch Console Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Digital Timecard</h3>
              <p className="text-xs text-slate-500">
                System Time: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {punchMsg && (
              <span
                className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                  punchMsg.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {punchMsg.text}
              </span>
            )}

            {!todayStatus ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional check-in note..."
                  value={punchNote}
                  onChange={(e) => setPunchNote(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleCheckIn}
                  disabled={punchLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clock In</span>
                </button>
              </div>
            ) : !todayStatus.checkOut ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">On Shift</span>
                  <span className="text-xs text-slate-500 block">
                    In at {new Date(todayStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={handleCheckOut}
                  disabled={punchLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shift Completed Today: <strong>{todayStatus.workHours} hrs</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Personal Attendance History */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Days Present"
              value={personalData.summary?.presentDays || 0}
              subtitle="Full shifts logged"
              icon={CalendarCheck}
              color="emerald"
            />
            <StatCard
              title="Half-Days"
              value={personalData.summary?.halfDays || 0}
              subtitle="Under 4 hours"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Total Work Hours"
              value={`${personalData.summary?.totalHours || 0}h`}
              subtitle="Cumulative this month"
              icon={TrendingUp}
              color="indigo"
            />
            <StatCard
              title="Average Daily Hours"
              value={`${personalData.summary?.avgHoursPerDay || 0}h`}
              subtitle="Per attendance punch"
              icon={Clock}
              color="purple"
            />
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h3 className="text-base font-bold text-slate-800">Monthly Attendance History</h3>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Clock In</th>
                    <th className="py-3 px-3">Clock Out</th>
                    <th className="py-3 px-3">Total Hours</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personalData.data && personalData.data.length > 0 ? (
                    personalData.data.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{record.date}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In progress'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{record.workHours || 0} hrs</td>
                        <td className="py-3 px-3">
                          <Badge>{record.status}</Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-400 italic max-w-xs truncate">
                          {record.checkInNote || record.checkOutNote || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No records found for selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team Roster (Manager & HR) */}
      {activeTab === 'team' && isManagerOrHR && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Team Attendance Today</h3>
              <p className="text-xs text-slate-500">Live roster of assigned team members</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {teamData.length} Team Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Today Status</th>
                  <th className="py-3 px-3">Clock In</th>
                  <th className="py-3 px-3">Clock Out</th>
                  <th className="py-3 px-3">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                        {item.employee?.user?.avatar ? (
                          <img
                            src={item.employee.user.avatar}
                            alt={item.employee.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.employee?.user?.name?.slice(0, 2).toUpperCase() || 'EM'
                        )}
                      </div>
                      <div>
                        <span>{item.employee?.user?.name}</span>
                        <span className="text-[10px] text-slate-400 block">{item.employee?.designation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.employee?.department?.name || 'General'}</td>
                    <td className="py-3 px-3">
                      <Badge>{item.attendance?.status || 'Absent'}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.attendance?.checkIn
                        ? new Date(item.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.attendance?.checkOut
                        ? new Date(item.attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : item.attendance?.checkIn
                        ? 'On Shift'
                        : '—'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{item.attendance?.workHours || 0} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Organization Overview (HR Only) */}
      {activeTab === 'org' && isHR && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Total Workforce"
              value={orgData.summary?.totalEmployees || 0}
              subtitle="Registered staff"
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Present Today"
              value={orgData.summary?.presentCount || 0}
              subtitle={`${orgData.summary?.attendanceRate || 0}% Organization Turnout`}
              icon={CalendarCheck}
              color="emerald"
            />
            <StatCard
              title="Half-Days"
              value={orgData.summary?.halfDayCount || 0}
              subtitle="Partial shifts"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Absent Today"
              value={orgData.summary?.absentCount || 0}
              subtitle="Not clocked in"
              icon={Clock}
              color="rose"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Organization Attendance Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Clock In</th>
                    <th className="py-3 px-3">Clock Out</th>
                    <th className="py-3 px-3">Hours</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgData.data && orgData.data.length > 0 ? (
                    orgData.data.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{record.user?.name}</td>
                        <td className="py-3 px-3 text-slate-600">{record.employee?.department?.name || 'General'}</td>
                        <td className="py-3 px-3 text-slate-600">{record.date}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On Shift'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{record.workHours || 0} hrs</td>
                        <td className="py-3 px-3">
                          <Badge>{record.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No organization attendance logs found for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
