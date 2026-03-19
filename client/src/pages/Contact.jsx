import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useRevealOnScroll from '../hooks/useRevealOnScroll';
import api from '../api/axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useRevealOnScroll();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      try {
        const res = await api.post('/contact', formData);
        toast.success(res.data?.message || 'Thanks for reaching out! We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to send message');
      }
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-[90vh]">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Contact Us</h1>
          <p className="text-gray-400 text-lg">
            Have questions about admissions, our platform, or need support? We're here to help you every step of the way.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6 reveal">
            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all">
                <FiMapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Our Office</h3>
              <p className="text-gray-400">123 Innovation Drive, Tech Park,<br/>Bangalore, India 560001</p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all">
                <FiPhone size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone Number</h3>
              <p className="text-gray-400">+91 95150 22680<br/>Mon-Fri from 9am to 6pm</p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all">
                <FiMail size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Address</h3>
              <p className="text-gray-400">manoharbasappagari18@gmail.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 glass-card p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden reveal">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h2 className="text-3xl font-display font-bold text-white mb-8">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="form-label">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-input min-h-[160px] resize-y"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary py-4 px-8 text-lg group">
                Send Message <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
