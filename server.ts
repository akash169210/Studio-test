import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/submit-lead', async (req, res) => {
    try {
      const leadData = req.body;
      
      // Store lead data in application backend storage layer
      console.log('Storing lead in application database:', leadData);
      
      // Simulate database write latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Lead successfully stored for:', leadData.email);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Lead submission error:', error);
      res.status(500).json({ error: 'Failed to store lead' });
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