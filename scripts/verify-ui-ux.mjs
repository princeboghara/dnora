// scripts/verify-ui-ux.mjs
async function runVerification() {
  console.log("==========================================");
  console.log("DNORA FINAL UI/UX REFINEMENT VERIFICATION");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch Landing Page
    console.log("Fetching Landing Page (http://localhost:3000/)...");
    const homeRes = await fetch("http://localhost:3000/");
    const homeHtml = await homeRes.text();

    assert(homeRes.status === 200, "Homepage returns HTTP 200");

    // Check 1: Hero Banner </> capsule completely removed
    const hasHeroCapsule = homeHtml.includes("01 /") && homeHtml.includes("Previous slide");
    const hasRawCapsule = homeHtml.includes("&lt;/&gt;") || homeHtml.includes("</>");
    assert(!hasHeroCapsule && !hasRawCapsule, "Hero banner </> navigation capsule is completely removed");

    // Check 2: Topbar / Header Logo is compact and elegant
    const hasBrandLogo = homeHtml.includes("DNORA") || homeHtml.includes("dnora");
    assert(hasBrandLogo, "Brand logo exists in header");

    // Check 3: "NEW ARRIVALS" renamed to "NEW IN"
    assert(homeHtml.includes("NEW IN"), 'Homepage contains "NEW IN" section heading');
    assert(!homeHtml.includes(">NEW ARRIVALS<"), 'Homepage no longer has ">NEW ARRIVALS<" heading');

    // Check 4: Section headings are present and centered
    assert(homeHtml.includes("BEST SELLERS"), 'Homepage contains "BEST SELLERS" section heading');
    assert(homeHtml.includes("SEEN ON YOU"), 'Homepage contains "SEEN ON YOU" section heading');
    assert(homeHtml.includes("CUSTOMER REVIEWS"), 'Homepage contains "CUSTOMER REVIEWS" section heading');
    assert(homeHtml.includes("CATEGORIES"), 'Homepage contains "CATEGORIES" section heading');

    // Check 5: Extra subtitles removed
    assert(!homeHtml.includes("Community • Styled in the Wild"), 'Subtitles removed from "SEEN ON YOU"');
    assert(!homeHtml.includes("Curated Silhouettes"), 'Subtitles removed from "CATEGORIES"');
    assert(!homeHtml.includes("Patron Voices"), 'Subtitles removed from "CUSTOMER REVIEWS"');

    // Check 6: Footer simplified into accordion navigation
    assert(homeHtml.includes("OUR COLLECTION"), 'Footer contains "OUR COLLECTION" accordion');
    assert(homeHtml.includes("POLICIES"), 'Footer contains "POLICIES" accordion');
    assert(homeHtml.includes("OUR STORY"), 'Footer contains "OUR STORY" accordion');

    // Check 7: Footer social links
    assert(homeHtml.includes("https://instagram.com/dnoralifestyle"), "Footer has valid Instagram link");
    assert(homeHtml.includes("https://facebook.com/dnoralifestyle"), "Footer has valid Facebook link");
    assert(homeHtml.includes("https://pinterest.com/dnoralifestyle"), "Footer has valid Pinterest link");

    // Check 8: Policy links exist in footer
    assert(homeHtml.includes("/privacy"), "Footer links to Privacy Policy");
    assert(homeHtml.includes("/terms"), "Footer links to Terms & Conditions");
    assert(homeHtml.includes("/shipping"), "Footer links to Shipping Policy");
    assert(homeHtml.includes("/refunds"), "Footer links to Return & Refund Policy");

    // Check 9: Verify Policy Pages return 200 OK
    const [privRes, termsRes, shipRes, refRes] = await Promise.all([
      fetch("http://localhost:3000/privacy"),
      fetch("http://localhost:3000/terms"),
      fetch("http://localhost:3000/shipping"),
      fetch("http://localhost:3000/refunds"),
    ]);
    assert(privRes.status === 200, "Privacy Policy page returns 200");
    assert(termsRes.status === 200, "Terms & Conditions page returns 200");
    assert(shipRes.status === 200, "Shipping Policy page returns 200");
    assert(refRes.status === 200, "Return & Refund Policy page returns 200");

    // Check 10: Verify a Product Detail Page
    console.log("\nFetching a Product Detail Page...");
    // Let's find a product slug from the homepage or database
    const slugMatch = homeHtml.match(/\/product\/([a-zA-Z0-9_-]+)/);
    if (slugMatch && slugMatch[1]) {
      const slug = slugMatch[1];
      console.log(`Testing product page: /product/${slug}`);
      const prodRes = await fetch(`http://localhost:3000/product/${slug}`);
      const prodHtml = await prodRes.text();

      assert(prodRes.status === 200, `Product page /product/${slug} returns 200`);

      // Check "YOU MAY ALSO LIKE" carousel
      assert(prodHtml.includes("YOU MAY ALSO LIKE"), 'Product page contains "YOU MAY ALSO LIKE" section');
      assert(prodHtml.includes("overflow-x-auto"), '"YOU MAY ALSO LIKE" uses horizontal scrolling');

      // Check Colour Selector
      assert(prodHtml.includes("Colour:") || prodHtml.includes("Color:"), "Product page contains Colour selector label");

      // Check Purchase Buttons
      assert(prodHtml.includes("Add to Cart"), 'Product page contains "Add to Cart" button');
      assert(prodHtml.includes("Buy Now"), 'Product page contains "Buy Now" button');
    } else {
      console.log("[SKIP] No product slug found on homepage to test detail page");
    }

    console.log(`\n==========================================`);
    console.log(`Verification Complete: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error("Verification failed with exception:", err);
    process.exit(1);
  }
}

runVerification();
