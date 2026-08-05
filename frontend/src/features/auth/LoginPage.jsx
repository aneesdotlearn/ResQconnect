import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/slices/authSlice";
import womenbg from "@/assets/login/women.png";
// import { login-bg } from "..assets/bg/logo-bg.png";
import illustrator from "@/assets/login/illustrator.png";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  MapPin,
  Zap,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
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
            <div className="flex items-center justify-between">
              {/* <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 backdrop-blur hover:bg-white/20 transition"
              >
                <ArrowLeft size={18} />
                Home
              </Link> */}
              
                {/* <Logo size={46} showWordmark={false}  className=""/> */}

              {/* <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur">
                <Shield size={16} />
                AI Powered Protection
              </span> */}
            </div>
            <div className="flex-1 flex flex-col justify-center">

              

              <h1 className="mt-8 text-6xl font-black leading-tight">

                Stay Safe.

                <br />
                <span className="text-accent-500 ">
                Stay Connected.
                </span>
                <br />

                Anytime.
                <br/>
              <span className="text-sm text-accent-500" style={{ textTransform: 'uppercase' }}>_____________</span>

              </h1>

              <p className="mt-6 max-w-xl text-lg text-white/85 leading-8">

                ResQconnect is an AI-Based Women Safety & Emergency Response App
                providing instant SOS alerts, AI danger prediction, emergency
                contact notification and real-time GPS tracking to keep you
                protected 24×7.

              </p>

            </div>
            {/* 
            <div className="grid grid-cols-3 gap-5">

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur border border-white/20">

                <Zap className="mb-4 text-red-300" size={28} />

                <h3 className="font-bold text-lg">

                  SOS

                </h3>

                <p className="text-sm text-white/70 mt-2">

                  Instant Emergency Alerts

                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur border border-white/20">

                <MapPin className="mb-4 text-red-300" size={28} />

                <h3 className="font-bold text-lg">

                  GPS

                </h3>

                <p className="text-sm text-white/70 mt-2">

                  Live Location Tracking

                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur border border-white/20">

                <Shield className="mb-4 text-red-300" size={28} />

                <h3 className="font-bold text-lg">

                  AI

                </h3>

                <p className="text-sm text-white/70 mt-2">

                  Danger Prediction

                </p>

              </div>

            </div> */}

            {/* <div className="absolute right-10 top-10 rounded-2xl bg-white p-5 shadow-2xl">

              <p className="text-sm text-red-600 font-semibold">

                Emergency

              </p>

              <p className="text-3xl font-black text-gray-900">

                24 × 7

              </p>

            </div> */}
            </div>

          </div>

          {/* RIGHT PANEL */}

          <div className="relative bg-white p-8 md:p-12">

            <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-accent-100 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-rose-200 blur-3xl"  />

            <div className="relative">

              <div className="mb-8 flex items-center justify-between">

                {/* <Logo size={46} showWordmark={false}  className=""/>

                <Link
                  to="/register"
                  className="rounded-xl border border-red-200 px-5 py-2 font-semibold text-red-700 hover:bg-red-50"
                >
                  Register
                </Link> */}
                <Logo size={46} showWordmark={false}  className=""/>


              </div>

              <h2 className="text-4xl font-black text-gray-900">

                Welcome <span className="text-accent-500">Back !</span>

              </h2>

              <p className="mt-4 text-gray-500 leading-7">

                Sign in to access AI-powered emergency protection,
                SOS alerts and your personal safety dashboard.

              </p>

              {/* <div className="mt-8 space-y-3 text-sm text-gray-600">

                <div>✓ SOS Emergency Alerts</div>

                <div>✓ Live Location Tracking</div>

                <div>✓ Emergency Contact Notification</div>

                <div>✓ AI Danger Prediction</div>

                <div>✓ Voice Activation Support</div>

                <div>✓ Safe Zone Mapping</div>

                <div>✓ Subscription Services</div>

                <div>✓ Incident Reporting System</div>

              </div> */}


                            {error && (
                <div className="mt-6 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">

                    <Mail
                      size={18}
                      className="mr-3 text-gray-400"
                    />

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

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-gray-700">
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-accent-700 hover:text-accent-900"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 focus-within:border-accent-600 focus-within:bg-white">

                    <Lock
                      size={18}
                      className="mr-3 text-gray-400"
                    />

                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {showPw ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-surface-gradientStart via-accent-500 to-accent-300 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-20"
                        />

                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>

                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>
{/* 
              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <h4 className="mb-3 text-lg font-bold text-blue-900">
                  Advanced Modules
                </h4>

                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Real-time GPS Tracking</li>
                  <li>• AI Risk Analysis</li>
                  <li>• Push Notification Architecture</li>
                </ul>

              </div> */}

              <p className="mt-8 text-center text-gray-600">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-bold text-accent-700 hover:text-accent-900"
                >
                  Create Account
                </Link>

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}