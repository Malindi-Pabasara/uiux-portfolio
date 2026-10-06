'use client';

import { useState } from 'react';
import RevealWrapper from './RevealWrapper';

interface Profile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export default function Footer({ profile }: { profile?: Partial<Profile> }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy submit action for frontend layout
    setStatus('Message sent successfully!');
    setTimeout(() => setStatus(''), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  const contactInfo = {
    name: 'Malindi Pabasara',
    phone: '+94 74 210 6298',
    email: 'malindi.wpm@gmail.com',
    linkedin: 'https://linkedin.com/in/Malindi-Pabasara',
    github: 'https://github.com/Malindi-Pabasara'
  };

  return (
    <footer id="contact" className="py-20 relative">
      <div className="wrap max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <RevealWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gray-900/40 border border-gray-700 rounded-2xl p-8 lg:p-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            
            {/* Left Column: Contact Details */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight font-['Space_Grotesk']">Let&apos;s work together</h2>
              <p className="text-[#9099bb] mb-8 leading-relaxed max-w-md">
                Currently open for new opportunities. Whether you have a question or just want to say hi, feel free to reach out.
              </p>
              
              <div className="flex flex-col gap-6 mb-10">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Name</p>
                  <p className="text-gray-200 font-medium">{contactInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                    {contactInfo.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-gray-200 hover:text-white transition-colors font-medium">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4 mt-auto">
                <a href={contactInfo.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all hover:-translate-y-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V23h-4V8z"/>
                  </svg>
                </a>
                <a href={contactInfo.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all hover:-translate-y-1">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.35-3.87-1.35-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.74.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18v3.24c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column: Secure Message Form */}
            <div className="bg-gray-800/30 p-6 md:p-8 rounded-xl border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6">Secure Message</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-gray-400 mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-gray-400 mb-2">Message</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-y"
                    placeholder="How can I help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(157,107,255,0.4)] transition-all"
                >
                  Send Message
                </button>
                {status && <p className="text-green-400 text-sm mt-2 text-center">{status}</p>}
              </form>
            </div>
            
          </div>
          <div className="text-center mt-12 text-sm text-gray-500 font-mono">
            © {new Date().getFullYear()} {contactInfo.name}. All rights reserved.
          </div>
        </RevealWrapper>
      </div>
    </footer>
  );
}
