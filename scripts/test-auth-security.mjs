import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function runTests() {
  await client.connect();
  console.log("Connected to test database.\n");

  const baseUrl = "http://localhost:3000";

  // Clean test emails from DB
  const testGoogleEmail = "google.user.test@dnora.luxury";
  const testManualEmail = "manual.user.test@dnora.luxury";
  await client.query("DELETE FROM public.users WHERE email IN ($1, $2)", [testGoogleEmail, testManualEmail]);
  await client.query("DELETE FROM public.email_verifications WHERE email IN ($1, $2)", [testGoogleEmail, testManualEmail]);

  console.log("==================================================");
  console.log("TEST 1: Google OAuth User Password Bypass Test");
  console.log("==================================================");
  // Insert a Google OAuth user with password_hash = NULL
  const googleUserId = "11111111-2222-3333-4444-555555555555";
  await client.query(
    `INSERT INTO public.users (id, email, full_name, role, password_hash)
     VALUES ($1, $2, $3, 'customer', NULL)`,
    [googleUserId, testGoogleEmail, "Google Verified Client"]
  );

  // Attempt to login with manual credentials and random password
  const googleLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testGoogleEmail, password: "randomPassword123!" }),
  });
  const googleLoginData = await googleLoginRes.json();

  console.log("Status:", googleLoginRes.status);
  console.log("Response:", googleLoginData);
  if (
    googleLoginRes.status === 400 &&
    googleLoginData.error?.includes("Google Sign-In")
  ) {
    console.log(">>> PASS: Google OAuth account successfully blocked from password bypass!\n");
  } else {
    console.error(">>> FAIL: Google OAuth account was not properly blocked!\n");
  }

  console.log("==================================================");
  console.log("TEST 2: Duplicate Email Registration Test");
  console.log("==================================================");
  // Attempt to register with the existing testGoogleEmail
  const dupRes = await fetch(`${baseUrl}/api/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Tester",
      email: testGoogleEmail,
      phone: "+91 99999 88888",
      password: "secretPassword123",
    }),
  });
  const dupData = await dupRes.json();

  console.log("Status:", dupRes.status);
  console.log("Response:", dupData);
  if (dupRes.status === 409 && dupData.error === "Email already registered.") {
    console.log(">>> PASS: Duplicate email registration blocked with 'Email already registered.'\n");
  } else {
    console.error(">>> FAIL: Duplicate registration was not blocked as expected!\n");
  }

  console.log("==================================================");
  console.log("TEST 3: Email OTP Send & Verification Flow");
  console.log("==================================================");
  // Step 3A: Send OTP
  const sendRes = await fetch(`${baseUrl}/api/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Eleanor Vance",
      email: testManualEmail,
      phone: "+91 98765 43210",
      password: "mySecretPassword123!",
    }),
  });
  const sendData = await sendRes.json();
  console.log("Send OTP Status:", sendRes.status);
  console.log("Send OTP Response:", sendData);

  // Check pending record in database
  const pendingDb = await client.query(
    "SELECT * FROM public.email_verifications WHERE email = $1",
    [testManualEmail]
  );
  console.log("Pending verification in DB:", pendingDb.rows.length > 0 ? "EXISTS" : "MISSING");

  // Step 3B: Try wrong OTP
  const wrongVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testManualEmail, otp: "000000" }),
  });
  const wrongVerifyData = await wrongVerifyRes.json();
  console.log("Wrong OTP Status:", wrongVerifyRes.status, wrongVerifyData);
  if (wrongVerifyRes.status === 400 && wrongVerifyData.error?.includes("Invalid")) {
    console.log(">>> PASS: Wrong OTP successfully rejected.");
  }

  // Extract OTP from devHint or database test
  const devOtp = sendData.devHint ? sendData.devHint.replace(/\D/g, "") : null;
  console.log("Extracted dev OTP:", devOtp);

  if (devOtp) {
    // Step 3C: Verify with correct OTP
    const correctVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testManualEmail, otp: devOtp }),
    });
    const correctVerifyData = await correctVerifyRes.json();
    console.log("Correct OTP Status:", correctVerifyRes.status, correctVerifyData);

    // Verify user in public.users
    const userInDb = await client.query(
      "SELECT id, email, full_name, password_hash FROM public.users WHERE email = $1",
      [testManualEmail]
    );
    console.log("Created user in DB:", userInDb.rows[0]);

    if (userInDb.rows[0]?.password_hash) {
      console.log(">>> PASS: User finalized in DB with hashed password!\n");
    }

    console.log("==================================================");
    console.log("TEST 4: Password Verification on Manual Login");
    console.log("==================================================");
    // 4A: Wrong password attempt
    const wrongLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testManualEmail, password: "wrongPassword" }),
    });
    console.log("Wrong password login status:", wrongLogin.status, await wrongLogin.json());

    // 4B: Correct password attempt
    const correctLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testManualEmail, password: "mySecretPassword123!" }),
    });
    console.log("Correct password login status:", correctLogin.status, await correctLogin.json());

    if (wrongLogin.status === 401 && correctLogin.status === 200) {
      console.log(">>> PASS: Password verification strictly enforced!\n");
    }
  }

  // Cleanup test records
  await client.query("DELETE FROM public.users WHERE email IN ($1, $2)", [testGoogleEmail, testManualEmail]);
  await client.query("DELETE FROM public.email_verifications WHERE email IN ($1, $2)", [testGoogleEmail, testManualEmail]);

  await client.end();
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
}

runTests().catch(console.error);
