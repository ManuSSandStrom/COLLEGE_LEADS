import React from 'react';
import { useNavigate } from 'react-router-dom';

const International = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 min-h-screen bg-surface">
      <div className="container-app">
        <div className="glass-card p-10 md:p-14 rounded-3xl border border-white/10 relative overflow-hidden text-center">
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-accent-500/20 rounded-full blur-[90px]"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-accent-300">
              Global Expansion • Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              International Schools & Colleges
            </h1>
            <p className="text-gray-300 text-lg">
              We’re partnering with global institutions to bring international education
              opportunities on one platform. A dedicated international listing section is
              coming soon.
            </p>

            <div className="mt-10">
              <button onClick={() => navigate('/contact')} className="btn-primary">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default International;

