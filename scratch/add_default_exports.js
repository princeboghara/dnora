const fs = require('fs');

const defaultExports = [
  { file: 'components/layout/AnnouncementBar.tsx', name: 'AnnouncementBar' },
  { file: 'components/layout/Footer.tsx', name: 'Footer' },
  { file: 'components/layout/CartDrawer.tsx', name: 'CartDrawer' },
  { file: 'components/layout/LiveVisitorHeartbeat.tsx', name: 'LiveVisitorHeartbeat' },
  { file: 'components/home/HeroBanner.tsx', name: 'HeroBanner' },
  { file: 'components/product/ProductDetailsClient.tsx', name: 'ProductDetailsClient' },
];

defaultExports.forEach(({ file, name }) => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(`export default ${name}`)) {
    content += `\nexport default ${name};\n`;
    fs.writeFileSync(file, content);
  }
});

console.log('Default exports added!');
