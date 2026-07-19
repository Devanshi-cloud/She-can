/**
 * submissionsRoutes.js - Contact / Volunteer Form Submissions
 *
 * Handles public form submissions (contact and volunteer applications)
 * stored in the Supabase `submissions` table.
 */

const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

/**
 * POST /api/submissions
 * Public — Save a contact or volunteer form submission
 * Body: { name, email, message }
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        name,
        email,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Server error saving submission." });
    }

    // Return Appwrite-compatible shape for the frontend
    res.status(201).json({
      $id: data.id,
      $createdAt: data.created_at,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Server error saving submission." });
  }
});

module.exports = router;
