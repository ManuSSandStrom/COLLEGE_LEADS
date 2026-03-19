import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ compact = false, className = '' }) => {
  const markClass = compact ? 'w-10 h-10 rounded-2xl text-sm' : 'w-12 h-12 rounded-[1.1rem] text-base';
  const nameClass = compact ? 'text-lg' : 'text-xl';

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`.trim()}>
      <div
        className={`${markClass} flex items-center justify-center font-display font-bold tracking-[0.18em] text-white shadow-glow transition-all duration-300 group-hover:-translate-y-0.5`}
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 58%, #0ea5e9 100%)' }}
        aria-hidden="true"
      >
        MB
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${nameClass} font-display font-bold tracking-tight text-white transition-colors group-hover:text-primary-300`}>
          Mintu bro!
        </span>
        <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Admissions Platform
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
