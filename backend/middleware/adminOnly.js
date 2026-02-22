import { getSupabaseAdmin } from "../lib/supabase.js";

const adminOnly = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();

    // req.user.id already set by protect middleware
    const { data: profile, error } = await supabase
      .from("profiles") // or users table
      .select("role")
      .eq("id", req.user.id)
      .maybeSingle();
    console.log("USER:", req.user.id);
    console.log("PROFILE:", profile);
    if (error || !profile) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admins only",
      });
    }

    next();
  } catch (err) {
    console.error("Admin check failed:", err);
    res.status(500).json({
      success: false,
      error: "Authorization error",
    });
  }
};

export default adminOnly;
