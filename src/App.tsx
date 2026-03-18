import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { AgentModal } from './components/AgentModal';
import { BookingModal } from './components/BookingModal';
import { ChevronDown } from 'lucide-react';

export default function App() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartConversation = () => {
    setIsAgentOpen(true);
  };

  const handleLeadCaptured = () => {
    setIsAgentOpen(false);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-emerald-500/30">
      <header className={`fixed top-0 w-full z-40 transition-colors duration-300 ${scrolled ? 'bg-[#000000] border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded bg-[#95BF47] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 6.5c-1.5-1.5-3.5-2.5-6-2.5-4.5 0-8 3.5-8 8s3.5 8 8 8c2.5 0 4.5-1 6-2.5l-1.5-1.5c-1 1-2.5 1.5-4.5 1.5-3 0-5.5-2.5-5.5-5.5S7.5 6.5 10.5 6.5c2 0 3.5.5 4.5 1.5l1.5-1.5z"/>
                </svg>
              </div>
              <span className="font-bold text-2xl tracking-tight">SDR Agent</span>
            </div>
            <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-white">
              <button className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                Solutions <ChevronDown className="w-4 h-4" />
              </button>
              <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
              <button className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                Resources <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                What's new <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[15px] font-bold text-white hover:text-gray-300 transition-colors hidden sm:block">Log in</button>
            <button 
              onClick={handleStartConversation}
              className="px-5 py-2.5 rounded-full bg-white text-black text-[15px] font-bold hover:bg-gray-100 transition-colors"
            >
              Start the Conversation
            </button>
          </div>
        </div>
      </header>

      <main>
        <Hero onStart={handleStartConversation} />
        <Pricing />
      </main>

      {isAgentOpen && (
        <AgentModal 
          onClose={() => setIsAgentOpen(false)} 
          onLeadCaptured={handleLeadCaptured}
        />
      )}

      {isBookingOpen && (
        <BookingModal onClose={() => setIsBookingOpen(false)} />
      )}
    </div>
  );
}
