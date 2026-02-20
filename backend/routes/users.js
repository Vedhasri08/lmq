import express from "express";
import supabaseAdmin from "../config/supabaseAdmin.js";

const router = express.Router();

/**
 * DELETE USER (ADMIN)
 * DELETE /api/users/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  console.log("🗑 Admin deleting user:", id);

  try {
    // Delete from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("❌ Supabase delete error:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // OPTIONAL: delete profile row if not cascading
    await supabaseAdmin.from("profiles").delete().eq("id", id);

    console.log("✅ User deleted successfully");

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 Server delete error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
