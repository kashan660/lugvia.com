// Paste this in browser console on lugvia.com
var debugStyle = document.createElement('style');
debugStyle.innerHTML = `
* { outline: 1px solid red !important; }
*[style*="width"] { background: rgba(255, 0, 0, 0.3) !important; }
body { overflow-x: auto !important; }
*[style*="px"] { border: 2px solid orange !important; }
.container, .section, .wrapper { border: 3px solid blue !important; }
* { max-width: 100vw !important; box-sizing: border-box !important; }
input, textarea, select, button { border: 2px solid green !important; }
`;
document.head.appendChild(debugStyle);
console.log('🔍 Debug CSS applied! Look for colored borders on problematic elements.');
