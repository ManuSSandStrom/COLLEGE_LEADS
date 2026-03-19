import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiMapPin, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '../api/axios';
import useRevealOnScroll from '../hooks/useRevealOnScroll';
import toast from 'react-hot-toast';
import { getLeadProfile, setLeadProfile } from '../utils/leadProfile';
import { statesList, townsByState, allTowns } from '../utils/locations';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ totalInstitutions: 0, totalSchools: 0, totalColleges: 0 });
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [homeStates, setHomeStates] = useState([]);
  const [homeTowns, setHomeTowns] = useState([]);
  const [homeState, setHomeState] = useState('');
  const [homeTown, setHomeTown] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [quickForm, setQuickForm] = useState({
    studentName: '',
    phone: '',
    email: '',
    age: '',
    lookingFor: 'College',
  });

  useRevealOnScroll();

  useEffect(() => {
    fetchStats();
    fetchFeatured();
    fetchFilters();
    const existing = getLeadProfile();
    if (existing) {
      setQuickForm({
        studentName: existing.studentName || '',
        phone: existing.phone || '',
        email: existing.email || '',
        age: existing.age || '',
        lookingFor: existing.lookingFor || 'College',
      });
      setLeadSaved(true);
      if (existing.leadId) setLeadId(existing.leadId);
    }
  }, []);

  useEffect(() => {
    if (location.hash === '#quick-start') {
      const el = document.getElementById('quick-start');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/institution/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/institution?featured=true&limit=6');
      if (res.data.success) {
        setFeatured(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured institutions', error);
    }
  };

  const fetchFilters = async (stateParam = '') => {
    try {
      const query = stateParam ? `?state=${encodeURIComponent(stateParam)}&limit=1` : '?limit=1';
      const res = await api.get(`/institution${query}`);
      if (res.data.success) {
        const fetchedStates = (res.data.states || []).filter(Boolean);
        const fallbackStates = statesList;
        const nextStates = fetchedStates.length > 0 ? fetchedStates : fallbackStates;

        const fetchedTowns = (res.data.locations || []).filter(Boolean);
        const fallbackTowns = stateParam
          ? (townsByState[stateParam] || [])
          : allTowns;
        const nextTowns = fetchedTowns.length > 0 ? fetchedTowns : fallbackTowns;

        setHomeStates(nextStates);
        setHomeTowns(nextTowns);
      }
    } catch (error) {
      console.error('Failed to fetch locations', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('name', search.trim());
    if (homeState) params.set('state', homeState);
    if (homeTown) params.set('location', homeTown);
    const query = params.toString();
    navigate(`/institutions${query ? `?${query}` : ''}`);
  };

  useEffect(() => {
    fetchFilters(homeState);
    setHomeTown('');
  }, [homeState]);

  const handleQuickChange = (e) => {
    const { name, value } = e.target;
    setQuickForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const { studentName, phone, email, age, lookingFor } = quickForm;
    if (!studentName || !phone || !email || !lookingFor) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
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
      const saved = setLeadProfile({ studentName, phone, email, age, lookingFor, leadId: currentLeadId });
      setLeadId(currentLeadId);
      setLeadSaved(true);
      toast.success(`Thanks ${saved.studentName.split(' ')[0]}! Your details are saved.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save details');
    }
  };

  const handleKnowMore = async (inst) => {
    const profile = getLeadProfile();
    if (!profile) {
      toast.error('Please fill your details first');
      navigate('/#quick-start');
      return;
    }
    try {
      await api.post('/lead', {
        studentName: profile.studentName,
        phone: profile.phone,
        email: profile.email,
        age: profile.age,
        institutionName: inst.name,
        institutionId: inst._id,
        type: profile.lookingFor,
        leadSource: 'interest',
      });
      toast.success('Your interest has been shared with the institution');
    } catch (error) {
      console.error('Failed to save lead', error);
      toast.error('Unable to share your interest right now');
    }
    navigate(`/institution/${inst._id}`);
  };

  const sliderSettings = {
    dots: true,
    infinite: featured.length >= 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center mb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient z-0"></div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 right-20 w-[40rem] h-[40rem] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-[30rem] h-[30rem] bg-accent-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        
        <div className="container-app relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="flex w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-300">Mintu bro! admissions support for 2026-2027</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Find the Right <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                College Match
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Mintu bro! brings a cleaner way to explore India's leading schools and colleges, compare what matters, and share enquiries with confidence.
            </p>
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row mb-12 relative max-w-xl glass-card p-2 rounded-2xl group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
              <div className="relative flex-1 flex items-center pr-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <FiSearch className="absolute left-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search colleges, schools by name..."
                  className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3.5 outline-none placeholder-gray-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative sm:w-44 border-b sm:border-b-0 sm:border-r border-white/10">
                <select
                  value={homeState}
                  onChange={(e) => setHomeState(e.target.value)}
                  className="w-full bg-transparent text-white px-4 py-3.5 outline-none appearance-none"
                >
                  <option value="" disabled>Select State</option>
                  {homeStates.filter(Boolean).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="relative sm:w-44 border-b sm:border-b-0 sm:border-r border-white/10">
                <select
                  value={homeTown}
                  onChange={(e) => setHomeTown(e.target.value)}
                  className="w-full bg-transparent text-white px-4 py-3.5 outline-none appearance-none"
                >
                  <option value="" disabled>Select Town</option>
                  {homeTowns.filter(Boolean).map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary rounded-xl mt-2 sm:mt-0 sm:ml-2 px-8">
                Search
              </button>
            </form>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-1">{stats.totalColleges}+</h4>
                <p className="text-sm text-gray-400 font-medium tracking-wide">Colleges</p>
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-1">10k+</h4>
                <p className="text-sm text-gray-400 font-medium tracking-wide">Admissions</p>
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-white mb-1">{stats.totalSchools}+</h4>
                <p className="text-sm text-gray-400 font-medium tracking-wide">Schools</p>
              </div>
            </div>
          </div>
          
          <div id="quick-start" className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-glow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">Start Here</h3>
                  <p className="text-sm text-gray-400">Share details to unlock personalized results.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 text-primary-300 flex items-center justify-center">
                  <FiUsers size={22} />
                </div>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    value={quickForm.studentName}
                    onChange={handleQuickChange}
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
                      value={quickForm.phone}
                      onChange={handleQuickChange}
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
                      value={quickForm.age}
                      onChange={handleQuickChange}
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
                    value={quickForm.email}
                    onChange={handleQuickChange}
                    className="form-input"
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Looking For *</label>
                  <select
                    name="lookingFor"
                    value={quickForm.lookingFor}
                    onChange={handleQuickChange}
                    className="form-input appearance-none"
                    required
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  {leadSaved ? 'Update Details' : 'Save & Continue'}
                </button>
                {leadSaved && (
                  <p className="text-xs text-green-400 text-center">Details saved. Now explore institutions.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Institutions */}
      {featured.length > 0 && (
        <section className="container-app mb-24 reveal">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-8 h-[2px] bg-primary-500 rounded-full"></span>
                <span className="text-sm font-bold tracking-widest text-primary-400 uppercase">Featured</span>
              </div>
              <h2 className="section-title">Top Rated Institutions</h2>
              <p className="section-subtitle text-gray-400 max-w-2xl mt-4 text-base font-normal">
                Discover the most prestigious schools and colleges that provide world-class education and facilities.
              </p>
            </div>
            <button onClick={() => navigate('/institutions')} className="btn-secondary whitespace-nowrap">
              View All
            </button>
          </div>

          <div className="mx-[-10px]">
            <Slider {...sliderSettings}>
              {featured.map((inst) => (
                <div key={inst._id} className="px-3 py-4">
                  <div className="glass-card group h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-2 border border-white/5 hover:border-primary-500/30">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={inst.imageUrl || 'https://via.placeholder.com/800x600?text=Institution'}
                        alt={inst.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-card to-transparent pointer-events-none"></div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`badge ${inst.type === 'College' ? 'badge-college' : 'badge-school'}`}>
                          {inst.type}
                        </span>
                        {inst.featured && <span className="badge badge-new">Featured</span>}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                          <FiMapPin size={14} className="text-primary-400" />
                          <span className="truncate">{inst.location}{inst.state ? `, ${inst.state}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md">
                          <span className="text-yellow-400 text-sm">&#9733;</span>
                          <span className="text-white text-xs font-bold">{inst.rating?.toFixed(1) || '4.0'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
                        {inst.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-1">
                        {inst.description || "Top tier educational institution offering excellence in academics."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-sm">
                          <span className="text-gray-500">Fees from </span>
                          <span className="block font-bold text-white tracking-wide">&#8377;{inst.fees.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          onClick={() => handleKnowMore(inst)}
                          className="btn-primary py-2 px-5 text-sm"
                        >
                          Know More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* Feature Highlights section */}
      <section className="container-app mb-24 reveal">
        <div className="glass-card bg-primary-900/40 border-primary-500/20 p-12 lg:p-16 rounded-[2.5rem] relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-3xl rounded-full bg-primary-500 w-96 h-96 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
            <h2 className="section-title mb-6">Why Choose Mintu bro!?</h2>
            <p className="text-gray-300 text-lg">We simplify the admission process by providing verified information and a seamless application experience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[ 
              { icon: <FiAward size={32} />, title: "Verified Institutions", desc: "Every school and college on our platform is 100% verified and authenticated." },
              { icon: <FiUsers size={32} />, title: "Direct Contact", desc: "Send your enquiries directly to the admission offices without any middleman." },
              { icon: <FiMapPin size={32} />, title: "Location Filter", desc: "Easily find the best educational institutions exactly where you want them." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-surface-card/60 border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-colors group">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-app mb-24 reveal">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-accent-500 rounded-full"></span>
            <span className="text-sm font-bold tracking-widest text-accent-400 uppercase">Testimonials</span>
          </div>
          <h2 className="section-title">Students Love Mintu bro!</h2>
          <p className="section-subtitle">
            Real stories from students who discovered their perfect institution with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Aditi Sharma',
              role: 'BBA Applicant',
              quote: 'The filters and detailed insights saved me weeks. I shortlisted my college in one evening.',
            },
            {
              name: 'Rohan Mehta',
              role: 'MBA Aspirant',
              quote: 'The enquiry form was seamless. I got a call back within a day with all the details.',
            },
            {
              name: 'Nisha Verma',
              role: 'Class XI Parent',
              quote: 'Clear comparisons and verified schools made the decision easy and confident.',
            },
          ].map((t, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-accent-500/30 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-500/10 text-accent-500 flex items-center justify-center font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-app reveal">
        <div className="bg-btn-gradient rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-glow-lg">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-white/80 mb-10 leading-relaxed">
              Browse through thousands of institutions and find the perfect match for your career aspirations today.
            </p>
            <button 
              onClick={() => navigate('/institutions')} 
              className="bg-white text-primary-600 hover:bg-gray-50 font-bold px-10 py-4 rounded-xl shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Explore Now
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
