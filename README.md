# Vendor Tool Integration Prototype

This prototype demonstrates how to integrate EZLynx into our proprietary front-end UX via an iframe, using a reverse proxy to bypass X-Frame-Options restrictions.

## Project Structure

- `index.html` - Main application shell that mimics our CRM interface, now with direct EZLynx iframe
- `styles.css` - Styling for the prototype following our design aesthetic
- `script.js` - Handles the iframe integration logic with specific EZLynx account path
- `iframe-content.html` - A placeholder/simulation for comparison (left side)
- `proxy-server.js` - Node.js reverse proxy server targeting EZLynx
- `package.json` - Node.js dependencies for the proxy server

## Current Implementation

The prototype displays two iframes side by side for direct comparison:

1. **Standard Iframe** (left side) - Using placeholder content
   - Demonstrates regular iframe embedding without proxy
   - Shows the baseline implementation for comparison

2. **Proxy-Enabled Iframe** (right side) - Using reverse proxy approach
   - Currently embedding EZLynx account overview (91492473)
   - The proxy server:
     - Targets the EZLynx domain (app.ezlynx.com)
     - Intercepts requests to the specific account path
     - Strips out X-Frame-Options and related security headers
     - Returns the modified response, allowing iframe embedding

## How to Run

1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Start the proxy server: `npm start`
4. Open your browser to http://localhost:3000
5. The EZLynx account overview should load in the right-side iframe

## Next Steps

1. **Implement session handling**: Currently, the proxy doesn't maintain EZLynx login sessions
2. **Add authentication support**: Implement a method to pass authentication credentials through the proxy
3. **Improve error handling**: Add specific error messages when EZLynx is unavailable or returns errors
4. **Create UI controls**: Add navigation controls to interact with EZLynx from our interface
5. **Optimize iframe height**: Dynamically adjust iframe height based on content
6. **Add configuration panel**: Create a settings panel to switch between different EZLynx accounts
7. **Implement data extraction**: Add capability to extract data from EZLynx for use in our application
