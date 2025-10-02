const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());

// --- JWT middleware (keep existing JWT-based auth) ---
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_me"; // will be set via functions config

// Update JWT middleware to also check cookies (admin_token or session_token)
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const cookieToken = req.cookies?.admin_token || req.cookies?.session_token || null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  // 1) Try verifying our application JWT first
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      source: "jwt",
    };
    return next();
  } catch (err) {
    // fall through to Firebase verification
  }

  // 2) If JWT verification failed, try verifying Firebase ID token
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      firebase: true,
      claims: decoded,
      source: "firebase",
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --- Routes (minimal placeholders; will be ported from existing code) ---
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Quotes
app.post("/quotes", async (req, res) => {
  try {
    const data = req.body;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    const doc = await db.collection("quotes").add(data);
    res.json({ id: doc.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/quotes/:id", requireAuth, async (req, res) => {
  try {
    const snap = await db.collection("quotes").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tickets
app.post("/tickets", async (req, res) => {
  try {
    const data = req.body;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    const doc = await db.collection("tickets").add(data);
    res.json({ id: doc.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Contacts
app.post("/contacts", async (req, res) => {
  try {
    const data = req.body;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    const doc = await db.collection("contacts").add(data);
    res.json({ id: doc.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin example (protected)
app.get("/admin/stats", requireAuth, async (req, res) => {
  try {
    const counts = {};
    for (const col of ["quotes", "tickets", "contacts"]) {
      const snap = await db.collection(col).get();
      counts[col] = snap.size;
    }
    res.json(counts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper to set secure cookies
function setCookie(res, name, value, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: maxAgeMs,
    path: "/",
  });
}

// Auth endpoints (keep JWT, minimal flow)
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    // TODO: Replace with Firestore user lookup + bcrypt compare
    const token = jwt.sign({ id: "user_stub", email }, JWT_SECRET, { expiresIn: "7d" });
    setCookie(res, "session_token", token);
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Replace the /auth/me route to use hybrid auth middleware and return unified user payload
app.get("/auth/me", requireAuth, (req, res) => {
  try {
    const user = req.user || null;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    // Return nested user object to match existing frontend usage
    res.json({ user: { id: user.id, email: user.email, role: user.role }, source: user.source });
  } catch (e) {
    res.status(401).json({ error: "Invalid session" });
  }
});

// Admin login to issue admin_token cookie (aligns with existing admin panel expectations)
app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    // TEMP: Default credentials match UI hint; replace with Firestore-based admin users
    const isDefault = username === "admin" && password === "lugvia2024";
    if (!isDefault) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "8h" });
    setCookie(res, "admin_token", token, 8 * 60 * 60 * 1000);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export single HTTP function mounted at /api
exports.api = functions.region("us-central1").https.onRequest(app);