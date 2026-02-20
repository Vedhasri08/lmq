import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Mail, Lock, Brain } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f7f6] font-[Inter]">
      {/* LEFT HERO PANEL */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#020617] items-center justify-center overflow-hidden">
        {/* Radial gold glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(79,156,249,0.18)_0%,rgba(26,26,26,0)_70%)] pointer-events-none" />

        <div className="relative z-10 text-center px-12">
          {/* Logo */}
          <div
            className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-xl border border-[#4F9CF9]/30 bg-[#4F9CF9]/5
"
          >
            <Brain className="w-12 h-12 text-[#4F9CF9]" strokeWidth={1.2} />
          </div>

          <h1 className="text-4xl font-light tracking-widest text-white mb-4 uppercase">
            Organic{" "}
            <span className="font-bold text-[#4F9CF9]">Intelligence</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Nurturing the human element of technology through sophisticated
            learning systems.
          </p>

          {/* Divider */}
          <div className="mt-12 flex justify-center space-x-4">
            <div className="h-px w-12 bg-[#4F9CF9]/40 mt-3" />
            <div className="w-2 h-2 rounded-full bg-[#4F9CF9]" />
            <div className="h-px w-12 bg-[#4F9CF9]/40 mt-3" />
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-[#4F9CF9]">🧠</span>
              <span className="text-xl font-bold">Organic Intelligence</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500">
              Please enter your credentials to access your workspace.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900
    focus:ring-1 focus:ring-[#4F9CF9] focus:border-[#4F9CF9]
 outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900
    focus:ring-1 focus:ring-[#4F9CF9] focus:border-[#4F9CF9]
 outline-none transition"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 accent-[#4F9CF9]
"
              />
              <span>Keep me logged in for 30 days</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold shadow-lg shadow-[#1E293B]/25 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Don’t have an account?
              <Link
                to="/register"
                className="ml-1 font-bold text-[#4F9CF9] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-24 pt-8 border-t border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 flex justify-between">
            <span>© 2024 Organic Intelligence LMS</span>
            <span className="flex gap-6">
              <span className="hover:text-[#4F9CF9] cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-[#4F9CF9] cursor-pointer">
                Terms of Service
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
