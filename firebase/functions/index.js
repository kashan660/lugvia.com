const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- JWT middleware (keep existing JWT-based auth) ---
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_me"; // will be set via functions config

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ error: "Missing Authorization token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
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

// Export single HTTP function mounted at /api
exports.api = functions.region("us-central1").https.onRequest(app);