import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function base64ToFloat32(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

function float32ToBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

export function useLiveAPI(onLeadUpdate: (data: any) => void, onLeadComplete: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  const connect = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      nextPlayTimeRef.current = audioContextRef.current.currentTime;

      const updateLeadInfoTool = {
        name: 'update_lead_info',
        description: 'Extracts and updates lead information from the conversation.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING, description: 'Work email address' },
            first_name: { type: Type.STRING, description: 'First name of the user' },
            last_name: { type: Type.STRING, description: 'Last name of the user' },
            phone: { type: Type.STRING, description: 'Phone number' },
            company: { type: Type.STRING, description: 'Company name' }
          }
        }
      };

      const completeLeadCaptureTool = {
        name: 'complete_lead_capture',
        description: 'Call this when the user has confirmed their lead details are correct and they are ready to submit.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            confirmed: { type: Type.BOOLEAN, description: 'True if the user confirmed' }
          },
          required: ['confirmed']
        }
      };

      const systemInstruction = `You are Ava, the SDR Agent voice assistant for SolveOneX. 
Your goal is to answer questions about AI SDR workflows, speech-to-speech experiences, pricing, and implementation.
You should sound natural, warm, professional, concise, and non-robotic.
Keep responses to 1 to 3 sentences. Be conversational and forward-moving.

Pricing Plans:
- Basic: $29/month (Do it yourself)
- Grow: $79/month (For small teams)
- Advanced: $299/month (For scaling teams)
- Plus: $2,300/month (Enterprise and custom workflows)

When the user expresses readiness to move forward, sign up, or speak with the team (e.g. "I'm ready to sign up", "I want a demo", "Book time"), transition to structured qualification mode.
Say something like: "Absolutely. I can help with that. Let me grab a few details first, and then I'll help you pick a time."

In qualification mode, you MUST ask for fields in this EXACT order, ONE AT A TIME:
1. work email
2. first name
3. last name
4. phone number
5. company name

Use short natural acknowledgments like "Got it", "Thanks", "Perfect", "That helps".
Do NOT use stiff phrases like "Thank you for providing that information".
Use the \`update_lead_info\` tool to extract information as they provide it.
Once all required info is gathered, ask them to confirm the details.
If they confirm, use the \`complete_lead_capture\` tool.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            
            try {
              streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
              sourceRef.current = audioContextRef.current!.createMediaStreamSource(streamRef.current);
              processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const base64 = float32ToBase64(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                });
              };

              sourceRef.current.connect(processorRef.current);
              processorRef.current.connect(audioContextRef.current!.destination);
            } catch (err) {
              console.error("Microphone access denied or failed:", err);
            }
          },
          onmessage: async (message: any) => {
            const ctx = audioContextRef.current;
            if (!ctx) return;

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const float32Data = base64ToFloat32(base64Audio);
              const buffer = ctx.createBuffer(1, float32Data.length, 24000);
              buffer.getChannelData(0).set(float32Data);
              
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              const startTime = Math.max(nextPlayTimeRef.current, ctx.currentTime);
              source.start(startTime);
              nextPlayTimeRef.current = startTime + buffer.duration;
              activeSourcesRef.current.push(source);

              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                if (activeSourcesRef.current.length === 0) {
                  setIsSpeaking(false);
                }
              };
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(source => source.stop());
              activeSourcesRef.current = [];
              nextPlayTimeRef.current = ctx.currentTime;
              setIsSpeaking(false);
            }

            // Handle Transcripts (if available)
            if (message.serverContent?.modelTurn?.parts) {
              const textParts = message.serverContent.modelTurn.parts.filter((p: any) => p.text);
              if (textParts.length > 0) {
                const text = textParts.map((p: any) => p.text).join('');
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: text }]);
              }
            }

            // Handle Tool Calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const responses = functionCalls.map((call: any) => {
                  if (call.name === 'update_lead_info') {
                    onLeadUpdate(call.args);
                    return { id: call.id, name: call.name, response: { result: 'success' } };
                  }
                  if (call.name === 'complete_lead_capture') {
                    onLeadComplete();
                    return { id: call.id, name: call.name, response: { result: 'success' } };
                  }
                  return { id: call.id, name: call.name, response: { result: 'error', error: 'Unknown function' } };
                });
                
                sessionPromise.then(session => {
                  session.sendToolResponse({ functionResponses: responses });
                });
              }
            }
          },
          onclose: () => {
            setIsConnected(false);
            cleanupAudio();
          },
          onerror: (error: any) => {
            console.error("Live API Error:", error);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction,
          tools: [{ functionDeclarations: [updateLeadInfoTool, completeLeadCaptureTool] }],
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
      
      // Send initial greeting trigger
      sessionRef.current.sendClientContent({ turns: "Hello! Please introduce yourself briefly.", turnComplete: true });

    } catch (error) {
      console.error("Failed to connect to Live API:", error);
    }
  }, [onLeadUpdate, onLeadComplete]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    cleanupAudio();
    setIsConnected(false);
  }, []);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current = [];
  };

  const sendTextMessage = useCallback((text: string) => {
    if (sessionRef.current) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
      sessionRef.current.sendClientContent({ turns: text, turnComplete: true });
    }
  }, []);

  return {
    isConnected,
    isSpeaking,
    messages,
    connect,
    disconnect,
    sendTextMessage
  };
}
