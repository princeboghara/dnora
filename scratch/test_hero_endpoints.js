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
  console.log("1. Testing GET /api/heroes?includeDrafts=true");
  const getRes = await request("GET", "/api/heroes?includeDrafts=true");
  console.log("GET Status:", getRes.status);
  const getJson = JSON.parse(getRes.body);
  console.log("Found banners:", getJson.banners?.length);

  const existingBanner = getJson.banners?.[0];
  console.log("\n2. Testing POST /api/heroes (Create with empty button_text)");
  const createPayload = {
    title: "New Test Luxury Banner",
    heading: "",
    subtitle: "",
    media_type: "image",
    media_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1790125400/dnora/herobanner/hero-banner-1-desktop.png",
    tablet_media_url: "",
    mobile_media_url: "",
    button_text: "",
    button_link: "/shop",
    duration_seconds: 5,
    sort_order: 2,
    is_active: true,
    status: "published",
    text_alignment: "left",
  };
  const postRes = await request("POST", "/api/heroes", createPayload);
  console.log("POST Status:", postRes.status);
  console.log("POST Body:", postRes.body);

  if (existingBanner) {
    console.log(`\n3. Testing PUT /api/heroes/${existingBanner.id} (Edit existing)`);
    const updatePayload = {
      title: existingBanner.title + " (Edited)",
      heading: existingBanner.heading || "",
      subtitle: existingBanner.subtitle || "",
      media_type: existingBanner.media_type,
      media_url: existingBanner.media_url,
      button_text: "",
      button_link: existingBanner.button_link || "/shop",
      duration_seconds: existingBanner.duration_seconds || 5,
      sort_order: existingBanner.sort_order || 0,
      is_active: existingBanner.is_active,
      status: existingBanner.status,
      text_alignment: "left",
    };
    const putRes = await request("PUT", `/api/heroes/${existingBanner.id}`, updatePayload);
    console.log("PUT Status:", putRes.status);
    console.log("PUT Body:", putRes.body);
  }
}

test().catch(console.error);
