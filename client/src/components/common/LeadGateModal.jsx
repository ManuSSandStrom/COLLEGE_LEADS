import React, { useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getLeadProfile, setLeadProfile } from '../../utils/leadProfile';

const LeadGateModal = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [form, setForm] = useState({
    studentName: '',
    phone: '',
    email: '',
    age: '',
    lookingFor: 'College',
  });

  useEffect(() => {
    const existing = getLeadProfile();
    if (!existing) {
      setOpen(true);
      return;
    }
    setForm({
      studentName: existing.studentName || '',
      phone: existing.phone || '',
      email: existing.email || '',
      age: existing.age || '',
      lookingFor: existing.lookingFor || 'College',
    });
    if (existing.leadId) setLeadId(existing.leadId);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { studentName, phone, email, age, lookingFor } = form;
    if (!studentName || !phone || !email || !lookingFor) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setSubmitting(true);
      let currentLeadId = leadId;
      if (!currentLeadId) {
        const res = await api.post('/lead', {
          studentName,
          phone,
          email,
          age,
          type: lookingFor,
          leadSource: 'profile',
        });
        currentLeadId = res.data?.data?._id || '';
      }
      setLeadProfile({ studentName, phone, email, age, lookingFor, leadId: currentLeadId });
      setLeadId(currentLeadId);
      setOpen(false);
      toast.success('Details saved. You can explore now.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save details');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-glow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-display font-bold text-white">Start Here</h3>
            <p className="text-sm text-gray-400">Share details to unlock personalized results.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-500/15 text-primary-300 flex items-center justify-center">
            <FiUsers size={22} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              className="form-input"
              placeholder="Student name"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Mobile *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="10-digit number"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="form-input"
                placeholder="Age"
                min="1"
                max="100"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="form-label">Looking For *</label>
            <select
              name="lookingFor"
              value={form.lookingFor}
              onChange={handleChange}
              className="form-input appearance-none"
              required
            >
              <option value="School">School</option>
              <option value="College">College</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save & Continue'}
          </button>
          <p className="text-xs text-gray-400 text-center">This is mandatory to use the portal.</p>
        </form>
      </div>
    </div>
  );
};

export default LeadGateModal;

