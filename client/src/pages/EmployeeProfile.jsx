import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Shield,
  Edit3,
  Save,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { updateProfile } from '../store/authSlice';
import api from '../services/api';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
  });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (id) {
        const res = await api.get(`/api/employees/${id}`);
        setProfile(res.data.data);
      } else {
        const res = await api.get('/api/auth/me');
        setProfile(res.data.employee || { user: res.data.user });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleOpenEdit = () => {
    setEditForm({
      name: profile?.user?.name || currentUser?.name || '',
      phone: profile?.phone || '',
      avatar: profile?.user?.avatar || currentUser?.avatar || '',
      address: profile?.address || { street: '', city: '', state: '', zipCode: '', country: 'USA' },
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isOwnProfile) {
        await dispatch(updateProfile(editForm)).unwrap();
      } else {
        await api.put(`/api/employees/${id}`, editForm);
      }
      setEditModalOpen(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="md:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const user = profile?.user || currentUser;
  const balances = profile?.leaveBalances || {};

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-brand-800 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-white/10 overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase() || 'EM'
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <Badge variant={user?.role === 'admin' ? 'primary' : 'purple'}>
                {user?.role === 'admin' ? 'HR Director' : user?.role}
              </Badge>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              {profile?.designation || 'Staff Member'} • {profile?.department?.name || 'StaffSync'}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Employee ID: <span className="font-semibold text-white">{profile?.employeeId || 'EMP-1003'}</span>
            </p>
          </div>
        </div>

        {(isOwnProfile || currentUser?.role === 'admin') && (
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-xs hover:bg-slate-100 shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Grid: Details, Leave Balances, Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Contact & Employment Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Contact & Job Details
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Work Email</span>
                <span className="font-medium text-slate-800">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Phone</span>
                <span className="font-medium text-slate-800">{profile?.phone || 'Not specified'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Location</span>
                <span className="font-medium text-slate-800">
                  {profile?.address?.city ? `${profile.address.city}, ${profile.address.state || 'USA'}` : 'San Francisco, CA'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Date of Joining</span>
                <span className="font-medium text-slate-800">
                  {profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'Jan 15, 2023'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Employment Type</span>
                <span className="font-medium text-slate-800">{profile?.employmentType || 'Full-Time'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leave Balances & Core Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* Leave Balances Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Leave Entitlements & Utilization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Annual Leave</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {(balances.annual?.total || 18) - (balances.annual?.used || 0)} days
                </span>
                <span className="text-[10px] text-slate-400">Total: {balances.annual?.total || 18} • Used: {balances.annual?.used || 0}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Sick Leave</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {(balances.sick?.total || 10) - (balances.sick?.used || 0)} days
                </span>
                <span className="text-[10px] text-slate-400">Total: {balances.sick?.total || 10} • Used: {balances.sick?.used || 0}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Casual Leave</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {(balances.casual?.total || 8) - (balances.casual?.used || 0)} days
                </span>
                <span className="text-[10px] text-slate-400">Total: {balances.casual?.total || 8} • Used: {balances.casual?.used || 0}</span>
              </div>
            </div>
          </div>

          {/* Skills & Badges */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Skills & Domain Competencies</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills && profile.skills.length > 0
                ? profile.skills
                : ['Full-Stack Development', 'React.js', 'Node.js', 'System Architecture', 'Agile Leadership', 'CI/CD']
              ).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Personal Information"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={editForm.address?.city || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    address: { ...editForm.address, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={editForm.address?.state || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    address: { ...editForm.address, state: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeProfile;
