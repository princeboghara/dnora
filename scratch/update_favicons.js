const fs = require('fs');

const b64 = fs.readFileSync('public/images/logo/dnora-d-icon.png').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <image href="data:image/png;base64,${b64}" width="64" height="64" preserveAspectRatio="xMidYMid slice" />
</svg>`;

fs.writeFileSync('public/favicon.svg', svg);
fs.writeFileSync('app/icon.svg', svg);
console.log('SVG favicons updated with embedded high-res D logo!');
