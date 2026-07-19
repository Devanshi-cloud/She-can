/**
 * adminRoutes.js - Admin Management Routes
 *
 * Handles admin login, session verification, submissions management,
 * and admin appointment — all backed by Supabase.
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");

const JWT_SECRET = process.env.JWT_SECRET || "she_can_foundation_super_secret_key_2026";

// ────────────────────────────
// JWT Authentication Middleware
// ────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: Invalid Token" });
  }
};

// ────────────────────────────
// POST /api/admin/login
// ────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Fetch user from Supabase (only admins / super admins)
    const { data: user, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, password_hash, role")
      .eq("email", email.toLowerCase())
      .in("role", ["Admin", "Super Admin"])
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}`, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ────────────────────────────
// GET /api/admin/me
// ────────────────────────────
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    email: req.user.email,
    name: req.user.name,
  });
});

// ────────────────────────────
// GET /api/admin/submissions
// Fetch all public submissions (contact + volunteer)
// ────────────────────────────
router.get("/submissions", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return res.status(500).json({ message: "Server error fetching submissions." });
    }

    // Map to Appwrite-compatible shape for the frontend
    const documents = (data || []).map((row) => ({
      $id: row.id,
      $createdAt: row.created_at,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.created_at,
    }));

    res.json({ documents });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error fetching database entries." });
  }
});

// ────────────────────────────
// DELETE /api/admin/submissions/:id
// ────────────────────────────
router.delete("/submissions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ message: "Submission not found." });
    }

    res.json({ message: "Document deleted successfully", id });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Server error deleting entry." });
  }
});

// ────────────────────────────
// POST /api/admin/appoint
// Create a new admin user
// ────────────────────────────
router.post("/appoint", authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields (name, email, password) are required." });
    }

    // Check for existing user with this email
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate a unique referral code (even though admins may not use it)
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Split name into first / last
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const { data: newAdmin, error: insertError } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        referral_code: referralCode,
        role: "Admin",
        email_verified: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating admin:", insertError);
      return res.status(500).json({ message: "Server error appointing administrator." });
    }

    // Also log this appointment in the submissions table for audit trail
    await supabase.from("submissions").insert({
      name,
      email: email.toLowerCase(),
      message: `[TEAM MEMBER] Appointed as Admin`,
    });

    res.status(201).json({
      message: `Successfully appointed ${name} as a new Administrator!`,
      user: { name, email: email.toLowerCase() },
    });
  } catch (error) {
    console.error("Error appointing admin:", error);
    res.status(500).json({ message: "Server error appointing administrator." });
  }
});

module.exports = router;
