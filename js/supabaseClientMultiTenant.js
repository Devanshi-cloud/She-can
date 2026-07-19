/**
 * Multi-Tenant Supabase Client Handler
 * Manages connections to primary and secondary Supabase instances
 * Supports role-based access for Interns and Super Admins
 */

const { createClient } = require("@supabase/supabase-js");

// Primary Supabase Instance (Main NGO tenant)
const primarySupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Secondary Supabase Instance (Optional - for multi-tenant support)
const secondarySupabase = process.env.SUPABASE_URL_2 && process.env.SUPABASE_SECRET_KEY_2
  ? createClient(
      process.env.SUPABASE_URL_2,
      process.env.SUPABASE_SECRET_KEY_2,
      {
        auth: {
          persistSession: false
        }
      }
    )
  : null;

// Public client for frontend (uses publishable key, session-based auth)
const publicSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: true
    }
  }
);

// Secondary public client
const secondaryPublicSupabase = process.env.SUPABASE_URL_2 && process.env.SUPABASE_PUBLISHABLE_KEY_2
  ? createClient(
      process.env.SUPABASE_URL_2,
      process.env.SUPABASE_PUBLISHABLE_KEY_2,
      {
        auth: {
          persistSession: true
        }
      }
    )
  : null;

/**
 * Get the appropriate Supabase client based on tenant and role
 * @param {string} tenant - 'primary' or 'secondary'
 * @param {boolean} usePublicKey - Whether to use public key (browser) or secret key (server)
 * @returns {object} Supabase client instance
 */
function getSupabaseClient(tenant = 'primary', usePublicKey = false) {
  if (tenant === 'secondary' && !secondarySupabase) {
    console.warn("Secondary Supabase tenant not configured. Falling back to primary.");
    return usePublicKey ? publicSupabase : primarySupabase;
  }

  if (tenant === 'secondary') {
    return usePublicKey ? secondaryPublicSupabase : secondarySupabase;
  }

  return usePublicKey ? publicSupabase : primarySupabase;
}

/**
 * Verify JWT and get user role from decoded token
 * @param {string} token - JWT token
 * @returns {object} Decoded user data with role
 */
async function verifyTokenAndGetRole(token, tenant = 'primary') {
  try {
    const supabase = getSupabaseClient(tenant);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error("Invalid or expired token");
    }

    // Fetch user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Could not fetch user profile");
    }

    return {
      userId: user.id,
      email: user.email,
      role: profile?.role || 'Intern',
      tenant
    };
  } catch (err) {
    console.error("Token verification error:", err.message);
    throw err;
  }
}

/**
 * Check if user has required role
 * @param {string} userRole - User's current role
 * @param {array} requiredRoles - Array of allowed roles
 * @returns {boolean} Whether user has required role
 */
function hasRole(userRole, requiredRoles = []) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
}

/**
 * Middleware to enforce role-based access
 * @param {array} allowedRoles - Array of roles that can access the route
 */
function roleBasedAccessMiddleware(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ msg: "No token provided" });
      }

      const userInfo = await verifyTokenAndGetRole(token);
      
      if (!hasRole(userInfo.role, allowedRoles)) {
        return res.status(403).json({ 
          msg: `Access denied. Required roles: ${allowedRoles.join(", ")}` 
        });
      }

      req.user = userInfo;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Authentication failed", error: err.message });
    }
  };
}

module.exports = {
  primarySupabase,
  secondarySupabase,
  publicSupabase,
  secondaryPublicSupabase,
  getSupabaseClient,
  verifyTokenAndGetRole,
  hasRole,
  roleBasedAccessMiddleware
};
