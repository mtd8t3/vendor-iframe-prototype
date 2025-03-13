document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded - iframe controls initialized');
    
    // Monitor iframe loading status
    function monitorIframe(iframeId) {
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            console.warn(`Iframe with ID ${iframeId} not found`);
            return;
        }
        
        // Log when iframe loads successfully
        iframe.onload = function() {
            console.log(`Iframe ${iframeId} loaded successfully`);
        };
        
        // Handle iframe loading errors
        iframe.onerror = function() {
            console.error(`Error loading iframe ${iframeId}`);
            const container = iframe.parentElement;
            container.innerHTML += '<div class="error-message">Error loading content. Please check the console for details.</div>';
        };
    }
    
    // Monitor both iframes
    monitorIframe('standard-iframe');
    monitorIframe('ezlynx-iframe');

    // Add functionality to refresh buttons if needed in the future
    // This is commented out as we're using direct iframes in the HTML now
    /*
    document.getElementById('refresh-standard').addEventListener('click', function() {
        const iframe = document.getElementById('standard-iframe');
        if (iframe) iframe.src = iframe.src;
    });
    
    document.getElementById('refresh-proxy').addEventListener('click', function() {
        const iframe = document.getElementById('ezlynx-iframe');
        if (iframe) iframe.src = iframe.src;
    });
    */
});
