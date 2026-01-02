import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { BookOpen, Mail, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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
    try {
      await authService.register(username, email, password);
      toast.success("Registered successfully! Please Login");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      toast.error("Failed to register. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className=" absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-[length:16px_16px] opacity-30 " />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-300 shadow-sm mb-5">
              <BookOpen className="" strokeWidth={1.95} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-slate-500 text-sm">Learn smarter. Start here.</p>
          </div>

          {/*form*/}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Username
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "username"
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                >
                  <User className="" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/*email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Email
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                >
                  <Mail className="h-5 w-5" strokeWidth={2} />{" "}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="name@mail.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-blue-500"
                      : "text-slate-400"
                  }`}
                >
                  <Lock className="h-5 w-5 " strokeWidth={1.8} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-600 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-12 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-blue-500/25 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {" "}
                {loading ? (
                  <>
                    {" "}
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account ...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </div>
          {/*footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-center text-sm text-slate-600">
              Already have an account?
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/*fixed footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
