/**
 * Multi-Tenant API Routes
 * Supports role-based access for Interns and Super Admins
 * Handles both primary and secondary Supabase instances
 */

const express = require("express");
const {
  getSupabaseClient,
  verifyTokenAndGetRole,
  hasRole,
  roleBasedAccessMiddleware
} = require("./supabaseClientMultiTenant");

const router = express.Router();

/**
 * Middleware to extract and verify user from token
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const userInfo = await verifyTokenAndGetRole(token);
    req.user = userInfo;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Authentication failed", error: err.message });
  }
};

/* ========================================
   DASHBOARD ENDPOINTS
   ======================================== */

/**
 * GET /api/multi-tenant/dashboard
 * Fetch personalized dashboard data based on user role
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const { userId, role, email, tenant } = req.user;
    const supabase = getSupabaseClient(tenant);

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // Prepare response based on role
    let dashboardData = {
      user: {
        id: userId,
        email: email,
        role: role,
        firstname: user?.first_name,
        lastname: user?.last_name,
        referralCode: user?.referral_code,
      }
    };

    if (role === "Intern") {
      // Fetch intern-specific stats
      const { data: donations, error: donError } = await supabase
        .from("donations")
        .select("*")
        .eq("referral_code", user?.referral_code)
        .eq("payment_status", "completed");

      if (!donError) {
        const totalRaised = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
        dashboardData.stats = {
          totalRaised,
          stipendAmount: totalRaised * 0.20,
          totalReferrals: donations?.length || 0,
          goalAmount: 30000,
          progressPercentage: (totalRaised / 30000) * 100,
        };
      }
    } else if (role === "Super Admin") {
      // Fetch admin-level stats
      const [campaignsRes, usersRes, donationsRes] = await Promise.all([
        supabase.from("campaigns").select("id"),
        supabase.from("users").select("id"),
        supabase.from("donations").select("amount").eq("payment_status", "completed"),
      ]);

      dashboardData.stats = {
        totalCampaigns: campaignsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalDonations: donationsRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        totalInterns: usersRes.data?.filter(u => u.role === "Intern").length || 0,
      };
    }

    res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ msg: "Error fetching dashboard", error: err.message });
  }
});

/* ========================================
   INTERN-ONLY ENDPOINTS
   ======================================== */

/**
 * GET /api/multi-tenant/intern/performance
 * Fetch intern's fundraising performance metrics
 */
