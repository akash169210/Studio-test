import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
          alt="Crowd cheering" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Gradient fade to black at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            Replace qualified SDRs for half the price.
          </h1>
          
          <p className="text-[22px] text-white/90 mb-10 max-w-xl leading-snug font-medium">
            A premium speech-to-speech website agent that educates visitors, qualifies inbound interest, and books meetings directly on your calendar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Start the Conversation
            </button>
            <a 
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border-2 border-white text-white text-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
            >
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <Play className="w-3 h-3 ml-0.5 fill-white" />
              </div>
              Why we build SDR Agent
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
