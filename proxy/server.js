// ─── Anthropic API Proxy Server ─────────────────────────────────────────────
// Runs on localhost:3001. React app calls this instead of api.anthropic.com
// directly (browsers block cross-origin calls to Anthropic).
//
// Usage:
//   cd proxy && npm install && node server.js
//
// Set your Anthropic API key:
//   Windows:  set ANTHROPIC_API_KEY=sk-ant-...
//   Mac/Linux: export ANTHROPIC_API_KEY=sk-ant-...

const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app  = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.post('/api/claude', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set.' });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length':    Buffer.byteLength(body),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n✅ Anthropic proxy running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/claude  →  api.anthropic.com/v1/messages\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY is not set! Requests will fail.\n');
  }
});
