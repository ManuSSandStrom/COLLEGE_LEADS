import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiMapPin, FiCheckCircle, FiGlobe, FiCalendar, FiDollarSign, FiHome, FiArrowLeft, FiSend, FiLoader, FiPhone, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useRevealOnScroll from '../hooks/useRevealOnScroll';

const InstitutionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const enquiryRef = useRef(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [institutionList, setInstitutionList] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    type: '',
    hostelRequired: false,
    courseInterest: '',
    message: '',
  });

  useRevealOnScroll();

  useEffect(() => {
    fetchInstitution();
  }, [id]);

  useEffect(() => {
    fetchInstitutionList();
  }, []);

  const fetchInstitution = async () => {
    try {
      const res = await api.get(`/institution/${id}`);
      if (res.data.success) {
        setInstitution(res.data.data);
        setSelectedInstitutionId(res.data.data._id);
        setFormData((prev) => ({ ...prev, type: res.data.data.type }));
      }
    } catch (error) {
      console.error('Error fetching institution details:', error);
      toast.error('Failed to load institution details');
      navigate('/institutions');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionList = async () => {
    try {
      const res = await api.get('/institution?limit=500');
      if (res.data.success) {
        const list = res.data.data || [];
        list.sort((a, b) => a.name.localeCompare(b.name));
        setInstitutionList(list);
      }
    } catch (error) {
      console.error('Failed to load institutions list', error);
    }
  };

  useEffect(() => {
    if (!loading && institution && enquiryRef.current) {
      const params = new URLSearchParams(location.search);
      if (params.get('apply') === 'true' || location.hash === '#enquiry') {
        enquiryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [loading, institution, location.search, location.hash]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInstitutionChange = (e) => {
    const newId = e.target.value;
    setSelectedInstitutionId(newId);
    if (newId && newId !== id) {
      navigate(`/institution/${newId}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Basic validation
    if (!formData.studentName || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      setSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        institutionName: institution.name,
        institutionId: institution._id,
        leadSource: 'enquiry',
      };

      const res = await api.post('/lead', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Enquiry submitted successfully!');
        setFormData({
          studentName: '', phone: '', email: '', type: institution.type,
          hostelRequired: false, courseInterest: '', message: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin text-primary-500 mb-4">
          <FiLoader size={40} />
        </div>
      </div>
    );
  }

  if (!institution) return null;

  return (
    <div className="pt-24 pb-20">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] w-full mb-12">
        <div className="absolute inset-0 bg-surface z-10 opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10"></div>
        <img
          src={institution.imageUrl || 'https://via.placeholder.com/1920x1080?text=Institution'}
          alt={institution.name}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-12">
          <div className="container-app">
            <button 
              onClick={() => navigate('/institutions')}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 bg-white/10 hover:bg-white/25 px-4 py-2 rounded-xl backdrop-blur-md transition-all w-max font-medium"
            >
              <FiArrowLeft size={18} /> Back to Search
            </button>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`badge text-sm px-4 py-1.5 ${institution.type === 'College' ? 'badge-college' : 'badge-school'}`}>
                {institution.type}
              </span>
              {institution.featured && (
                <span className="badge badge-new text-sm px-4 py-1.5">Featured</span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              {institution.name}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-200">
              <p className="flex items-center gap-2 text-lg drop-shadow-md">
                <FiMapPin className="text-primary-400" />
                {institution.location}{institution.state ? `, ${institution.state}` : ''}
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                <span className="text-yellow-400">&#9733;</span>
                <span className="font-bold">{institution.rating?.toFixed(1) || '4.0'} Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10 animate-fade-in-up reveal">
          {/* Quick Info Grid */}
          <div className="glass-card p-8 rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2"><FiCalendar className="text-primary-400"/> Established</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-xl font-bold">{institution.establishedYear || 'N/A'}</span>
            </div>
            <div className="relative z-10 flex flex-col gap-2 border-l border-white/10 pl-6">
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2"><FiGlobe className="text-primary-400"/> Website</span>
              {institution.website ? (
                <a href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-base font-bold truncate transition-colors underline-offset-4 hover:underline">
                  Visit Site
                </a>
              ) : (
                <span className="text-white text-xl font-bold">N/A</span>
              )}
            </div>
            <div className="relative z-10 flex flex-col gap-2 md:border-l border-white/10 md:pl-6">
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2"><FiDollarSign className="text-primary-400"/> Annual Fees</span>
              <span className="text-white text-xl font-bold tracking-wide">&#8377;{institution.fees.toLocaleString('en-IN')}</span>
            </div>
            <div className="relative z-10 flex flex-col gap-2 border-l border-white/10 pl-6">
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2"><FiHome className="text-primary-400"/> Accommodation</span>
              <span className={`text-xl font-bold ${institution.hostelAvailable ? 'text-green-400' : 'text-gray-500'}`}>
                {institution.hostelAvailable ? 'Hostel Available' : 'Not Available'}
              </span>
            </div>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-display font-bold text-white mb-6 inline-flex items-center gap-3">
              Contact Details
              <div className="h-px bg-gradient-to-r from-accent-500/40 flex-1 hidden sm:block ml-4"></div>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 text-primary-300 flex items-center justify-center">
                  <FiPhone />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  {institution.contactPhone ? (
                    <a href={`tel:${institution.contactPhone}`} className="text-white font-semibold hover:text-primary-300 transition-colors">
                      {institution.contactPhone}
                    </a>
                  ) : (
                    <p className="text-white font-semibold">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-accent-500/15 text-accent-400 flex items-center justify-center">
                  <FiMail />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  {institution.contactEmail ? (
                    <a href={`mailto:${institution.contactEmail}`} className="text-white font-semibold hover:text-accent-300 transition-colors">
                      {institution.contactEmail}
                    </a>
                  ) : (
                    <p className="text-white font-semibold">Not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-display font-bold text-white mb-6 inline-flex items-center gap-3">
              About Institution
              <div className="h-px bg-gradient-to-r from-primary-500/50 flex-1 hidden sm:block ml-4"></div>
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {institution.description || 'No description provided.'}
            </p>
          </div>

          {institution.feesByYear && institution.feesByYear.length > 0 && (
            <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5">
              <h3 className="text-xl font-display font-bold text-white mb-6">Year-wise Fees</h3>
              <div className="space-y-3">
                {institution.feesByYear.map((row, i) => (
                  <div key={`${row.year}-${i}`} className="flex items-center justify-between bg-surface p-4 rounded-xl border border-white/5">
                    <span className="text-gray-300 font-medium">{row.year}</span>
                    <span className="text-white font-bold">&#8377;{Number(row.fee).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5 h-full">
              <h3 className="text-xl font-display font-bold text-white mb-6">Offered Courses / Classes</h3>
              {institution.courses && institution.courses.length > 0 ? (
                <ul className="space-y-4 text-gray-300">
                  {institution.courses.map((course, i) => (
                    <li key={i} className="flex items-start gap-3 bg-surface p-3 rounded-xl border border-white/5 hover:border-primary-500/30 transition-colors">
                      <FiCheckCircle className="text-primary-500 shrink-0 mt-1" size={18} />
                      <span className="font-medium text-[15px]">{course}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 font-medium bg-surface p-4 rounded-xl border border-white/5">No courses listed.</p>
              )}
            </div>

            <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/5 h-full">
              <h3 className="text-xl font-display font-bold text-white mb-6">Campus Facilities</h3>
              {institution.facilities && institution.facilities.length > 0 ? (
                <ul className="space-y-4 text-gray-300">
                  {institution.facilities.map((fac, i) => (
                    <li key={i} className="flex items-start gap-3 bg-surface p-3 rounded-xl border border-white/5 hover:border-accent-500/30 transition-colors">
                      <FiCheckCircle className="text-accent-500 shrink-0 mt-1" size={18} />
                      <span className="font-medium text-[15px]">{fac}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 font-medium bg-surface p-4 rounded-xl border border-white/5">No facilities listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Sidebar */}
        <div className="animate-fade-in-up reveal" style={{ animationDelay: '0.2s' }}>
          <div ref={enquiryRef} className="glass-card p-8 rounded-3xl sticky top-28 border border-white/10 shadow-glow-lg before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-500/5 before:to-accent-500/5 before:rounded-3xl before:-z-10 relative z-0">
            <div className="text-center mb-8 pb-6 border-b border-white/10">
              <h3 className="text-2xl font-display font-bold text-white mb-2">Admission Enquiry</h3>
              <p className="text-sm text-gray-400">Send an enquiry directly to the admission office of {institution.name}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Select Institution *</label>
                <select
                  name="institutionId"
                  value={selectedInstitutionId}
                  onChange={handleInstitutionChange}
                  className="form-input appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select institution</option>
                  {institutionList.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Institution Type</label>
                <input
                  type="text"
                  value={formData.type || institution.type}
                  readOnly
                  className="form-input bg-white/5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="10-digit number"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Course of Interest</label>
                {institution.courses && institution.courses.length > 0 ? (
                  <select
                    name="courseInterest"
                    value={formData.courseInterest}
                    onChange={handleInputChange}
                    className="form-input appearance-none cursor-pointer"
                  >
                    <option value="">Select a course</option>
                    {institution.courses.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name="courseInterest"
                    value={formData.courseInterest}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Which course are you interested in?"
                  />
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-4 cursor-pointer group bg-surface p-4 rounded-xl border border-white/5 hover:border-primary-500/30 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="hostelRequired"
                      checked={formData.hostelRequired}
                      onChange={handleInputChange}
                      className="peer sr-only"
                      disabled={!institution.hostelAvailable}
                    />
                    <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 transition-colors"></div>
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Hostel Accommodation</span>
                    {!institution.hostelAvailable && <p className="text-xs text-red-400 mt-1 font-medium">Not available at this institution</p>}
                  </div>
                </label>
              </div>

              <div>
                <label className="form-label">Message / Query (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-input min-h-[120px] resize-y"
                  placeholder="Any specific questions for the admission team?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary justify-center py-4 text-[17px] group mt-6"
              >
                {submitting ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    Submitting Enquiry...
                  </>
                ) : (
                  <>
                    Submit Enquiry Now
                    <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetails;
