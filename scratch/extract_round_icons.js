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
    // Find style tags containing lp-round-icons
    const styleMatches = data.match(/<style[^>]*>[\s\S]*?lp-round-icons[\s\S]*?<\/style>/gi) || [];
    console.log("Style matches containing lp-round-icons:", styleMatches.length);
    styleMatches.forEach((s, idx) => {
      console.log(`\n=== Style Block ${idx + 1} ===`);
      console.log(s);
    });

    // Also let's extract the complete list of items in the round icons section
    const sectionMatch = data.match(/<div[^>]*class="[^"]*lp-round-icons[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/i) || data.match(/class="[^"]*lp-round-icons[^"]*"[\s\S]*?<\/section>/i);
    const roundItems = data.match(/<a[^>]+class="lp-round-icons__item"[^>]*>[\s\S]*?<\/a>/gi) || [];
    console.log("\nTotal round icon items:", roundItems.length);
    roundItems.forEach((it, i) => {
      const label = it.match(/<span[^>]+class="lp-round-icons__label"[^>]*>([\s\S]*?)<\/span>/i);
      const img = it.match(/src="([^"]+)"/i);
      const href = it.match(/href="([^"]+)"/i);
      console.log(`  [${i+1}] Label: ${label ? label[1].trim() : ""}, Href: ${href ? href[1] : ""}, Img: ${img ? img[1] : ""}`);
    });
  });
});
