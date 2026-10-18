import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  ExternalLink,
  Users,
  Award,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import api from '../services/api';

const TrainingManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const isManagerOrHR = user?.role === 'manager' || user?.role === 'admin';

  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Program Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    instructor: 'StaffSync Learning Center',
    estimatedHours: 6,
    resources: [{ title: 'Documentation & Guide', url: 'https://react.dev', type: 'link' }],
  });

  // Assign Employees Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTrainingId, setAssignTrainingId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Update Progress Modal (Employee)
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressTrainingId, setProgressTrainingId] = useState(null);
  const [progressValue, setProgressValue] = useState(50);
  const [progressFeedback, setProgressFeedback] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/trainings');
      setTrainings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/api/employees');
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error('Failed to load employees for assignment:', err);
    }
  };

  useEffect(() => {
    fetchTrainings();
    if (isManagerOrHR) {
      fetchEmployeesList();
    }
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/trainings', createForm);
      setIsCreateOpen(false);
      setCreateForm({
        title: '',
        description: '',
        category: 'Technical',
        instructor: 'StaffSync Learning Center',
        estimatedHours: 6,
        resources: [{ title: 'Documentation & Guide', url: 'https://react.dev', type: 'link' }],
      });
      fetchTrainings();
      alert('Training program created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create training');
    }
  };

  const handleOpenAssign = (trainingId) => {
    setAssignTrainingId(trainingId);
    setSelectedEmployees([]);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) return alert('Select at least one employee');

    try {
      await api.post(`/api/trainings/${assignTrainingId}/assign`, {
        employeeIds: selectedEmployees,
      });
      setIsAssignOpen(false);
      fetchTrainings();
      alert('Employees assigned to training module!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign employees');
    }
  };

  const handleOpenProgress = (training) => {
    setProgressTrainingId(training._id);
    const myAssignment = training.assignedEmployees?.find(
      (a) => String(a.user?._id || a.user) === String(user.id)
    );
    setProgressValue(myAssignment?.progressPercentage || 0);
    setProgressFeedback(myAssignment?.feedback || '');
    setIsProgressOpen(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/trainings/${progressTrainingId}/progress`, {
        progressPercentage: Number(progressValue),
        feedback: progressFeedback,
      });
      setIsProgressOpen(false);
      fetchTrainings();
      alert('Progress updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training & Skill Development</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise upskilling catalog, compliance certifications, and employee progress tracking.
          </p>
        </div>

        {isManagerOrHR && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white shadow-md shadow-brand-600/20 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {/* Training Programs Catalog */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No training modules available</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or ask your manager for assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map((t) => {
            const myAssignment = t.assignedEmployees?.find(
              (a) => String(a.user?._id || a.user) === String(user.id)
            );
            const myProgress = myAssignment?.progressPercentage || 0;
            const myStatus = myAssignment?.status || 'Not Assigned';

            return (
              <div
                key={t._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                      {t.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> {t.estimatedHours} hrs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{t.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {t.description}
                  </p>

                  {/* Resources Links */}
                  {t.resources && t.resources.length > 0 && (
                    <div className="mb-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 block">Curriculum Resources:</span>
                      {t.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{res.title}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Progress for Employee */}
                  {myAssignment && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">My Completion Progress</span>
                        <span className="font-bold text-brand-600">{myProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${myProgress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge>{myStatus}</Badge>
                        <button
                          onClick={() => handleOpenProgress(t)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Update Progress
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.assignedEmployees?.length || 0} Enrolled</span>
                  </div>

                  {isManagerOrHR && (
                    <button
                      onClick={() => handleOpenAssign(t._id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Team</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Program Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Training Module">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. SOC2 Compliance Certification"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="Technical">Technical</option>
                <option value="Compliance">Compliance</option>
                <option value="Leadership">Leadership</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="1"
                max="100"
                value={createForm.estimatedHours}
                onChange={(e) => setCreateForm({ ...createForm, estimatedHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Module overview, target outcomes, and topics..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm"
            >
              Publish Module
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Employees Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Employees to Training">
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select one or more employees to enroll in this course. They will receive an automated in-app notification.
          </p>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
            {employees.map((emp) => (
              <label
                key={emp._id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:border-brand-300"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployees([...selectedEmployees, emp._id]);
                    } else {
                      setSelectedEmployees(selectedEmployees.filter((id) => id !== emp._id));
                    }
                  }}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">{emp.user?.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {emp.designation} • {emp.department?.name || 'StaffSync'}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm"
            >
              Enroll Selected ({selectedEmployees.length})
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal isOpen={isProgressOpen} onClose={() => setIsProgressOpen(false)} title="Update My Course Progress">
        <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700">Completion Percentage</label>
              <span className="text-base font-bold text-brand-600">{progressValue}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Feedback / Notes</label>
            <textarea
              rows={3}
              value={progressFeedback}
              onChange={(e) => setProgressFeedback(e.target.value)}
              placeholder="Notes on completed sections or key takeaways..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProgressOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm"
            >
              Save Progress
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingManagement;
