const http = require("http");
const crypto = require("crypto");

function signSessionToken(payload) {
  const secret = process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dnora-luxury-secret-key-fallback-replace-in-prod-v1";
  const dataStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(dataStr).digest("hex");
  return `${dataStr}.${signature}`;
}

const adminToken = signSessionToken({
  email: "admin@dnora.luxury",
  role: "admin",
  isAuthenticated: true,
  expiresAt: Date.now() + 86400000,
});

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : "";
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          Cookie: `dnora_admin_session=${adminToken}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, body: data });
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function test() {
  console.log("=== TESTING HEADING & SUBTITLE REMOVAL VIA API ===");

  // 1. Get first banner
  const getRes = await request("GET", "/api/heroes?includeDrafts=true");
  const getJson = JSON.parse(getRes.body);
  const banner = getJson.banners?.[0];
  if (!banner) throw new Error("No banner found to test");
  console.log("Initial banner:", { id: banner.id, heading: banner.heading, subtitle: banner.subtitle });

  // 2. Put text in heading & subtitle
  console.log("\n1. Setting heading and subtitle to 'AUTUMN LOOK' / 'PARIS FASHION'...");
  const setRes = await request("PUT", `/api/heroes/${banner.id}`, {
    ...banner,
    heading: "AUTUMN LOOK",
    subtitle: "PARIS FASHION",
  });
  console.log("Set status:", setRes.status);
  const setJson = JSON.parse(setRes.body);
  console.log("Set result:", { heading: setJson.banner?.heading, subtitle: setJson.banner?.subtitle });

  // 3. Clear heading & subtitle with null / empty string
  console.log("\n2. Removing heading and subtitle (sending null / empty string)...");
  const clearRes = await request("PUT", `/api/heroes/${banner.id}`, {
    ...banner,
    heading: null,
    subtitle: null,
  });
  console.log("Clear status:", clearRes.status);
  const clearJson = JSON.parse(clearRes.body);
  console.log("Clear result:", { heading: clearJson.banner?.heading, subtitle: clearJson.banner?.subtitle });

  if (clearJson.banner?.heading !== null || clearJson.banner?.subtitle !== null) {
    throw new Error("FAILED: Heading or Subtitle was NOT removed!");
  }

  // 4. Fetch via GET again to confirm DB persistence
  console.log("\n3. Re-fetching from DB via GET /api/heroes?includeDrafts=true...");
  const verifyRes = await request("GET", "/api/heroes?includeDrafts=true");
  const verifyJson = JSON.parse(verifyRes.body);
  const reloaded = verifyJson.banners?.find(b => b.id === banner.id);
  console.log("DB Reloaded:", { id: reloaded.id, heading: reloaded.heading, subtitle: reloaded.subtitle });

  if (reloaded.heading !== null || reloaded.subtitle !== null) {
    throw new Error("FAILED: DB still has heading or subtitle!");
  }

  console.log("\n SUCCESS: Heading and Subtitle cleanly removed and verified in DB!");
}

test().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
