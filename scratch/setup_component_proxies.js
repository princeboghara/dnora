const fs = require('fs');

const proxies = [
  { file: 'components/HeroBanner.tsx', target: './home/HeroBanner' },
  { file: 'components/CircularCollections.tsx', target: './home/CircularCollections' },
  { file: 'components/TrendingNowSection.tsx', target: './home/TrendingNowSection' },
  { file: 'components/BestSellersSection.tsx', target: './home/BestSellersSection' },
  { file: 'components/NewArrivalsSection.tsx', target: './home/NewArrivalsSection' },
  { file: 'components/PromoBanner.tsx', target: './home/PromoBanner' },
  { file: 'components/DynamicHomeSection.tsx', target: './home/DynamicHomeSection' },
  { file: 'components/SeenOnYouSection.tsx', target: './home/SeenOnYouSection' },
  { file: 'components/CustomerReviewsSection.tsx', target: './home/CustomerReviewsSection' },
  { file: 'components/ProductCard.tsx', target: './product/ProductCard' },
  { file: 'components/ProductDetailsClient.tsx', target: './product/ProductDetailsClient' },
  { file: 'components/AnnouncementBar.tsx', target: './layout/AnnouncementBar' },
  { file: 'components/Footer.tsx', target: './layout/Footer' },
  { file: 'components/CartDrawer.tsx', target: './layout/CartDrawer' },
  { file: 'components/LiveVisitorHeartbeat.tsx', target: './layout/LiveVisitorHeartbeat' },
  { file: 'components/InvoiceModal.tsx', target: './invoice/InvoiceModal' },
  { file: 'components/InvoiceControls.tsx', target: './invoice/InvoiceControls' },
  { file: 'components/InvoicePrintButton.tsx', target: './invoice/InvoicePrintButton' },
  { file: 'components/SectionHeading.tsx', target: './ui/SectionHeading' },
];

proxies.forEach(p => {
  const content = `export * from "${p.target}";\nexport { default } from "${p.target}";\n`;
  fs.writeFileSync(p.file, content);
});
console.log('Root proxy files generated cleanly!');