router.get(
  "/intern/performance",
  authMiddleware,
  roleBasedAccessMiddleware(["Intern"]),
  async (req, res) => {
    try {
      const { userId, tenant } = req.user;
      const supabase = getSupabaseClient(tenant);

      const { data: user } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", userId)
        .single();

      const { data: donations } = await supabase
        .from("donations")
        .select("*")
        .eq("referral_code", user?.referral_code)
        .order("created_at", { ascending: false });

      res.json({
        success: true,
        data: {
          donations: donations || [],
          performanceMetrics: {
            thisMonth: donations?.filter(d => {
              const date = new Date(d.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth();
            }).length || 0,
            thisYear: donations?.filter(d => {
              const date = new Date(d.created_at);
              const now = new Date();
              return date.getFullYear() === now.getFullYear();
            }).length || 0,
          }
        }
      });
    } catch (err) {
      res.status(500).json({ msg: "Error fetching performance", error: err.message });
    }
  }
);

/**
 * GET /api/multi-tenant/intern/leaderboard
 * Fetch fundraising leaderboard (all interns)
 */
router.get("/intern/leaderboard", async (req, res) => {
  try {
    const supabase = getSupabaseClient("primary", false);

    const { data: donations } = await supabase
      .from("donations")
      .select("referral_code, amount")
      .eq("payment_status", "completed")
      .not("referral_code", "is", null);

    // Aggregate by referral code
    const totalsMap = {};
    (donations || []).forEach(d => {
      if (!totalsMap[d.referral_code]) {
        totalsMap[d.referral_code] = { totalAmount: 0, count: 0 };
      }
      totalsMap[d.referral_code].totalAmount += d.amount;
      totalsMap[d.referral_code].count += 1;
    });

    // Fetch user names
    const referralCodes = Object.keys(totalsMap);
    const { data: users } = await supabase
      .from("users")
      .select("first_name, last_name, referral_code")
      .in("referral_code", referralCodes);

    const leaderboard = referralCodes
      .map(rc => {
        const user = users?.find(u => u.referral_code === rc);
        return {
          name: user ? `${user.first_name} ${user.last_name}` : "Unknown",
          referralCode: rc,
          totalAmount: totalsMap[rc].totalAmount,
          referralCount: totalsMap[rc].count,
          rank: 0, // Will be assigned after sorting
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching leaderboard", error: err.message });
  }
});

/* ========================================
   SUPER ADMIN ENDPOINTS
   ======================================== */

/**
 * GET /api/multi-tenant/admin/interns
 * Fetch all interns with their metrics
 */
router.get(
  "/admin/interns",
  authMiddleware,
  roleBasedAccessMiddleware(["Super Admin", "Admin"]),
  async (req, res) => {
    try {
      const { tenant } = req.user;
      const supabase = getSupabaseClient(tenant);

      const { data: interns } = await supabase
        .from("users")
        .select("*")
        .eq("role", "Intern");

      // Fetch donation stats for each intern
      const internsWithStats = await Promise.all(
        (interns || []).map(async (intern) => {
          const { data: donations } = await supabase
            .from("donations")
            .select("amount")
            .eq("referral_code", intern.referral_code)
            .eq("payment_status", "completed");

          const totalRaised = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
          return {
            ...intern,
            totalRaised,
            stipendAmount: totalRaised * 0.20,
            referralCount: donations?.length || 0,
          };
        })
      );

      res.json({ success: true, data: internsWithStats });
    } catch (err) {
      res.status(500).json({ msg: "Error fetching interns", error: err.message });
    }
  }
);

/**
 * GET /api/multi-tenant/admin/campaigns
 * Fetch all campaigns with performance metrics
 */
router.get(
  "/admin/campaigns",
  authMiddleware,
  roleBasedAccessMiddleware(["Super Admin", "Admin"]),
  async (req, res) => {
    try {
      const { tenant } = req.user;
      const supabase = getSupabaseClient(tenant);

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      res.json({ success: true, data: campaigns });
    } catch (err) {
      res.status(500).json({ msg: "Error fetching campaigns", error: err.message });
    }
  }
);

/**
 * GET /api/multi-tenant/admin/analytics
 * Fetch comprehensive analytics for admins
 */
router.get(
  "/admin/analytics",
  authMiddleware,
  roleBasedAccessMiddleware(["Super Admin"]),
  async (req, res) => {
    try {
      const { tenant } = req.user;
      const supabase = getSupabaseClient(tenant);

      const [campaigns, interns, donations] = await Promise.all([
        supabase.from("campaigns").select("*"),
        supabase.from("users").select("*").eq("role", "Intern"),
        supabase.from("donations").select("*").eq("payment_status", "completed"),
      ]);

      const totalDonations = donations.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const donationsByMonth = {};
      
      donations.data?.forEach(d => {
        const month = new Date(d.created_at).toLocaleString("default", { month: "short" });
        donationsByMonth[month] = (donationsByMonth[month] || 0) + d.amount;
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalCampaigns: campaigns.data?.length || 0,
            totalInterns: interns.data?.length || 0,
            totalDonations,
            averageDonation: donations.data?.length > 0 ? totalDonations / donations.data.length : 0,
          },
          donationsByMonth,
          topPerformers: interns.data
            ?.map(intern => {
              const internDonations = donations.data?.filter(d => d.referral_code === intern.referral_code);
              return {
                name: `${intern.first_name} ${intern.last_name}`,
                totalRaised: internDonations?.reduce((sum, d) => sum + d.amount, 0) || 0,
              };
            })
            .sort((a, b) => b.totalRaised - a.totalRaised)
            .slice(0, 5),
        }
      });
    } catch (err) {
      res.status(500).json({ msg: "Error fetching analytics", error: err.message });
    }
  }
);

module.exports = router;
