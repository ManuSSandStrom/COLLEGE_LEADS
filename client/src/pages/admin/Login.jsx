import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(username, password);
      toast.success('Login Successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-0"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 z-0"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 z-0"></div>

      <div className="glass-card w-full max-w-md p-10 rounded-3xl border border-white/10 relative z-10 shadow-2xl shadow-primary-500/10">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-btn-gradient mx-auto flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-glow">
            <FiLock size={28} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure access for authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="form-label text-gray-300">Username</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input bg-surface-card/50 pl-12 py-3.5 border-white/5 focus:border-primary-500/50 focus:bg-white/5"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="form-label text-gray-300">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input bg-surface-card/50 pl-12 py-3.5 border-white/5 focus:border-primary-500/50 focus:bg-white/5"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 mt-8 flex items-center justify-center gap-2 group text-lg"
          >
            {loading ? 'Authenticating...' : 'Sign In Securely'}
            {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center px-4">
          <p className="text-xs text-gray-500 font-medium">
            This module is restricted. Unauthorized access is strictly prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
