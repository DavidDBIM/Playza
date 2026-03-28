import { useEffect } from "react";
import { Link } from "react-router";

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground py-2 md:py-12 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-6 md:mb-12 text-center animate-fade-in px-2">
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mb-2 md:mb-4">
                Privacy Policy
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] md:text-sm">
                Effective Date: March 17, 2026
            </p>
        </div>

        <div className="glass-card rounded-2xl md:rounded-xl p-5 md:p-10 space-y-8 md:space-y-12 shadow-2xl border border-white/5 relative overflow-hidden">
                {/* Subtle Decorative Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

            <section className="relative z-10">
                <p className="text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                    At <span className="text-primary font-bold">PLAYZA</span>, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or participate in our gaming services.
                </p>
                <p className="text-xs md:text-sm leading-relaxed">
                    By using PLAYZA, you consent to the data practices described in this policy.
                </p>
            </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Data We Collect
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="p-4 md:p-6 bg-muted/40 rounded-2xl md:rounded-xl border border-white/5 h-full">
                            <h3 className="text-foreground font-black uppercase tracking-widest text-xs mb-3">Direct Info</h3>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>Account data (Email, Phone)</li>
                                <li>Profile info (Name, Pic)</li>
                                <li>Transaction history</li>
                            </ul>
                        </div>
                    <div className="p-4 md:p-6 bg-muted/40 rounded-2xl md:rounded-xl border border-white/5 h-full">
                            <h3 className="text-foreground font-black uppercase tracking-widest text-xs mb-3">Automated Data</h3>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>IP Address & Device details</li>
                                <li>Log & Visit history</li>
                                <li>Authentication details</li>
                            </ul>
                        </div>
                    <div className="p-4 md:p-6 bg-muted/40 rounded-2xl md:rounded-xl border border-white/5 h-full">
                            <h3 className="text-foreground font-black uppercase tracking-widest text-xs mb-3">Gameplay Data</h3>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>Game scores & Rankings</li>
                                <li>Ticket purchase history</li>
                                <li>Chat & Tournament data</li>
                            </ul>
                        </div>
                    </div>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Cookies & Tracking
                </h2>
                <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-4 text-xs md:text-sm text-muted-foreground">
                        <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Essential:</span> Necessary for account authentication and security.</li>
                        <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Functional:</span> Remember your preferences (e.g. language or volume).</li>
                        <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Analytics:</span> We use Google Analytics to understand user interaction.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground px-2 md:px-4 py-2 bg-muted/20 border-l-2 border-primary rounded-r-lg italic">
                        Note: You can disable cookies in your browser settings, but some features of PLAYZA may become unavailable.
                    </p>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Purpose of Data Processing
                </h2>
                <div className="bg-muted/30 p-5 md:p-8 rounded-2xl md:rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground pl-2 md:pl-4 border-l-2 border-primary">
                        <div className="space-y-2">
                            <p className="text-xs md:text-base text-foreground font-black uppercase italic tracking-tighter">Service Delivery</p>
                            <p className="text-xs md:text-base">To manage your account, process ZA transactions, and maintain live leaderboards.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs md:text-base text-foreground font-black uppercase italic tracking-tighter">Communication</p>
                            <p className="text-xs md:text-base">To send security alerts, game updates, and prize winner notifications.</p>
                        </div>
                    </div>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Data Retention
                </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                        {[
                            { title: "Active Accounts", def: "Data kept as long as your account is active." },
                            { title: "Inactive (24m)", def: "Account data is anonymized or deleted automatically." },
                            { title: "Finances", def: "Financial logs are kept for 7 years per audit law." }
                        ].map((item, i) => (
                        <div key={i} className="bg-muted/30 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                                <p className="font-black text-foreground uppercase text-xs tracking-widest mb-1">{item.title}</p>
                                <p className="text-xs md:text-sm text-muted-foreground">{item.def}</p>
                            </div>
                        ))}
                    </div>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Security Safeguards
                </h2>
                <div className="bg-primary/5 rounded-2xl md:rounded-xl p-4 md:p-6 border border-primary/20">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm font-medium">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />SSL/TLS Encryption</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Role-based Access</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Hashed Passwords</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />MFA Encouraged</li>
                        </ul>
                    </div>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    User Rights
                </h2>
                    <div className="flex flex-wrap gap-2">
                        {["Access", "Rectification", "Erasure", "Objection", "Data Portability"].map((right) => (
                            <span key={right} className="px-3 md:px-4 py-1.5 md:py-2 bg-muted/60 rounded-full text-[9px] md:text-xs font-black uppercase tracking-widest border border-white/5 select-none hover:bg-primary/10 transition-colors">
                                {right}
                            </span>
                        ))}
                    </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-3 md:mt-4 italic">
                        To exercise these rights, please contact our Data Protection Officer at <span className="text-primary font-bold">privacy@playza.com</span>.
                    </p>
                </section>

            <section className="space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                    Contact Us
                </h2>
                <div className="bg-muted/50 p-4 md:p-6 rounded-2xl md:rounded-xl flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="bg-background/80 p-3 md:p-4 rounded-xl md:rounded-2xl flex-1 border border-white/5">
                            <p className="text-[10px] uppercase font-black text-primary mb-1">Legal Email</p>
                            <p className="text-xs md:text-sm font-bold">privacy@playza.com</p>
                        </div>
                    <div className="bg-background/80 p-3 md:p-4 rounded-xl md:rounded-2xl flex-1 border border-white/5">
                            <p className="text-[10px] uppercase font-black text-primary mb-1">HQ Address</p>
                            <p className="text-xs md:text-sm font-bold italic">Lagos, Nigeria</p>
                        </div>
                    </div>
                </section>

                <div className="pt-2 md:pt-8 border-t border-white/5 text-center relative z-10">
                    <Link to="/" className="text-primary hover:text-primary/80 font-bold transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
