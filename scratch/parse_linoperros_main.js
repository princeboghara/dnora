const fs = require("fs");
const https = require("https");

https.get("https://www.linoperros.com/", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    // Find section IDs or classes under <main id="MainContent">
    const mainMatch = data.match(/<main[^>]*id="MainContent"[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) {
      console.log("No MainContent found");
      return;
    }
    const mainHtml = mainMatch[1];
    console.log("MainContent HTML length:", mainHtml.length);

    // Look for sections
    const sections = mainHtml.match(/<div[^>]+id="shopify-section-[^"]+"[^>]*>/g) || [];
    console.log("Sections found in main:", sections);

    // Look for circular / circle / rounded image elements or story bubbles
    const circularMatches = mainHtml.match(/<a[^>]+href="\/collections\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi) || [];
    console.log("Collection links in main:", circularMatches.length);
    circularMatches.slice(0, 10).forEach((m, idx) => {
      console.log(`\n--- Item ${idx + 1} ---`);
      console.log(m);
    });
  });
});
