import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X, User, Mail, Phone, Building, Briefcase, CheckCircle2 } from 'lucide-react';

interface AgentModalProps {
  onClose: () => void;
  onLeadCaptured: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  use_case: string;
  plan_interest: string;
}

export function AgentModal({ onClose, onLeadCaptured }: AgentModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: "Hi, I'm Ava, the SDR Agent voice assistant. I can answer questions about AI SDR workflows, speech-to-speech experiences, pricing, and implementation. How can I help?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQualifying, setIsQualifying] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    use_case: '',
    plan_interest: ''
  });
  
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Speak initial greeting when modal opens
    speak(messages[0].content);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleMicClick = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });

      const data = await response.json();
      
      if (data.toolCall) {
        if (data.toolCall.name === 'update_lead_info') {
          setIsQualifying(true);
          setLeadData(prev => ({ ...prev, ...data.toolCall.args }));
        } else if (data.toolCall.name === 'complete_lead_capture') {
          // Submit lead to backend
          await fetch('/api/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
          });
          onLeadCaptured();
          return;
        }
      }

      if (data.text) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: data.text
        }]);
        speak(data.text);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
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
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#95BF47] border-2 border-[#161616]"></div>
              </div>
              <div>
                <h3 className="font-bold text-white">Ava</h3>
                <p className="text-[13px] text-[#95BF47] font-medium">AI SDR Agent</p>
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#222] rounded-2xl rounded-tl-sm p-4 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#161616] border-t border-white/5">
            <div className="relative flex items-center">
              <button 
                onClick={handleMicClick}
                className={`absolute left-3 p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#95BF47]'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type or speak your message..."
                className="w-full bg-[#222] text-white rounded-full pl-12 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-[#95BF47] border border-transparent focus:border-[#95BF47]/50 text-[15px]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
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
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={leadData.name} 
                    onChange={e => setLeadData({...leadData, name: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                    placeholder="Pending..."
                  />
                </div>
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
                <div className="space-y-1">
                  <label className="text-[13px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <Briefcase className="w-3 h-3" /> Plan Interest
                  </label>
                  <select 
                    value={leadData.plan_interest}
                    onChange={e => setLeadData({...leadData, plan_interest: e.target.value})}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-[15px] text-white focus:outline-none focus:border-[#95BF47]"
                  >
                    <option value="">Select a plan...</option>
                    <option value="Basic">Basic ($29/mo)</option>
                    <option value="Grow">Grow ($79/mo)</option>
                    <option value="Advanced">Advanced ($299/mo)</option>
                    <option value="Plus">Plus ($2,300/mo)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
