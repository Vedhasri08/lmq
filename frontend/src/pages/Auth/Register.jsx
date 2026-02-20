import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { BookOpen, Mail, Lock, ArrowRight, User, Brain } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username, // stored in user_metadata
        },
      },
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Account created! Please login.");
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f7f6] font-[Inter]">
      {/* LEFT HERO PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A] text-white p-16 flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#0F172A]/80 to-[#4F9CF9]/20" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border border-[#4F9CF9]/30 bg-[#4F9CF9]/5
 flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-[#4F9CF9]" strokeWidth={1.2} />
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            Organic Intelligence
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-semibold leading-tight mb-6">
            Nurturing the future of{" "}
            <span className="text-[#4F9CF9] italic">learning</span>
            <br />
            through human-centric AI.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            The harmony of nature and artificial intelligence in modern
            education designed for organic growth.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-10">
          {" "}
          <p className="absolute bottom-6 left-6 text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4F9CF9] rounded-full" />
            LMS PLATFORM v2.4
          </p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#4F9CF9] rounded-lg flex items-center justify-center">
              <Brain className="w-12 h-12 text-[#4F9CF9]" strokeWidth={1.2} />
            </div>
            <span className="text-xl font-semibold">Organic Intelligence</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join Organic Intelligence
            </h2>
            <p className="text-gray-500">
              Start your journey into learning today.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#4F9CF9]/40 focus:border-[#4F9CF9] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#4F9CF9]/40 focus:border-[#4F9CF9] transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#4F9CF9]/40 focus:border-[#4F9CF9] transition"
              />
              <p className="mt-2 text-xs text-gray-400">
                Must be at least 6 characters long.
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 accent-[#4F9CF9]
"
                required
              />
              <span>
                I agree to the{" "}
                <span className="text-[#4F9CF9] font-medium cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#4F9CF9] font-medium cursor-pointer">
                  Privacy Policy
                </span>
                .
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold shadow-lg shadow-[#1E293B]/25 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?
              <Link
                to="/login"
                className="text-[#4F9CF9] font-semibold hover:underline ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>

          <p className="mt-14 text-[10px] text-gray-400 uppercase tracking-widest text-center">
            © 2026 Organic Intelligence · Learning Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
