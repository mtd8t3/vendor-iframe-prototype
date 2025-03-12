document.addEventListener('DOMContentLoaded', function() {
    // Function to create and load an iframe
    function loadIframe(containerId, useProxy) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear the placeholder content
        container.innerHTML = '';
        
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        
        // Determine which source to use based on useProxy flag
        if (useProxy) {
            // Use the proxy server path with specific EZLynx account path
            iframe.src = '/proxy/web/account/91492473/overview';
            console.log(`Loading EZLynx account through proxy server in ${containerId}...`);
        } else {
            // Use the placeholder content (for demo purposes)
            iframe.src = 'iframe-content.html';
            console.log(`Loading placeholder content in ${containerId}...`);
        }
        
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerText = 'Loading...';
        container.appendChild(loadingIndicator);
        
        // Add the iframe to the container
        container.appendChild(iframe);
        
        // Remove loading indicator when iframe loads
        iframe.onload = function() {
            const indicator = container.querySelector('.loading-indicator');
            if (indicator) indicator.remove();
        };
        
        // Handle iframe loading errors
        iframe.onerror = function() {
            container.innerHTML = '<div class="error-message">Error loading content. Please check the console for details.</div>';
        };
    }
    
    // Automatically load both iframes when the page loads
    loadIframe('standard-iframe', false);  // Standard iframe without proxy
    loadIframe('proxy-iframe', true);      // Proxy-enabled iframe
});
