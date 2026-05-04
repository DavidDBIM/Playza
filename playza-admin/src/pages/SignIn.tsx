import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
  MdSecurity,
  MdWarning,
} from "react-icons/md";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import loginBg from "../assets/admin_login_bg.png";
import axios from "axios";
import { adminService } from "../services/admin-service";

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.login({
        identifier: email,
        password,
      });

      if (response.mfa_required) {
        setMfaRequired(true);
      } else if (response.access_token && response.user) {
        // Verify admin role if present
        if (response.user.role && response.user.role !== 'admin' && response.user.role !== 'superadmin') {
          setError("Access Denied: Administrative privileges required.");
          return;
        }

        localStorage.setItem("admin_token", response.access_token);
        localStorage.setItem("admin_user", JSON.stringify(response.user));
        localStorage.setItem("admin_login_time", Date.now().toString());
        navigate("/");
      } else {
        setError("Unauthorized access detected. Please check your credentials.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error && err.message === "Network Error") {
        setError("Unable to connect to the security server. Please check your connection.");
      } else {
        setError("Authentication failed. Access denied.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/admin/verify-mfa`,
        {
          email,
          code: mfaCode,
        },
      );

      if (data.success) {
        if (data.data.access_token) {
          localStorage.setItem("admin_token", data.data.access_token);
          localStorage.setItem("admin_user", JSON.stringify(data.data.user));
          localStorage.setItem("admin_login_time", Date.now().toString());
          navigate("/");
        } else {
          // Fallback if token isn't in response yet (due to our backend simplicity)
          setError(
            "Verification successful. Please sign in again to activate your session.",
          );
          setMfaRequired(false);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050506] selection:bg-primary/30">
      {/* Dynamic Background Elements */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.4) 0%, #050506 100%), url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.3) saturate(1.4)",
        }}
      />

      {/* Animated Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000" />

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-120 px-4 py-12">
        <div className="mb-10 text-center space-y-4">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-linear-to-tr from-primary to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-500 overflow-hidden">
              {/* Internal Glow */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl font-black text-white italic tracking-tighter relative z-10">
                P
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-5xl font-headline font-black text-white tracking-tighter flex items-center justify-center gap-3">
              PLAYZA{" "}
              <span className="text-primary italic drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                EMPIRE
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-linear-to-r from-transparent to-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Centralized Command Node
              </p>
              <div className="h-px w-8 bg-linear-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>

        <div className="relative group">
          {/* Card Outer Glow/Border */}
          <div className="absolute -inset-px bg-linear-to-b from-white/20 via-white/5 to-white/10 rounded-2xl blur-px group-hover:from-primary/30 transition-all duration-500" />

          <div className="relative bg-slate-950/80 backdrop-blur-3xl rounded-2xl p-8 lg:p-10 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Ambient Light Effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Subtle Scanline Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/2 to-transparent bg-size-[100%_4px] animate-scanline pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    System Authentication
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-4 h-1 rounded-full bg-white/5" />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mt-0.5 p-1 rounded-md bg-rose-500/20">
                    <MdWarning className="text-rose-500 text-sm shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">
                      Access Rejected
                    </p>
                    <p className="text-xs font-bold text-rose-200 tracking-tight leading-snug">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {!mfaRequired ? (
                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 flex justify-between items-center">
                      <span>Admin ID</span>
                      <span className="text-[8px] text-white/10 italic">
                        Secure Input
                      </span>
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-white/5 rounded-xl group-focus-within/input:bg-primary/5 transition-colors pointer-events-none" />
                      <MdEmail className="-translate-y-1/2 absolute left-4 top-1/2 text-white/40 group-focus-within/input:text-primary transition-colors duration-300 z-20" />
                      <Input
                        type="email"
                        placeholder="ADMINISTRATOR@PLAYZA.EMPIRE"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-white/10 h-14 pl-12 text-white placeholder:text-white/10 focus:border-primary/30 transition-all rounded-xl font-bold tracking-wide relative z-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Access Protocol
                      </label>
                      <button
                        type="button"
                        className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
                      >
                        Reset Protocol
                      </button>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-white/5 rounded-xl group-focus-within/input:bg-primary/5 transition-colors pointer-events-none" />
                      <MdLock className="-translate-y-1/2 absolute left-4 top-1/2 text-white/40 group-focus-within/input:text-primary transition-colors duration-300 z-20" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent border-white/10 h-14 pl-12 pr-12 text-white placeholder:text-white/10 focus:border-primary/30 transition-all rounded-xl font-bold tracking-[0.3em] relative z-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="-translate-y-1/2 absolute right-4 top-1/2 text-white/40 hover:text-white transition-colors z-20"
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="peer w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-offset-0 focus:ring-primary/20 cursor-pointer appearance-none checked:bg-primary checked:border-primary transition-all"
                      />
                      <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white flex items-center justify-center w-5 h-5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="4"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <label
                      htmlFor="remember"
                      className="text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:text-white/60 transition-colors"
                    >
                      Authorize Persistent Session
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] group/btn overflow-hidden relative border border-white/10"
                  >
                    <div className="-translate-x-full absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 group-hover/btn:animate-shimmer" />
                    <span className="relative flex items-center justify-center gap-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Initialize Protocol
                          <MdArrowForward className="text-xl group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMfa} className="space-y-8">
                  <div className="space-y-4">
                    <div className="text-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Multi-Factor Challenge
                      </label>
                      <p className="text-[10px] text-white/20 mt-2 uppercase tracking-tight">
                        Security token dispatched to registered comms.
                      </p>
                    </div>

                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-muted rounded-xl group-focus-within/input:bg-emerald-500/3 transition-colors pointer-events-none" />
                      <MdSecurity className="-translate-y-1/2 absolute left-5 top-1/2 text-white/20 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
                      <Input
                        type="text"
                        placeholder="000000"
                        required
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        className="bg-transparent border-border h-16 pl-14 text-center text-3xl font-black tracking-[0.8em] text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 transition-all rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] group/btn overflow-hidden relative border border-white/10"
                  >
                    <div className="-translate-x-full absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 group-hover/btn:animate-shimmer" />
                    <span className="relative flex items-center justify-center gap-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Verify Clearance
                          <MdArrowForward className="text-xl group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMfaRequired(false)}
                    className="w-full text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-[0.3em] transition-colors"
                  >
                    Return to Primary Terminal
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center space-y-2 opacity-30 group-hover:opacity-60 transition-opacity">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground">
            Playza OS v4.2.0-ADMIN
          </p>
          <p className="text-[8px] font-medium text-muted-foreground">
            Authorized Personnel Only • All Connections Monitored
          </p>
        </div>
      </div>

      {/* Side Decorative Text */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-[10%] left-[2%] text-[140px] font-black text-foreground/5 italic tracking-tighter leading-none">
          SYSTEM
        </div>
        <div className="absolute bottom-[10%] right-[2%] text-[140px] font-black text-foreground/5 italic tracking-tighter leading-none">
          EMPIRE
        </div>
      </div>
    </div>
  );
};

export default SignIn;
