const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Target URL - EZLynx account overview page
const TARGET_URL = 'https://app.ezlynx.com';

// Proxy middleware configuration
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // Remove the '/proxy' path segment when forwarding
  },
  onProxyRes: function(proxyRes, req, res) {
    // Remove headers that prevent iframe embedding
    proxyRes.headers['x-frame-options'] = '';
    proxyRes.headers['content-security-policy'] = '';
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    
    // Log proxy activity
    console.log(`Proxied: ${req.method} ${req.url} -> ${TARGET_URL}${req.url.replace('/proxy', '')}`);
  },
  onError: function(err, req, res) {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error: ' + err);
  }
};

// Set up proxy route
app.use('/proxy', createProxyMiddleware(proxyOptions));

// Add a test endpoint
app.get('/test', (req, res) => {
  res.send('Proxy server is working!');
});

// Fallback to index.html for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Access the proxied vendor tool at http://localhost:${PORT}/proxy`);
});
