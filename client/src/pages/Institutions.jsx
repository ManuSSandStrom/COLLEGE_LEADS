import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import useRevealOnScroll from '../hooks/useRevealOnScroll';
import toast from 'react-hot-toast';
import { getLeadProfile } from '../utils/leadProfile';
import { statesList, townsByState, allTowns } from '../utils/locations';

const Institutions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    type: searchParams.get('type') || 'all',
    location: searchParams.get('location') || '',
    state: searchParams.get('state') || '',
  });

  useRevealOnScroll();

  useEffect(() => {
    fetchInstitutions();
  }, [filters]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const { name, type, location } = filters;
      let query = '?';
      if (name) query += `name=${name}&`;
      if (filters.state) query += `state=${filters.state}&`;
      if (type !== 'all') query += `type=${type}&`;
      if (location) query += `location=${location}&`;

      const res = await api.get(`/institution${query}`);
      if (res.data.success) {
        setInstitutions(res.data.data);
        const fetchedStates = (res.data.states || []).filter(Boolean);
        const nextStates = fetchedStates.length > 0 ? fetchedStates : statesList;

        const fetchedLocations = (res.data.locations || []).filter(Boolean);
        const fallbackLocations = filters.state
          ? (townsByState[filters.state] || [])
          : allTowns;
        const nextLocations = fetchedLocations.length > 0 ? fetchedLocations : fallbackLocations;

        setLocations(nextLocations);
        setStates(nextStates);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      if (name === 'state') {
        return { ...prev, state: value, location: '' };
      }
      return { ...prev, [name]: value };
    });
    setSearchParams((prev) => {
      if (value === 'all' || value === '') prev.delete(name);
      else prev.set(name, value);
      if (name === 'state') prev.delete('location');
      return prev;
    });
  };

  const resetFilters = () => {
    setFilters({ name: '', type: 'all', location: '', state: '' });
    setSearchParams({});
  };

  const handleApply = (id) => {
    navigate(`/institution/${id}?apply=true`);
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
      toast.success('Interest shared successfully');
    } catch (error) {
      console.error('Failed to save lead', error);
      toast.error('Unable to share your interest right now');
    }
    navigate(`/institution/${inst._id}`);
  };

  return (
    <div className="pt-32 pb-16 min-h-screen bg-surface">
      <div className="container-app">
        {/* Header */}
        <div className="mb-12 reveal">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Discover Institutions
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Find the best schools and colleges perfectly tailored for your educational journey. Use our advanced filters to narrow down your choices.
          </p>
        </div>

        {/* Filters Section */}
        <div className="glass-card p-6 mb-12 rounded-2xl relative z-10 sticky top-24 shadow-glow-lg border-primary-500/20 reveal">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Name */}
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by institution name..."
                className="w-full bg-surface-border text-white px-12 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 border border-white/10"
              />
            </div>

            {/* Type Filter */}
            <div className="relative w-full md:w-48">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full bg-surface-border text-white px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 border border-white/10 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="School">Schools</option>
                <option value="College">Colleges</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <FiFilter size={16} />
              </div>
            </div>

            {/* State Filter */}
            <div className="relative w-full md:w-52">
              <select
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
                className="w-full bg-surface-border text-white px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 border border-white/10 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select State</option>
                {states.filter(Boolean).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <FiMapPin size={16} />
              </div>
            </div>

            {/* Location Filter */}
            <div className="relative w-full md:w-48">
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full bg-surface-border text-white px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 border border-white/10 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Town</option>
                {locations.filter(Boolean).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <FiMapPin size={16} />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="w-full md:w-auto p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-all group"
              title="Reset Filters"
            >
              <FiRefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="md:hidden">Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card h-[400px] skeleton border border-white/5"></div>
            ))}
          </div>
        ) : institutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {institutions.map((inst, index) => (
              <div 
                key={inst._id} 
                className="glass-card group flex flex-col h-full rounded-2xl overflow-hidden hover:shadow-glow hover:-translate-y-2 transition-all duration-300 border border-white/5 hover:border-primary-500/30 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Section */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={inst.imageUrl || 'https://via.placeholder.com/800x600?text=Institution'}
                    alt={inst.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card to-transparent pointer-events-none"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className={`badge ${inst.type === 'College' ? 'badge-college' : 'badge-school'} backdrop-blur-md`}>
                      {inst.type}
                    </span>
                    {inst.hostelAvailable && (
                      <span className="badge badge-hostel backdrop-blur-md">Hostel</span>
                    )}
                  </div>

                  {/* Rating & Location overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-white/90 drop-shadow-md">
                      <FiMapPin size={16} className="text-primary-400" />
                      <span className="truncate">{inst.location}{inst.state ? `, ${inst.state}` : ''}</span>
                    </div>
                  <div className="flex items-center gap-1 bg-surface-card/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <span className="text-yellow-400 text-sm">&#9733;</span>
                      <span className="text-white text-sm font-bold">{inst.rating?.toFixed(1) || '4.0'}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {inst.name}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {inst.description || 'Experience world-class education with state-of-the-art facilities and experienced faculty members.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {inst.courses?.slice(0, 3).map((course, i) => (
                      <span key={i} className="text-xs font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        {course}
                      </span>
                    ))}
                    {inst.courses?.length > 3 && (
                      <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-md">
                        +{inst.courses.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Starting Fees</span>
                      <span className="text-lg font-bold text-white tracking-wide">
                        &#8377;{inst.fees.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApply(inst._id)}
                        className="btn-primary py-2.5 px-6 text-sm"
                      >
                        Apply Now
                      </button>
                      <button
                        onClick={() => handleKnowMore(inst)}
                        className="btn-secondary py-2.5 px-5 text-sm"
                      >
                        Know More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl animate-fade-in border-dashed border-2 border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-gray-400">
              <FiSearch size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No institutions found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We couldn't find any institutions matching your selected filters. Try adjusting your search criteria.
            </p>
            <button onClick={resetFilters} className="btn-secondary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Institutions;
