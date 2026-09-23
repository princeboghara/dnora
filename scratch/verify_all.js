const http = require("http");

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    }).on("error", reject);
  });
}

async function verify() {
  console.log("=== VERIFYING STOREFRONT & APIS ===");
  
  // 1. Check Storefront SSR
  const home = await fetchUrl("http://localhost:3000/");
  console.log("Storefront HTTP Status:", home.status);
  if (home.status === 200) {
    const hasNav = home.body.includes("HANDBAGS") || home.body.includes("TOTE BAGS") || home.body.includes("SHOULDER BAGS");
    console.log("Storefront SSR contains live navigation categories:", hasNav);
    const hasHero = home.body.includes("hero-banner") || home.body.includes("res.cloudinary.com");
    console.log("Storefront SSR contains hero banner assets:", hasHero);
  }

  // 2. Check Heroes API
  const heroesRes = await fetchUrl("http://localhost:3000/api/heroes");
  console.log("\nHeroes API Status:", heroesRes.status);
  if (heroesRes.status === 200) {
    const json = JSON.parse(heroesRes.body);
    console.log(`Returned ${json.banners?.length} active hero banners`);
    json.banners?.forEach((b, i) => {
      console.log(`  [${i+1}] ${b.title}: media_type=${b.media_type}, button_text=${b.button_text || '(NONE - whole banner clickable)'}`);
    });
  }

  // 3. Check Navigation API
  const navRes = await fetchUrl("http://localhost:3000/api/navigation");
  console.log("\nNavigation API Status:", navRes.status);
  if (navRes.status === 200) {
    const json = JSON.parse(navRes.body);
    console.log(`Returned ${json.items?.length} navigation items:`);
    json.items?.forEach((it) => {
      console.log(`  - ${it.label} (${it.href}) [${it.submenus?.length || 0} submenus]`);
    });
  }
}

verify().catch(console.error);
