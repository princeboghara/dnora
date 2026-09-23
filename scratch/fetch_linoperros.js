const https = require("https");

https.get("https://www.linoperros.com/", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("HTML length:", data.length);
    // Find collection links and nearby images or text
    const collections = [...new Set(data.match(/\/collections\/[a-zA-Z0-9_-]+/g) || [])];
    console.log("Found collections:", collections);

    // Look for circular/bubble/story collection sections
    const matches = data.match(/<a[^>]+href="\/collections\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi) || [];
    console.log("Found collection anchor tags:", matches.length);
    matches.slice(0, 15).forEach((m, i) => {
      console.log(`\n[Anchor ${i+1}]:`, m.substring(0, 300));
    });
  });
}).on("error", console.error);
