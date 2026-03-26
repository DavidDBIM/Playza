import React, { useState } from "react";
import {  useNavigate } from "react-router";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward, MdSecurity } from "react-icons/md";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import loginBg from "../assets/admin_login_bg.png";

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A0A0B]">
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4) saturate(1.2)",
        }}
      />
      
      {/* Animated Glows */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-112.5 px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-purple-600 p-0.5 shadow-2xl shadow-primary/20 mb-6 group transition-transform hover:scale-110 duration-500">
            <div className="w-full h-full rounded-[14px] bg-[#0A0A0B] flex items-center justify-center">
              <span className="text-3xl font-black text-white italic tracking-tighter">P</span>
            </div>
          </div>
          <h1 className="text-4xl font-headline font-black text-white tracking-tight mb-2">
            PLAYZA <span className="text-primary italic">EMPIRE</span>
          </h1>
          <p className="text-muted-foreground font-body font-medium">
            Administrative Command & Control Center
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/2 to-transparent bg-siza-[100%_4px] animate-scanline pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
              <MdSecurity className="text-primary text-xl" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Secure Authentication Required
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-1">
                  Admin Credentials
                </label>
                <div className="relative group">
                  <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="admin@playza.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 pl-12 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Access Key
                  </label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-tight">
                    Forgot Key?
                  </button>
                </div>
                <div className="relative group">
                  <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 pl-12 pr-12 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer" 
                />
                <label htmlFor="remember" className="text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
                  Authorize device for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      INITIALIZE SESSION
                      <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">System Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-tighter">Core Active</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">Region</span>
            <p className="text-[10px] text-white/50 font-bold">GLOBAL_NORTH_WEST</p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[10%] left-[5%] text-[120px] font-black text-white/2 select-none italic">PLAYZA</div>
         <div className="absolute bottom-[10%] right-[5%] text-[120px] font-black text-white/2 select-none italic">EMPIRE</div>
      </div>
    </div>
  );
};

export default SignIn;
