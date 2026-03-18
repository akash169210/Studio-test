import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  onClose: () => void;
}

export function BookingModal({ onClose }: BookingModalProps) {
  const bookingUrl = 'https://calendar.app.google/Xg33HiZgsgEQq8uV6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161616]">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#95BF47]" />
            Schedule a Meeting
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#95BF47]/10 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-[#95BF47]" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-white">
            Great — I've got your details.
          </h2>
          
          <p className="text-[15px] text-gray-400 mb-8 max-w-md mx-auto">
            The next step is to pick a time that works best for you to discuss how SDR Agent can help your team.
          </p>

          <div className="flex flex-col items-center gap-4">
            <a 
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#95BF47] text-black font-bold hover:bg-[#85ab3f] transition-colors flex items-center justify-center gap-2 text-[15px]"
              onClick={onClose}
            >
              Book a time
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <a 
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-bold text-gray-400 hover:text-white underline underline-offset-4 transition-colors"
              onClick={onClose}
            >
              Open calendar in a new tab
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
