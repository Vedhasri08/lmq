import { getSupabaseAuth } from "../lib/supabase.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🔴 No auth header");
      return res.status(401).json({
        success: false,
        error: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    const supabase = getSupabaseAuth();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.log("🔴 Invalid token");
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.app_metadata?.role || "user", // 🔥 THIS LINE
    };

    next();
  } catch (err) {
    console.error("🔴 Auth middleware crash:", err);
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};

export default protect;
