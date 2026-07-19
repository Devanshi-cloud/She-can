const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const jwt = require("jsonwebtoken");

// Middleware to authenticate user using JWT
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role, referral_code")
      .eq("id", decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ msg: "User not found" });

    req.user = {
      id: user.id,
      firstname: user.first_name,
      lastname: user.last_name,
      email: user.email,
      role: user.role,
      referralCode: user.referral_code
    };
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// GET /api/referral/stats - Get referral statistics for authenticated user
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { data: donations, error } = await supabase
      .from("donations")
      .select("amount, payment_status, created_at")
      .eq("referral_code", req.user.referralCode)
      .eq("payment_status", "completed");

    if (error) throw error;

    const totalRaised = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const referralCount = donations.length;
    const stipend = totalRaised * 0.2; // 20% of total raised

    // Get monthly breakdown
    const monthlyData = {};
    donations.forEach(d => {
      const date = new Date(d.created_at);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += parseFloat(d.amount || 0);
    });

    res.status(200).json({
      referralCode: req.user.referralCode,
      totalRaised,
      referralCount,
      stipend,
      monthlyData,
      internName: `${req.user.firstname} ${req.user.lastname}`,
      msg: "Referral statistics retrieved successfully"
    });
  } catch (err) {
    console.error('Error fetching referral stats:', err);
    res.status(500).json({ msg: "Server Error fetching referral stats", error: err.message });
  }
});

// GET /api/referral/leaderboard - Get top referrers leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    // Fetch all completed donations with referral codes
    const { data: donationRows, error: dError } = await supabase
      .from("donations")
      .select("referral_code, amount")
      .eq("payment_status", "completed")
      .not("referral_code", "is", null);

    if (dError) throw dError;

    if (!donationRows || !donationRows.length) {
      return res.status(200).json({ 
        leaderboard: [], 
        msg: "No donation data available for leaderboard" 
      });
    }

    // Aggregate totals by referral_code
    const totalsMap = {};
    donationRows.forEach(d => {
      const rc = d.referral_code;
      if (!totalsMap[rc]) {
        totalsMap[rc] = { totalAmount: 0, referralsCount: 0, stipend: 0 };
      }
      const amount = parseFloat(d.amount || 0);
      totalsMap[rc].totalAmount += amount;
      totalsMap[rc].referralsCount += 1;
      totalsMap[rc].stipend += amount * 0.2;
    });

    // Fetch user names for all referral codes
    const referralCodes = Object.keys(totalsMap);
    const { data: users, error: uError } = await supabase
      .from("users")
      .select("first_name, last_name, referral_code")
      .in("referral_code", referralCodes);

    if (uError) throw uError;

    // Build user lookup map
    const userMap = {};
    (users || []).forEach(u => {
      userMap[u.referral_code] = u;
    });

    // Build final leaderboard
    const formattedLeaderboard = referralCodes
      .map(rc => {
        const user = userMap[rc] || {};
        return {
          rank: 0, // Will be assigned after sorting
          name: user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : "Unknown Intern",
          referralCode: rc,
          totalRaised: totalsMap[rc].totalAmount,
          referralCount: totalsMap[rc].referralsCount,
          stipend: totalsMap[rc].stipend
        };
      })
      .sort((a, b) => b.totalRaised - a.totalRaised)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.status(200).json({ 
      leaderboard: formattedLeaderboard,
      msg: "Leaderboard retrieved successfully"
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ msg: "Server Error fetching leaderboard", error: err.message });
  }
});

// GET /api/referral/link - Get shareable referral link
router.get("/link", authMiddleware, async (req, res) => {
  try {
    const referralLink = `${process.env.APP_URL || 'http://localhost:3000'}/donate/${req.user.referralCode}`;
    
    res.status(200).json({
      referralCode: req.user.referralCode,
      referralLink,
      msg: "Referral link retrieved successfully"
    });
  } catch (err) {
    console.error('Error getting referral link:', err);
    res.status(500).json({ msg: "Server Error getting referral link", error: err.message });
  }
});

// GET /api/referral/details/:referralCode - Get referrer details (public)
router.get("/details/:referralCode", async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, phone")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ msg: "Referrer not found" });
    }

    // Get donation statistics
    const { data: donations, error: dError } = await supabase
      .from("donations")
      .select("amount, payment_status")
      .eq("referral_code", referralCode)
      .eq("payment_status", "completed");

    if (dError) throw dError;

    const totalRaised = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const referralCount = donations.length;

    res.status(200).json({
      referrerName: `${user.first_name} ${user.last_name}`,
      referralCode,
      totalRaised,
      referralCount,
      msg: "Referrer details retrieved successfully"
    });
  } catch (err) {
    console.error('Error fetching referrer details:', err);
    res.status(500).json({ msg: "Server Error fetching referrer details", error: err.message });
  }
});

// POST /api/referral/donation-callback - Called after successful payment to update referral stats
router.post("/donation-callback", async (req, res) => {
  try {
    const { referralCode, donationId, amount } = req.body;

    if (!referralCode || !donationId || !amount) {
      return res.status(400).json({ msg: "Missing required fields", missing: ["referralCode", "donationId", "amount"] });
    }

    // Update fundraiser stats (if exists)
    const { error: updateError } = await supabase
      .from("fundraisers")
      .update({
        total_raised: supabase.rpc('increment_raised_amount', { 
          referral_code: referralCode, 
          amount_increment: amount 
        })
      })
      .eq("referral_code", referralCode);

    if (updateError) {
      console.warn("Could not update fundraiser stats:", updateError.message);
    }

    res.status(200).json({ msg: "Referral stats updated successfully" });
  } catch (err) {
    console.error('Error in donation callback:', err);
    res.status(500).json({ msg: "Server Error processing donation callback", error: err.message });
  }
});

module.exports = router;
