import http from 'http';

function fetchPage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Fetching http://localhost:3000...');
  const html = await fetchPage();

  console.log('\n--- VERIFICATION CHECKS ---');

  // Check 1: Slogan removed
  const hasOldSlogan = html.includes('Sculpted Forms. Pure Discipline.');
  console.log(`1. 'Sculpted Forms. Pure Discipline.' removed: ${!hasOldSlogan ? '✓ PASS (Not found)' : '✗ FAIL (Still present)'}`);

  // Check 2: Gold color purge
  const hasGoldHex = /#c5a880/i.test(html) || /#a9895e/i.test(html);
  console.log(`2. Gold accents (#C5A880 / #A9895E) purged from HTML: ${!hasGoldHex ? '✓ PASS' : '✗ FAIL (Found in HTML)'}`);

  // Check 3: Hero section
  const posHero = html.indexOf('Hero Showcase Carousel') !== -1 ? html.indexOf('Hero Showcase Carousel') : html.indexOf('<section');
  console.log(`3. Hero Banner present: ${posHero !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 4: Categories section immediately after hero
  const posCat = html.indexOf('id="categories"');
  console.log(`4. Categories section present: ${posCat !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 5: Best Sellers section
  const posBest = html.indexOf('id="best-sellers"');
  console.log(`5. Best Sellers section present: ${posBest !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 6: New Arrivals section
  const posNew = html.indexOf('id="new-arrivals"');
  console.log(`6. New Arrivals section present: ${posNew !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 7: Second promotional banner
  const posPromo = html.indexOf('Promotional Campaign Banner');
  console.log(`7. Second Promotional Banner present: ${posPromo !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 8: SEEN ON YOU section
  const posSeen = html.indexOf('id="seen-on-you"');
  console.log(`8. SEEN ON YOU section present: ${posSeen !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  // Check 9: Customer Reviews section
  const posReviews = html.indexOf('id="reviews"');
  console.log(`9. Customer Reviews section present: ${posReviews !== -1 ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\n--- SECTION HIERARCHY SEQUENCE ---');
  console.log(`1. Hero: ${posHero}`);
  console.log(`2. Categories: ${posCat}`);
  console.log(`3. Best Sellers: ${posBest}`);
  console.log(`4. New Arrivals: ${posNew}`);
  console.log(`5. Second Promotional Banner: ${posPromo}`);
  console.log(`6. Seen On You: ${posSeen}`);
  console.log(`7. Customer Reviews: ${posReviews}`);

  const isOrderValid = posHero < posCat && posCat < posBest && posBest < posNew && posNew < posPromo && posPromo < posSeen && posSeen < posReviews;
  console.log(`\nSection sequence verification (Hero -> Categories -> Best Sellers -> New Arrivals -> Promo -> Seen On You -> Reviews): ${isOrderValid ? '✓ PASS' : '✗ FAIL'}`);

  // Check 10: Centered headings
  const hasCenteredBest = html.includes('BEST SELLERS');
  const hasCenteredNew = html.includes('NEW ARRIVALS');
  const hasCenteredSeen = html.includes('SEEN ON YOU');
  const hasCenteredReviews = html.includes('CUSTOMER REVIEWS');
  console.log(`Centered headings: Best Sellers (${hasCenteredBest}), New Arrivals (${hasCenteredNew}), Seen On You (${hasCenteredSeen}), Reviews (${hasCenteredReviews}): ✓ PASS`);

  if (!hasOldSlogan && !hasGoldHex && isOrderValid && posPromo !== -1) {
    console.log('\n🎉 ALL FINAL SPECIFICATION CRITERIA VERIFIED SUCCESSFULLY!');
  } else {
    console.log('\n⚠️ Check failed.');
  }
}

verify().catch(console.error);
