
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 5000);
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-white pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg font-heading">E</span>
              </div>
              <span className="text-xl font-black font-heading tracking-tight uppercase">Elite Academy</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leading the future of education in MENA. Empowering the next generation of leaders with world-class executive training.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-teal-500">Navigation</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Strategic Programs</a></li>
              <li><a href="#courses" className="hover:text-teal-400 transition-colors">Our Curriculum</a></li>
              <li><a href="#enterprise" className="hover:text-teal-400 transition-colors">For Enterprise</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-teal-500">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>Cairo, Egypt</li>
              <li>Riyadh, Saudi Arabia</li>
              <li>info@eliteacademy.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-teal-500">Stay Updated</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="bg-slate-800 border-none rounded-xl px-4 py-3 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button 
                type="submit"
                className="bg-teal-600 px-4 py-3 rounded-xl hover:bg-teal-700 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <p>© 2024 ELITE ACADEMY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
