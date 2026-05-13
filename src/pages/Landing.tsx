import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import {
  Eye,
  Zap,
  Shield,
  Target,
  ArrowRight,
  Search,
  Sparkles,
  LineChart,
  Lock,
  Activity,
  Radar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cycling intel preview lines for the scanner panel
  const intelLines = [
    { label: "TARGET", value: "linear.app" },
    { label: "ICP", value: "Mid-market product teams" },
    { label: "PRICING", value: "$8 / user / month · Free tier" },
    { label: "POSITIONING", value: "Speed-obsessed issue tracker" },
    { label: "WEAKNESS", value: "Limited reporting depth" },
  ];
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= intelLines.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 650);
    return () => clearTimeout(t);
  }, [revealed]);

  const handleAnalyze = () => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (url.trim()) {
      navigate(`/analyze?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const steps = [
    {
      icon: Search,
      title: "Drop a URL",
      desc: "Paste any SaaS competitor's homepage. No setup, no scraping configs.",
    },
    {
      icon: Radar,
      title: "We scan silently",
      desc: "Our agent fetches their site and decodes positioning, pricing and ICP.",
    },
    {
      icon: Sparkles,
      title: "Get the report",
      desc: "A full intel brief in seconds — exportable, shareable, actionable.",
    },
  ];

  const features = [
    { icon: Target, title: "ICP Detection", desc: "Pinpoint who they actually sell to — segment, role, and use case." },
    { icon: LineChart, title: "Pricing Teardown", desc: "Plans, anchors, and the psychology behind their pricing page." },
    { icon: Shield, title: "Positioning Map", desc: "How they frame value, what they avoid, and where they're vulnerable." },
    { icon: Zap, title: "Seconds, not days", desc: "Skip the spreadsheets. Get a full brief before your coffee cools." },
    { icon: Lock, title: "Private by default", desc: "Your reports stay yours. Share with one teammate or no one." },
    { icon: Activity, title: "Always fresh", desc: "Re-run any report to catch pivots, price changes and new launches." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />

      {/* HERO */}
      <section className="bg-spy-hero relative overflow-hidden">
        {/* Animated grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
          }}
        />
        {/* Glow blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[420px] h-[420px] rounded-full bg-accent/20 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[520px] h-[520px] rounded-full bg-primary/30 blur-[160px]" />
        </div>

        <div className="container mx-auto px-4 pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Left: copy + form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-accent">
                  Live competitive intelligence
                </span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
                style={{ color: "hsl(0 0% 96%)" }}
              >
                Know your competitor{" "}
                <span className="text-gradient-spy">before lunch.</span>
              </h1>

              <p
                className="text-base sm:text-lg lg:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ color: "hsl(220 12% 70%)" }}
              >
                Paste a URL. SpyAll quietly decodes their ICP, pricing,
                positioning and weak spots — and hands you a full report in
                seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
                <Input
                  type="url"
                  placeholder="https://competitor.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="h-12 bg-card/10 border-accent/20 placeholder:text-muted-foreground focus-visible:ring-accent"
                  style={{ color: "hsl(0 0% 92%)" }}
                />
                <Button
                  onClick={handleAnalyze}
                  size="lg"
                  className="h-12 px-7 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shrink-0 shadow-[0_0_30px_-8px_hsl(var(--accent))]"
                >
                  Run Intel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div
                className="mt-5 flex items-center gap-4 justify-center lg:justify-start text-xs"
                style={{ color: "hsl(220 10% 60%)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Private reports
                </span>
                <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>2 free analyses · no card</span>
              </div>
            </motion.div>

            {/* Right: scanner panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div
                className="absolute -inset-4 rounded-2xl blur-2xl opacity-40 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--accent)/0.5), hsl(var(--primary)/0.4))",
                }}
              />
              <div
                className="relative rounded-2xl border border-accent/25 overflow-hidden backdrop-blur-md"
                style={{ background: "hsl(222 60% 8% / 0.85)" }}
              >
                {/* Window chrome */}
                <div className="flex items-center justify-between px-4 h-10 border-b border-accent/15">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                  </div>
                  <span className="text-[11px] font-mono tracking-wider text-accent/80">
                    SPYALL · LIVE
                  </span>
                  <Eye className="w-3.5 h-3.5 text-accent/60" />
                </div>

                {/* Scanline */}
                <div className="relative h-1 overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(var(--accent)/0.8), transparent)",
                    }}
                  />
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 font-mono text-xs sm:text-[13px] space-y-3">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "hsl(220 14% 65%)" }}
                  >
                    <span className="text-accent">$</span>
                    <span>spyall scan linear.app</span>
                  </div>
                  {intelLines.map((line, i) =>
                    i < revealed ? (
                      <motion.div
                        key={line.label}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 border-l-2 border-accent/40 pl-3"
                      >
                        <span className="text-accent/80 tracking-widest text-[10px] sm:text-[11px]">
                          {line.label}
                        </span>
                        <span style={{ color: "hsl(0 0% 92%)" }}>
                          {line.value}
                        </span>
                      </motion.div>
                    ) : null
                  )}
                  {revealed < intelLines.length && (
                    <div
                      className="flex items-center gap-2 pt-1"
                      style={{ color: "hsl(220 14% 55%)" }}
                    >
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                      />
                      decoding…
                    </div>
                  )}
                  {revealed >= intelLines.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-2 text-accent flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Report ready · 5 sections · 1.8s
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* bottom fade */}
        <div
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, transparent, hsl(var(--background)))",
          }}
        />
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-mono tracking-[0.2em] text-accent uppercase mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            From URL to intel in three quiet steps.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-7 relative group hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <s.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-mono text-xs text-muted-foreground tracking-widest">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2 text-foreground">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-mono tracking-[0.2em] text-accent uppercase mb-3">
            What you get
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            A full intel brief, not a glorified scrape.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:border-accent/40 hover:shadow-[0_0_40px_-15px_hsl(var(--accent)/0.5)] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5 text-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-accent/25 max-w-5xl mx-auto px-6 py-12 sm:px-12 sm:py-16 text-center"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(222 60% 14%) 0%, hsl(222 80% 7%) 70%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
              style={{ color: "hsl(0 0% 96%)" }}
            >
              Your next move starts with{" "}
              <span className="text-gradient-spy">one URL.</span>
            </h2>
            <p
              className="text-base sm:text-lg mb-8 max-w-xl mx-auto"
              style={{ color: "hsl(220 12% 70%)" }}
            >
              Two free reports. No credit card. Unlock unlimited for $12.99 once.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/analyze" : "/signup")}
              className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-[0_0_40px_-8px_hsl(var(--accent))]"
            >
              Start spying free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
