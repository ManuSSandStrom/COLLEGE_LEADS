import React from 'react';
import { useNavigate } from 'react-router-dom';

const ItServices = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 min-h-screen bg-surface">
      <div className="container-app">
        <div className="glass-card p-10 md:p-14 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute -top-24 -right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-[90px]"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-primary-300">
              IT Services • Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Managed IT & Digital Enablement
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl">
              We are preparing a premium suite of IT services for institutions—covering
              campus networking, secure data systems, admission workflow automation,
              ERP integrations, and modern digital engagement tools.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {[
                'Admission Process Automation',
                'Campus Network & Security',
                'Student Data & CRM Systems',
                'Website & Mobile Experience',
                'Cloud Hosting & Backups',
                'Analytics & Reporting',
              ].map((service) => (
                <div key={service} className="bg-surface-card/70 border border-white/5 rounded-2xl px-5 py-4 text-gray-300">
                  {service}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button onClick={() => navigate('/contact')} className="btn-primary">
                Contact Us for Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItServices;

