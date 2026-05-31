const fs = require('fs');
const file = 'frontend/src/app/(app)/chat/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-sm');

content = content.replace(/shadow-\[0_0_10px_#f59e0b\]/g, '');
content = content.replace(/shadow-\[0_0_50px_rgba\(245,158,11,0\.15\)\]/g, '');
content = content.replace(/animate-pulse/g, '');

content = content.replace(/e\.key === '\[' \|\| \(e\.key === '\\\\' && e\.metaKey\)/g, "(e.key === 'b' && (e.metaKey || e.ctrlKey)) || (e.key === '\\\\' && (e.metaKey || e.ctrlKey))");

fs.writeFileSync(file, content);
console.log('Done replacing classes');
