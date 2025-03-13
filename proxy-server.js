const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// Create Express App
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Target URL
const TARGET_URL = 'https://app.ezlynx.com';

// Add a simple test page at /proxy-test to confirm proxy server is working
app.get('/proxy-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Proxy Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; padding: 10px; background: #e8f5e9; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>Proxy Server Test Page</h1>
      <div class="success">
        <h3>✓ Proxy server is working correctly!</h3>
        <p>If you can see this page, the proxy server is running and serving content.</p>
      </div>
      <p>Next step: Try accessing <a href="/proxy">/proxy</a> to see the proxied EZLynx homepage.</p>
    </body>
    </html>
  `);
});

// Add debug middleware for tracking cookies
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  if (req.headers.cookie) {
    console.log(`Cookies: ${req.headers.cookie}`);
  }
  next();
});

// Create proxy middleware with enhanced settings
const proxy = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  secure: false, 
  ws: true, // Support WebSockets
  followRedirects: true, // Follow redirects within the proxy
  cookieDomainRewrite: {
    '*': '' // Rewrite cookie domains to work with our proxy
  },
  cookiePathRewrite: {
    '*': '/' // Rewrite cookie paths to work with our proxy
  },
  pathRewrite: {
    '^/proxy': '',
  },
  onProxyReq: function(proxyReq, req, res) {
    // Add common browser headers
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
    
    // Add request's referer for authentication
    proxyReq.setHeader('Referer', TARGET_URL);
    
    // Ensure no-cache for dynamic content
    proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    proxyReq.setHeader('Pragma', 'no-cache');
    proxyReq.setHeader('Expires', '0');
    
    // Pass through authentication cookies
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    
    console.log(`Proxy request for: ${req.url}`);
  },
  onProxyRes: function(proxyRes, req, res) {
    // Remove security headers that prevent iframe embedding
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
    
    // Add permissive headers to allow resources to load properly
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    
    // For styling: ensure CSS files have correct content-type
    if (req.url.endsWith('.css')) {
      proxyRes.headers['content-type'] = 'text/css';
    }
    
    // For fonts: ensure font files have correct content-type
    if (req.url.endsWith('.woff') || req.url.endsWith('.woff2')) {
      proxyRes.headers['content-type'] = req.url.endsWith('.woff') ? 'font/woff' : 'font/woff2';
    }
    
    // Log status code
    console.log(`Proxied: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
    
    // Store cookies from proxy response
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      console.log('Received cookies from EZLynx, processing them');
      // Modify cookies to work with our domain
      const modifiedCookies = cookies.map(cookie => {
        return cookie
          .replace(/Domain=[^;]+;/gi, '') // Remove Domain attribute
          .replace(/Path=([^;]+);/gi, 'Path=/;'); // Modify Path to root
      });
      
      // Set the modified cookies
      proxyRes.headers['set-cookie'] = modifiedCookies;
    }
    
    // Handle redirects that happen after authentication
    if (proxyRes.statusCode === 302 || proxyRes.statusCode === 301) {
      const redirectLocation = proxyRes.headers.location;
      console.log(`Redirect detected to: ${redirectLocation}`);
      
      // If redirect URL is absolute, make it relative to our proxy
      if (redirectLocation) {
        if (redirectLocation.startsWith('http')) {
          const parsedUrl = new URL(redirectLocation);
          // Only rewrite URLs pointing to our target domain
          if (parsedUrl.host === 'app.ezlynx.com' || parsedUrl.host.endsWith('.ezlynx.com')) {
            // Rewrite to use our proxy
            const newPath = `/proxy${parsedUrl.pathname}${parsedUrl.search}`;
            console.log(`Rewriting absolute redirect from ${redirectLocation} to: ${newPath}`);
            proxyRes.headers.location = newPath;
          }
        } else if (redirectLocation.startsWith('/')) {
          // Handle relative URLs
          const newPath = `/proxy${redirectLocation}`;
          console.log(`Rewriting relative redirect from ${redirectLocation} to: ${newPath}`);
          proxyRes.headers.location = newPath;
        }
      }
    }
  }
});

// Use proxy middleware
app.use('/proxy', proxy);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Test page: http://localhost:${PORT}/proxy-test`);
  console.log(`Main proxy URL: http://localhost:${PORT}/proxy`);
});
