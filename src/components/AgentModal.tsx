import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X, User, Mail, Phone, Building, Briefcase, CheckCircle2 } from 'lucide-react';
import { useLiveAPI } from '../hooks/useLiveAPI';

interface AgentModalProps {
  onClose: () => void;
  onLeadCaptured: () => void;
}

interface LeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
}

export function AgentModal({ onClose, onLeadCaptured }: AgentModalProps) {
  const [input, setInput] = useState('');
  const [isQualifying, setIsQualifying] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  const leadDataRef = useRef(leadData);
  useEffect(() => {
    leadDataRef.current = leadData;
  }, [leadData]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLeadUpdate = useCallback((data: any) => {
    setIsQualifying(true);
    setLeadData(prev => ({ ...prev, ...data }));
  }, []);

  const handleLeadComplete = useCallback(async () => {
    try {
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadDataRef.current)
      });
      onLeadCaptured();
    } catch (error) {
      console.error('Failed to submit lead:', error);
    }
  }, [onLeadCaptured]);

  const { isConnected, isSpeaking, messages, connect, disconnect, sendTextMessage } = useLiveAPI(handleLeadUpdate, handleLeadComplete);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    sendTextMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
      >
        {/* Chat Section */}
        <div className="flex-1 flex flex-col h-full border-r border-white/5">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161616]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded bg-[#95BF47]/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded bg-[#95BF47] text-black flex items-center justify-center font-bold">A</div>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161616] ${isConnected ? 'bg-[#95BF47]' : 'bg-gray-500'}`}></div>
              </div>
              <div>
                <h3 className="font-bold text-white">Ava</h3>
                <p className="text-[13px] text-[#95BF47] font-medium">
                  {isConnected ? (isSpeaking ? 'Speaking...' : 'Listening...') : 'Connecting...'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-[15px] ${
                  msg.role === 'user' 
                    ? 'bg-[#95BF47] text-black rounded-tr-sm font-medium' 
                    : 'bg-[#222] text-white rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#161616] border-t border-white/5">
            <div className="relative flex items-center">
              <button 
                className={`absolute left-3 p-2 transition-colors ${isConnected ? 'text-[#95BF47] animate-pulse' : 'text-gray-500'}`}
                disabled={!isConnected}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isConnected ? "Speak or type your message..." : "Connecting to Live API..."}
                disabled={!isConnected}
                className="w-full bg-[#222] text-white rounded-full pl-12 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-[#95BF47] border border-transparent focus:border-[#95BF47]/50 text-[15px] disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                className="absolute right-3 p-2 text-[#95BF47] hover:text-[#85ab3f] disabled:opacity-50 disabled:hover:text-[#95BF47] transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Lead Capture Panel */}
        <AnimatePresence>
          {isQualifying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#161616] border-t md:border-t-0 md:border-l border-white/5 flex flex-col w-full md:w-80 shrink-0"
            >
              <div className="p-4 border-b border-white/5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#95BF47]" />
                  Lead Qualification
                </h4>
              </div>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <Mail className="w-3 h-3" /> Work Email
                  </label>
                  <input 
                    type="email" 
                    value={leadData.email} 
                    onChange={e => setLeadData({...leadData, email: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Pending..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="w-3 h-3" /> First Name
                  </label>
                  <input 
                    type="text" 
                    value={leadData.first_name} 
                    onChange={e => setLeadData({...leadData, first_name: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Pending..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="w-3 h-3" /> Last Name
                  </label>
                  <input 
                    type="text" 
                    value={leadData.last_name} 
                    onChange={e => setLeadData({...leadData, last_name: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Pending..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    value={leadData.phone} 
                    onChange={e => setLeadData({...leadData, phone: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Pending..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <Building className="w-3 h-3" /> Company
                  </label>
                  <input 
                    type="text" 
                    value={leadData.company} 
                    onChange={e => setLeadData({...leadData, company: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
