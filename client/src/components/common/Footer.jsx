import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-surface-card border-t border-white/5 pt-16 pb-8">
      <div className="container-app">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <BrandLogo className="mb-6" />
            <p className="text-gray-400 leading-relaxed mb-6">
              Mintu bro! helps students and families discover trusted institutions, compare options clearly, and connect with admissions teams faster.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all">
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/institutions" className="text-gray-400 hover:text-primary-400 transition-colors">Find Institutions</Link></li>
              <li><Link to="/it-services" className="text-gray-400 hover:text-primary-400 transition-colors">IT Services</Link></li>
              <li><Link to="/international" className="text-gray-400 hover:text-primary-400 transition-colors">International</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Institutions */}
          <div>
            <h4 className="text-white font-semibold mb-6">For Institutions</h4>
            <ul className="space-y-4">
              <li><Link to="/super-admin-login" className="text-gray-400 hover:text-primary-400 transition-colors">Institution Login</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">List Your Institution</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Advertising Options</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-primary-400 shrink-0" size={18} />
                <span>123 Innovation Drive, Tech Park, Bangalore, 560001</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-400 shrink-0" size={18} />
                <span>+91 95150 22680</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-400 shrink-0" size={18} />
                <span>manoharbasappagari18@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mintu bro!. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
