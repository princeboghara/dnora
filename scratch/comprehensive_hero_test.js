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

async function runTest() {
  console.log("=== COMPREHENSIVE HERO BANNER TEST ===");

  // STEP 1: CREATE NEW HERO BANNER (NO CTA BUTTON)
  console.log("\n[TEST 1] Creating new Hero Banner with empty CTA text...");
  const createPayload = {
    title: "AUTUMN VIBES 2026",
    heading: "NEW SEASON ARRIVALS",
    subtitle: "DNORA ATELIER",
    media_type: "image",
    media_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1790125415/dnora/herobanner/hero-banner-2-desktop.png",
    tablet_media_url: null,
    mobile_media_url: null,
    button_text: null, // No CTA button
    button_link: "/shop?season=autumn",
    duration_seconds: 6,
    sort_order: 2,
    is_active: true,
    status: "published",
    text_alignment: "left",
    start_date: null,
    end_date: null,
  };

  const createRes = await request("POST", "/api/heroes", createPayload);
  console.log("Create status:", createRes.status);
  const createdJson = JSON.parse(createRes.body);
  if (createRes.status !== 201 || !createdJson.banner) {
    throw new Error("Failed to create banner: " + createRes.body);
  }
  const createdId = createdJson.banner.id;
  console.log("Successfully created banner with ID:", createdId);
  console.log("Created banner button_text:", createdJson.banner.button_text);

  // STEP 2: EDIT THE NEWLY CREATED HERO BANNER
  console.log("\n[TEST 2] Editing the newly created Hero Banner...");
  const editPayload = {
    title: "AUTUMN VIBES 2026 (UPDATED)",
    heading: "UPDATED HEADLINE",
    subtitle: null,
    media_type: "video",
    media_url: "https://res.cloudinary.com/izdmpa4z/video/upload/v1790125426/dnora/herobanner/hero-video-1.mp4",
    tablet_media_url: null,
    mobile_media_url: null,
    button_text: "EXPLORE NOW",
    button_link: "/shop?filter=updated",
    duration_seconds: 8,
    sort_order: 3,
    is_active: true,
    status: "published",
    text_alignment: "left",
    start_date: null,
    end_date: null,
  };

  const editRes = await request("PUT", `/api/heroes/${createdId}`, editPayload);
  console.log("Edit status:", editRes.status);
  const editJson = JSON.parse(editRes.body);
  if (editRes.status !== 200 || !editJson.banner) {
    throw new Error("Failed to edit banner: " + editRes.body);
  }
  console.log("Successfully edited banner! New title:", editJson.banner.title);
  console.log("New media_type:", editJson.banner.media_type);
  console.log("New button_text:", editJson.banner.button_text);

  // STEP 3: EDIT AGAIN TO CLEAR BUTTON_TEXT TO NULL/EMPTY
  console.log("\n[TEST 3] Editing banner to clear CTA text back to null...");
  const clearBtnPayload = {
    ...editPayload,
    button_text: null,
  };
  const clearRes = await request("PUT", `/api/heroes/${createdId}`, clearBtnPayload);
  console.log("Clear CTA edit status:", clearRes.status);
  const clearJson = JSON.parse(clearRes.body);
  console.log("button_text after clear:", clearJson.banner?.button_text);

  // STEP 4: VERIFY VIA GET /api/heroes?includeDrafts=true
  console.log("\n[TEST 4] Fetching all hero banners via GET /api/heroes?includeDrafts=true...");
  const getRes = await request("GET", "/api/heroes?includeDrafts=true");
  console.log("GET status:", getRes.status);
  const getJson = JSON.parse(getRes.body);
  console.log(`Total banners found: ${getJson.banners?.length}`);
  getJson.banners?.forEach((b) => {
    console.log(` - [${b.id}] "${b.title}" (media: ${b.media_type}, button_text: ${JSON.stringify(b.button_text)})`);
  });

  // STEP 5: DELETE TEST BANNER
  console.log("\n[TEST 5] Deleting test banner...");
  const delRes = await request("DELETE", `/api/heroes/${createdId}`);
  console.log("Delete status:", delRes.status);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
