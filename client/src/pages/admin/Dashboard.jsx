import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBookOpen, FiHome, FiTrendingUp, FiLogOut, FiPlus, FiTrash2, FiEdit, FiDownload, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { admin, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const formRef = useRef(null);
  
  // Institutions
  const [institutions, setInstitutions] = useState([]);
  const [editingInst, setEditingInst] = useState(null);
  
  // Leads
  const [leads, setLeads] = useState([]);
  const [newStudents, setNewStudents] = useState([]);
  const [contacted, setContacted] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadInstitution, setLeadInstitution] = useState('all');
  const [leadStartDate, setLeadStartDate] = useState('');
  const [leadEndDate, setLeadEndDate] = useState('');
  const [newStudentSearch, setNewStudentSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  const defaultInstForm = {
    namePreset: '',
    customName: '',
    type: 'College',
    state: 'Andhra Pradesh',
    location: '',
    customLocation: '',
    fees: '',
    feesByYear: [],
    courses: '',
    description: '',
    facilities: [],
    featured: false,
    rating: '4.0',
    establishedYear: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
  };

  // Forms
  const [instForm, setInstForm] = useState(defaultInstForm);
  const [instImage, setInstImage] = useState(null);

  const universityOptions = {
    'Andhra Pradesh': [
      'Andhra University',
      'Sri Venkateswara University',
      'Acharya Nagarjuna University',
      'Sri Krishnadevaraya University',
      'Dr. NTR University of Health Sciences',
      'Yogi Vemana University',
      'Vikrama Simhapuri University',
      'Krishna University',
      'Adikavi Nannaya University',
      'Rayalaseema University',
      'JNTU Kakinada',
      'JNTU Anantapur',
    ],
    Telangana: [
      'Osmania University',
      'Kakatiya University',
      'Telangana University',
      'Palamuru University',
      'Satavahana University',
      'Mahatma Gandhi University (Telangana)',
      'JNTU Hyderabad',
      'RGUKT Basar',
      'Dr. B. R. Ambedkar Open University',
      'Potti Sreeramulu Telugu University',
    ],
  };

  const districtsByState = {
    'Andhra Pradesh': [
      'Anakapalli', 'Anantapur', 'Bapatla', 'Chittoor', 'East Godavari',
      'Eluru', 'Guntur', 'Kakinada', 'Konaseema', 'Krishna', 'Kurnool',
      'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
      'Srikakulam', 'Sri Potti Sriramulu Nellore', 'Tirupati',
      'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa',
    ],
    Telangana: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad',
      'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
      'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad',
      'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri',
      'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
      'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy',
      'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
      'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri',
    ],
  };

  const facilityOptions = ['Library', 'College Bus', 'Hostel', 'PG', 'Gym', 'Canteen', 'Sports', 'Labs', 'Wi-Fi'];

  useEffect(() => {
    if (loading) return;
    if (!admin) {
      navigate('/super-admin-login');
      return;
    }
    fetchStats();
    fetchInstitutions();
    fetchNewStudents();
    fetchContactMessages();
  }, [admin, loading]);

  useEffect(() => {
    if (loading || !admin) return;
    fetchLeads();
  }, [admin, loading, leadInstitution, leadStartDate, leadEndDate]);

  const fetchStats = async () => {
    try {
      const [instRes, leadRes] = await Promise.all([
        api.get('/institution/stats'),
        api.get('/lead/stats')
      ]);
      setStats({
        ...instRes.data.data,
        ...leadRes.data.data
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const res = await api.get('/institution?limit=100');
      setInstitutions(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (leadInstitution && leadInstitution !== 'all') params.set('institution', leadInstitution);
      if (leadStartDate) params.set('startDate', leadStartDate);
      if (leadEndDate) params.set('endDate', leadEndDate);
      params.set('excludeSource', 'profile');

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/lead${query}`);
      setLeads(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchNewStudents = async () => {
    try {
      const res = await api.get('/lead?source=profile');
      setNewStudents(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchContactMessages = async () => {
    try {
      const res = await api.get('/contact');
      setContacted(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    logout();
    navigate('/super-admin-login');
  };

  const deleteInst = async (id) => {
    if (!window.confirm('Are you sure you want to delete this institution?')) return;
    try {
      await api.delete(`/institution/${id}`);
      toast.success('Institution deleted');
      fetchInstitutions();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/lead/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
      fetchNewStudents();
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Message deleted');
      fetchContactMessages();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting');
    }
  };

  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (leadInstitution && leadInstitution !== 'all') params.set('institution', leadInstitution);
      if (leadStartDate) params.set('startDate', leadStartDate);
      if (leadEndDate) params.set('endDate', leadEndDate);
      const query = params.toString() ? `?${params.toString()}` : '';

      const response = await api.get(`/export/leads${query}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Export failed');
    }
  };

  const resolveInstitutionName = (form) => {
    if (form.namePreset === 'Other') return form.customName.trim();
    return form.namePreset.trim();
  };

  const resolveLocation = (form) => {
    if (form.location === 'Other') return form.customLocation.trim();
    return form.location.trim();
  };

  const handleFacilityToggle = (facility) => {
    setInstForm((prev) => {
      const exists = prev.facilities.includes(facility);
      const facilities = exists
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities };
    });
  };

  const addFeeRow = () => {
    setInstForm((prev) => ({
      ...prev,
      feesByYear: [...prev.feesByYear, { year: '', fee: '' }],
    }));
  };

  const updateFeeRow = (index, field, value) => {
    setInstForm((prev) => {
      const next = prev.feesByYear.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, feesByYear: next };
    });
  };

  const removeFeeRow = (index) => {
    setInstForm((prev) => ({
      ...prev,
      feesByYear: prev.feesByYear.filter((_, i) => i !== index),
    }));
  };

  const resetInstitutionForm = () => {
    setEditingInst(null);
    setInstForm(defaultInstForm);
    setInstImage(null);
  };

  const handleNewInstitution = () => {
    resetInstitutionForm();
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInstSubmit = async (e) => {
    e.preventDefault();
    const name = resolveInstitutionName(instForm);
    const locationValue = resolveLocation(instForm);

    if (!name) {
      toast.error('Please select or enter an institution name');
      return;
    }
    if (!locationValue) {
      toast.error('Please select or enter a location');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', instForm.type);
    formData.append('state', instForm.state);
    formData.append('location', locationValue);
    formData.append('fees', instForm.fees);
    formData.append('courses', instForm.courses);
    formData.append('description', instForm.description);
    formData.append('facilities', instForm.facilities.join(', '));
    formData.append('featured', instForm.featured);
    formData.append('rating', instForm.rating);
    formData.append('establishedYear', instForm.establishedYear);
    formData.append('website', instForm.website);
    formData.append('contactEmail', instForm.contactEmail);
    formData.append('contactPhone', instForm.contactPhone);

    const feesByYearPayload = instForm.feesByYear
      .filter((row) => row.year && row.fee !== '')
      .map((row) => ({ year: row.year, fee: row.fee }));
    formData.append('feesByYear', JSON.stringify(feesByYearPayload));

    const hostelAvailable = instForm.facilities.includes('Hostel');
    formData.append('hostelAvailable', hostelAvailable);

    if (instImage) formData.append('image', instImage);

    try {
      if (editingInst) {
        await api.put(`/institution/${editingInst._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Institution updated');
      } else {
        await api.post('/institution', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Institution created');
      }
      resetInstitutionForm();
      fetchInstitutions();
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving institution');
    }
  };

  const startEdit = (inst) => {
    const allUniversities = Object.values(universityOptions).flat();
    const namePreset = allUniversities.includes(inst.name) ? inst.name : 'Other';
    const locationPreset = inst.location;
    const locationList = districtsByState[inst.state] || [];
    const locationValue = locationList.includes(locationPreset) ? locationPreset : 'Other';

    const facilities = inst.facilities ? [...inst.facilities] : [];
    if (inst.hostelAvailable && !facilities.includes('Hostel')) {
      facilities.push('Hostel');
    }

    setEditingInst(inst);
    setInstForm({
      namePreset,
      customName: namePreset === 'Other' ? inst.name : '',
      type: inst.type,
      state: inst.state || 'Andhra Pradesh',
      location: locationValue,
      customLocation: locationValue === 'Other' ? inst.location : '',
      fees: inst.fees,
      feesByYear: inst.feesByYear || [],
      courses: inst.courses?.join(', '),
      description: inst.description || '',
      facilities,
      featured: inst.featured || false,
      rating: inst.rating || '4.0',
      establishedYear: inst.establishedYear || '',
      website: inst.website || '',
      contactEmail: inst.contactEmail || '',
      contactPhone: inst.contactPhone || '',
    });
    setInstImage(null);
  };

  const leadsChartData = useMemo(() => {
    const counts = new Map();
    (stats?.dailyLeads || []).forEach((d) => counts.set(d._id, d.count));
    const series = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      series.push({
        date: key,
        label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        count: counts.get(key) || 0,
      });
    }
    return series;
  }, [stats]);

  const filteredLeads = leads.filter((l) =>
    l.studentName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.institutionName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.phone?.includes(leadSearch) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredNewStudents = newStudents.filter((l) =>
    l.studentName?.toLowerCase().includes(newStudentSearch.toLowerCase()) ||
    l.phone?.includes(newStudentSearch) ||
    l.email?.toLowerCase().includes(newStudentSearch.toLowerCase())
  );

  const filteredContacts = contacted.filter((c) =>
    c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.subject?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-card border-r border-white/5 md:min-h-screen p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-btn-gradient flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h2 className="text-white font-bold tracking-wide">Admin Portal</h2>
            <p className="text-xs text-green-400 font-medium tracking-widest uppercase">Super Admin</p>
          </div>
        </div>

        <button onClick={() => setActiveTab('overview')} className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}>
          <FiTrendingUp size={20} /> Overview Dashboard
        </button>
        <button onClick={() => setActiveTab('institutions')} className={`sidebar-item ${activeTab === 'institutions' ? 'active' : ''}`}>
          <FiHome size={20} /> Manage Institutions
        </button>
        <button onClick={() => setActiveTab('leads')} className={`sidebar-item ${activeTab === 'leads' ? 'active' : ''}`}>
          <FiUsers size={20} /> Student Leads
        </button>
        <button onClick={() => setActiveTab('new-students')} className={`sidebar-item ${activeTab === 'new-students' ? 'active' : ''}`}>
          <FiUsers size={20} /> New Students
        </button>
        <button onClick={() => setActiveTab('contacted')} className={`sidebar-item ${activeTab === 'contacted' ? 'active' : ''}`}>
          <FiUsers size={20} /> Contacted Students
        </button>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={handleLogout} className="sidebar-item text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full justify-start">
            <FiLogOut size={20} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 bg-surface min-h-screen">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="animate-fade-in">
            <header className="mb-8 p-6 glass-card rounded-2xl flex items-center justify-between border-primary-500/20 shadow-glow bg-gradient-to-r from-surface-card to-primary-900/40">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide">Business Overview</h1>
                <p className="text-gray-400 text-sm md:text-base mt-1">Real-time statistics and analytics dashboard</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                System Live
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat-card border-l-4 border-primary-500 hover:shadow-glow hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center"><FiUsers size={24} /></div>
                <div><p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Leads</p><h3 className="text-3xl font-bold text-white">{stats.totalLeads}</h3></div>
              </div>
              <div className="stat-card border-l-4 border-accent-500 hover:shadow-glow hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 text-accent-500 flex items-center justify-center"><FiHome size={24} /></div>
                <div><p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Institutions</p><h3 className="text-3xl font-bold text-white">{stats.totalInstitutions}</h3></div>
              </div>
              <div className="stat-card border-l-4 border-amber-500 hover:shadow-glow hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center"><FiBookOpen size={24} /></div>
                <div><p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Schools</p><h3 className="text-3xl font-bold text-white">{stats.totalSchools}</h3></div>
              </div>
              <div className="stat-card border-l-4 border-blue-500 hover:shadow-glow hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center"><FiTrendingUp size={24} /></div>
                <div><p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Colleges</p><h3 className="text-3xl font-bold text-white">{stats.totalColleges}</h3></div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Daily Leads Stats */}
              <div className="glass-card p-6 border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiTrendingUp className="text-primary-400" /> Leads Growth (7 Days)
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Updated daily</span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadsChartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                        labelStyle={{ color: '#e5e7eb' }}
                        itemStyle={{ color: '#34d399' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#34d399" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-card p-6 border border-white/5 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FiHome className="text-primary-400" /> Top Institutions by Demand</h3>
                <div className="space-y-4">
                  {stats.leadsByInstitution?.map((inst, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-transparent hover:border-primary-500/30 transition-colors">
                      <span className="text-gray-300 font-medium truncate max-w-[70%]">{inst._id}</span>
                      <span className="text-white font-bold bg-surface px-3 py-1 rounded border border-white/10">{inst.count} enquiries</span>
                    </div>
                  ))}
                  {(!stats.leadsByInstitution || stats.leadsByInstitution.length === 0) && <p className="text-gray-500 text-center py-4">No institution data</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTITUTIONS TAB */}
        {activeTab === 'institutions' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Manage Institutions</h1>
              <button onClick={handleNewInstitution} className="btn-primary py-2 px-4 shadow-xl">
                <FiPlus /> Add Institution
              </button>
            </div>

            <div ref={formRef} className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingInst ? 'Edit Institution' : 'Add New Institution'}</h2>
                  <p className="text-gray-400 text-sm">Use the dropdowns to add institutions for Andhra Pradesh and Telangana.</p>
                </div>
                {editingInst && (
                  <button onClick={resetInstitutionForm} className="btn-secondary">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleInstSubmit} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Institution Name *</label>
                    <select
                      value={instForm.namePreset}
                      onChange={(e) => setInstForm({ ...instForm, namePreset: e.target.value })}
                      className="form-input appearance-none"
                      required
                    >
                      <option value="" disabled>Select from list</option>
                      {Object.entries(universityOptions).map(([state, list]) => (
                        <optgroup key={state} label={`${state} Universities`}>
                          {list.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Other">Other (Enter manually)</option>
                    </select>
                    {instForm.namePreset === 'Other' && (
                      <input
                        type="text"
                        value={instForm.customName}
                        onChange={(e) => setInstForm({ ...instForm, customName: e.target.value })}
                        className="form-input mt-3"
                        placeholder="Enter institution name"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="form-label">Type *</label>
                    <select
                      value={instForm.type}
                      onChange={(e) => setInstForm({ ...instForm, type: e.target.value })}
                      className="form-input appearance-none"
                    >
                      <option value="School">School</option>
                      <option value="College">College</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">State *</label>
                    <select
                      value={instForm.state}
                      onChange={(e) => setInstForm({ ...instForm, state: e.target.value, location: '', customLocation: '' })}
                      className="form-input appearance-none"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Location / District *</label>
                    <select
                      value={instForm.location}
                      onChange={(e) => setInstForm({ ...instForm, location: e.target.value })}
                      className="form-input appearance-none"
                      required
                    >
                      <option value="" disabled>Select location</option>
                      {(districtsByState[instForm.state] || []).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option value="Other">Other (Enter manually)</option>
                    </select>
                    {instForm.location === 'Other' && (
                      <input
                        type="text"
                        value={instForm.customLocation}
                        onChange={(e) => setInstForm({ ...instForm, customLocation: e.target.value })}
                        className="form-input mt-3"
                        placeholder="Enter location"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      value={instForm.contactPhone}
                      onChange={(e) => setInstForm({ ...instForm, contactPhone: e.target.value })}
                      className="form-input"
                      placeholder="Institution phone number"
                    />
                  </div>

                  <div>
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      value={instForm.contactEmail}
                      onChange={(e) => setInstForm({ ...instForm, contactEmail: e.target.value })}
                      className="form-input"
                      placeholder="admissions@institution.com"
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                  <div>
                    <label className="form-label">Starting Fees (Year 1) *</label>
                    <input
                      type="number"
                      value={instForm.fees}
                      onChange={(e) => setInstForm({ ...instForm, fees: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Established Year</label>
                    <input
                      type="number"
                      value={instForm.establishedYear}
                      onChange={(e) => setInstForm({ ...instForm, establishedYear: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Rating (0 - 5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={instForm.rating}
                      onChange={(e) => setInstForm({ ...instForm, rating: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input
                      type="text"
                      value={instForm.website}
                      onChange={(e) => setInstForm({ ...instForm, website: e.target.value })}
                      className="form-input"
                      placeholder="www.example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Year-wise Fees</label>
                  <div className="space-y-3">
                    {instForm.feesByYear.map((row, index) => (
                      <div key={`${row.year}-${index}`} className="grid sm:grid-cols-3 gap-3 items-center">
                        <input
                          type="text"
                          value={row.year}
                          onChange={(e) => updateFeeRow(index, 'year', e.target.value)}
                          className="form-input"
                          placeholder="Year (e.g., 1st Year)"
                        />
                        <input
                          type="number"
                          value={row.fee}
                          onChange={(e) => updateFeeRow(index, 'fee', e.target.value)}
                          className="form-input"
                          placeholder="Fee amount"
                        />
                        <button type="button" onClick={() => removeFeeRow(index)} className="btn-secondary py-2 justify-center">
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeeRow} className="btn-secondary w-max">
                      + Add Year
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Courses / Streams (comma separated)</label>
                    <input
                      type="text"
                      value={instForm.courses}
                      onChange={(e) => setInstForm({ ...instForm, courses: e.target.value })}
                      className="form-input"
                      placeholder="Science, Commerce, B.Tech..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Upload Cover Image</label>
                    <input
                      type="file"
                      onChange={(e) => setInstImage(e.target.files[0])}
                      className="form-input cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Facilities (tick all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {facilityOptions.map((facility) => (
                      <label key={facility} className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl border border-white/5 cursor-pointer hover:border-primary-500/30">
                        <input
                          type="checkbox"
                          checked={instForm.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="w-4 h-4 rounded bg-surface border-white/20 text-primary-500 focus:ring-primary-500/50"
                        />
                        <span className="text-sm text-gray-300">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={instForm.description}
                    onChange={(e) => setInstForm({ ...instForm, description: e.target.value })}
                    className="form-input h-28 resize-y"
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-white font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instForm.featured}
                      onChange={(e) => setInstForm({ ...instForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-surface border-white/20 text-primary-500 focus:ring-primary-500/50"
                    />
                    Featured on Home
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={resetInstitutionForm} className="btn-secondary">
                    Clear
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingInst ? 'Update Institution' : 'Save Institution'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full admin-table">
                <thead className="bg-surface/50 border-b border-white/5">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Fees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {institutions.map(inst => (
                    <tr key={inst._id}>
                      <td>
                        <img src={inst.imageUrl || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded object-cover border border-white/10" />
                      </td>
                      <td className="font-medium text-white">{inst.name} {inst.featured && <span className="ml-2 text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>}</td>
                      <td><span className={`px-2 py-1 rounded text-xs border ${inst.type === 'School' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>{inst.type}</span></td>
                      <td>{inst.location}{inst.state ? `, ${inst.state}` : ''}</td>
                      <td>&#8377;{inst.fees.toLocaleString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(inst)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"><FiEdit /></button>
                          <button onClick={() => deleteInst(inst._id)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {institutions.length === 0 && <p className="text-center text-gray-400 py-8">No institutions added yet</p>}
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 glass-card p-6 rounded-2xl border-primary-500/20">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Student Leads</h1>
                <p className="text-gray-400 text-sm mt-1">Manage and export all student enquiries</p>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    className="w-full bg-surface-card pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                  />
                </div>
                <select
                  value={leadInstitution}
                  onChange={(e) => setLeadInstitution(e.target.value)}
                  className="bg-surface-card px-4 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                >
                  <option value="all">All Institutions</option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst.name}>{inst.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={leadStartDate}
                  onChange={(e) => setLeadStartDate(e.target.value)}
                  className="bg-surface-card px-3 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                />
                <input
                  type="date"
                  value={leadEndDate}
                  onChange={(e) => setLeadEndDate(e.target.value)}
                  className="bg-surface-card px-3 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => { setLeadInstitution('all'); setLeadStartDate(''); setLeadEndDate(''); }}
                  className="btn-secondary whitespace-nowrap"
                >
                  Reset Filters
                </button>
                <button onClick={downloadExcel} className="btn-secondary whitespace-nowrap hidden sm:flex bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50">
                  <FiDownload /> Export Excel
                </button>
              </div>
            </div>

            <div className="glass-card overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full admin-table whitespace-nowrap">
                <thead className="bg-surface/50 border-b border-white/5">
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Institution</th>
                    <th>Type</th>
                    <th>Hostel</th>
                    <th>Interest / Msg</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map(lead => (
                    <tr key={lead._id}>
                      <td className="text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-white">{lead.studentName}</td>
                      <td className="text-sm">{lead.age || '-'}</td>
                      <td className="text-sm">{lead.phone}</td>
                      <td className="text-xs text-gray-400">{lead.email}</td>
                      <td className="font-medium text-primary-300">{lead.institutionName}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs border ${
                            lead.type === 'School'
                              ? 'border-green-500/30 text-green-400 bg-green-500/10'
                              : lead.type === 'College'
                                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                : 'border-white/10 text-gray-400 bg-white/5'
                          }`}
                        >
                          {lead.type || 'N/A'}
                        </span>
                      </td>
                      <td className={`${lead.hostelRequired ? 'text-amber-400' : 'text-gray-500'} text-xs font-semibold`}>
                        {lead.hostelRequired ? 'Yes' : 'No'}
                      </td>
                      <td className="max-w-[200px] truncate" title={lead.message}>
                        <span className="block text-sm">{lead.courseInterest || 'General'}</span>
                        <span className="text-xs text-gray-500 truncate block">{lead.message}</span>
                      </td>
                      <td>
                        <button onClick={() => deleteLead(lead._id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && <p className="text-center text-gray-400 py-10">No leads found</p>}
            </div>
            
            {/* Mobile Export Button */}
            <button onClick={downloadExcel} className="w-full mt-4 sm:hidden btn-secondary justify-center text-green-400 border-green-500/30">
              <FiDownload /> Export to Excel
            </button>
          </div>
        )}

        {/* NEW STUDENTS TAB */}
        {activeTab === 'new-students' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 glass-card p-6 rounded-2xl border-primary-500/20">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">New Students</h1>
                <p className="text-gray-400 text-sm mt-1">Fresh student profiles captured on first visit.</p>
              </div>
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search new students..."
                  className="w-full bg-surface-card pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                  value={newStudentSearch}
                  onChange={(e) => setNewStudentSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="glass-card overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full admin-table whitespace-nowrap">
                <thead className="bg-surface/50 border-b border-white/5">
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Looking For</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredNewStudents.map((lead) => (
                    <tr key={lead._id}>
                      <td className="text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-white">{lead.studentName}</td>
                      <td className="text-sm">{lead.age || '-'}</td>
                      <td className="text-sm">{lead.phone}</td>
                      <td className="text-xs text-gray-400">{lead.email}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs border ${
                          lead.type === 'School'
                            ? 'border-green-500/30 text-green-400 bg-green-500/10'
                            : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                        }`}>
                          {lead.type || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => deleteLead(lead._id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredNewStudents.length === 0 && <p className="text-center text-gray-400 py-10">No new students found</p>}
            </div>
          </div>
        )}

        {/* CONTACTED STUDENTS TAB */}
        {activeTab === 'contacted' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 glass-card p-6 rounded-2xl border-primary-500/20">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">Contacted Students</h1>
                <p className="text-gray-400 text-sm mt-1">Messages received from the contact page.</p>
              </div>
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full bg-surface-card pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white outline-none focus:border-primary-500"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="glass-card overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full admin-table whitespace-nowrap">
                <thead className="bg-surface/50 border-b border-white/5">
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredContacts.map((msg) => (
                    <tr key={msg._id}>
                      <td className="text-xs">{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td className="font-bold text-white">{msg.name}</td>
                      <td className="text-xs text-gray-400">{msg.email}</td>
                      <td className="text-sm">{msg.subject || 'General'}</td>
                      <td className="max-w-[260px] truncate" title={msg.message}>{msg.message}</td>
                      <td>
                        <button onClick={() => deleteContact(msg._id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContacts.length === 0 && <p className="text-center text-gray-400 py-10">No contact messages found</p>}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default Dashboard;
