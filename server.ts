import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      const systemInstruction = `You are Ava, the SDR Agent voice assistant for SolveOneX. 
Your goal is to answer questions about AI SDR workflows, speech-to-speech experiences, pricing, and implementation.
You should sound confident, warm, concise, polished, and consultative.

Pricing Plans:
- Basic: $29/month (Do it yourself)
- Grow: $79/month (For small teams)
- Advanced: $299/month (For scaling teams)
- Plus: $2,300/month (Enterprise and custom workflows)

When the user expresses interest in moving forward, getting pricing, talking to sales, or getting a demo, you should transition to qualification mode.
Say something like: "Happy to help with that. I can grab a few details and then help you book time with our team."
Then, use the \`update_lead_info\` tool to extract any information they provide (name, email, phone, company, use case, plan interest).
Ask for missing required information (name, work email, phone number) one by one naturally.
Once all required info is gathered, ask them to confirm the details.
If they confirm, use the \`complete_lead_capture\` tool.`;

      const updateLeadInfoTool: FunctionDeclaration = {
        name: 'update_lead_info',
        description: 'Extracts and updates lead information from the conversation.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full name of the user' },
            email: { type: Type.STRING, description: 'Work email address' },
            phone: { type: Type.STRING, description: 'Phone number' },
            company: { type: Type.STRING, description: 'Company name' },
            use_case: { type: Type.STRING, description: 'Intended use case' },
            plan_interest: { type: Type.STRING, description: 'Plan they are interested in (Basic, Grow, Advanced, Plus)' }
          }
        }
      };

      const completeLeadCaptureTool: FunctionDeclaration = {
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

      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [updateLeadInfoTool, completeLeadCaptureTool] }],
          temperature: 0.7,
        }
      });

      const functionCalls = response.functionCalls;
      let toolCall = null;
      
      if (functionCalls && functionCalls.length > 0) {
        toolCall = {
          name: functionCalls[0].name,
          args: functionCalls[0].args
        };
      }

      res.json({ 
        text: response.text,
        toolCall
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat' });
    }
  });

  app.post('/api/submit-lead', async (req, res) => {
    try {
      const leadData = req.body;
      console.log('Submitting lead to HubSpot:', leadData);
      // Mock HubSpot submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Sending Slack notification for lead:', leadData.email);
      // Mock Slack notification
      
      res.json({ success: true });
    } catch (error) {
      console.error('Lead submission error:', error);
      res.status(500).json({ error: 'Failed to submit lead' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();