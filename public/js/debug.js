// Debug helper for Squid Game
console.log('Debug script loaded');

// This will be loaded first
window.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready in debug script');
  
  // Attach to window error events
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.message, 'at', e.filename, 'line', e.lineno);
  });
  
  // Clear localStorage to avoid issues
  try {
    localStorage.clear();
    console.log('localStorage cleared for fresh start');
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
  
  // Add direct button handler in case other scripts fail
  window.setTimeout(function() {
    var touchButton = document.getElementById('touch-button');
    if (touchButton) {
      console.log('Adding emergency touch handler from debug.js');
      touchButton.addEventListener('click', function() {
        console.log('Emergency touch handler activated');
        
        return false;
      });
    }
  }, 500);
});
