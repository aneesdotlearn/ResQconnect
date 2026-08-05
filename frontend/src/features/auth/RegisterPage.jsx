import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/store/slices/authSlice";
import womenbg from "@/assets/login/women.png";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";

import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [pwErrors, setPwErrors] = useState([]);

  const validatePassword = (pw) => {
    const errs = [];
    if (pw.length < 8) errs.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errs.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errs.push("One lowercase letter");
    if (!/\d/.test(pw)) errs.push("One number");
    if (!/[@$!%*?&]/.test(pw)) errs.push("One special character (@$!%*?&)");
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (e.target.name === "password") setPwErrors(validatePassword(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validatePassword(form.password);
    if (errs.length > 0) {
      setPwErrors(errs);
      return;
    }
    const phone = form.phone.startsWith("+") ? form.phone : `+${form.phone}`;
    dispatch(registerUser({ ...form, phone }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">

      {/* Background */}
      <div className="absolute inset-0 " />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.18),transparent_45%)] " />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">

        <div className="grid w-full max-w-7xl overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl shadow-4xl lg:grid-cols-[1.15fr_.85fr]">

          {/* LEFT PANEL */}
          <div
            className="relative hidden lg:flex flex-col justify-center p-12 text-white bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{
              backgroundImage: `url(${womenbg})`,
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-gradientStart/85 via-surface/70 to-accent-500/35"></div>

            <div className="relative z-10">
              <div className="flex-1 flex flex-col justify-center">

                <h1 className="mt-8 text-6xl font-black leading-tight">
                  Join the
                  <br />
                  <span className="text-accent-500">
                    Safety Network.
                  </span>
                  <br />
                  Today.
                  <br />
                  <span className="text-sm text-accent-500" style={{ textTransform: "uppercase" }}>
                    _____________
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-lg text-white/85 leading-8">
                  Create your ResQconnect account to unlock instant SOS alerts,
                  AI-based danger prediction, emergency contact notification and
                  real-time GPS tracking — protection that's always on.
                </p>

              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative bg-white p-8 md:p-12">

            <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-accent-100 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-rose-200 blur-3xl" />

            <div className="relative">

              <div className="mb-8 flex items-center justify-between">
                <Logo size={46} showWordmark={false} className="" />
              </div>

              <h2 className="text-4xl font-black text-gray-900">
                Create <span className="text-accent-500">Account !</span>
              </h2>

              <p className="mt-4 text-gray-500 leading-7">
                Sign up to access AI-powered emergency protection, SOS alerts
                and your personal safety dashboard.
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">
                    <User size={18} className="mr-3 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">
                    <Mail size={18} className="mr-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number (E.164)
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">
                    <Phone size={18} className="mr-3 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+911234567890"
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">
                    <Lock size={18} className="mr-3 text-gray-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {form.password && pwErrors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pwErrors.map((e) => (
                        <li key={e} className="text-xs text-red-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-red-500 rounded-full" /> {e}
                        </li>
                      ))}
                    </ul>
                  )}
                  {form.password && pwErrors.length === 0 && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-green-500 rounded-full" /> Password looks strong
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || pwErrors.length > 0}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-surface-gradientStart via-accent-500 to-accent-300 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-20"
                        />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>

              <p className="mt-8 text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-accent-700 hover:text-accent-900"
                >
                  Sign In
                </Link>
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}