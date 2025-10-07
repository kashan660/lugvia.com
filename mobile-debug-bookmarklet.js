// Mobile Debug Bookmarklet - Drag this to bookmarks bar
javascript:(function(){
  // Add visual debugging styles
  var style = document.createElement('style');
  style.innerHTML = `
    * { outline: 1px solid rgba(255,0,0,0.3) !important; }
    *:hover { outline: 2px solid red !important; }
    body { overflow-x: auto !important; }
  `;
  document.head.appendChild(style);
  
  // Check for wide elements
  var wideElements = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.scrollWidth > window.innerWidth) {
      wideElements.push(el);
      el.style.border = '3px solid red';
      el.title = 'Wide element: ' + el.scrollWidth + 'px';
    }
  });
  
  // Show results
  alert('Found ' + wideElements.length + ' elements wider than viewport. Check console for details.');
  console.log('Wide elements:', wideElements);
  
  // Check viewport meta tag
  var viewport = document.querySelector('meta[name="viewport"]');
  console.log('Viewport meta tag:', viewport ? viewport.content : 'NOT FOUND');
})();