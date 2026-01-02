import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContent";
import authService from "../../services/authService";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(user, token);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
      toast.error("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className=" absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-[length:16px_16px] opacity-10 " />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-300 shadow-sm mb-5">
              <BookOpen className="" strokeWidth={1.95} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Welcome Back:)
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                <label className="">Email</label>
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
                    <Lock className="h-5 w-5 " strokeWidth={1.8}></Lock>
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
                      Signing in ...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                        strokeWidth={2.5}
                      />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>

          {/*footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?
              <Link
                to="/register "
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/*fixed footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          All rights reserved
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
