import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import { Eye, Zap, Shield, Target, ArrowRight, Users, BarChart3, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAnalyze = () => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (url.trim()) {
      navigate(`/analyze?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const features = [
    { icon: Target, title: "ICP Detection", desc: "Instantly identify who your competitor targets and their ideal customer profile" },
    { icon: Zap, title: "AI-Powered Analysis", desc: "Deep analysis powered by advanced AI models for actionable insights" },
    { icon: Shield, title: "Strategic Intel", desc: "Discover strengths, weaknesses, and market positioning strategies" },
  ];

  const stats = [
    { value: "10K+", label: "Reports Generated" },
    { value: "500+", label: "Companies Analyzed" },
    { value: "30s", label: "Average Analysis Time" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />

      {/* Hero Section - Dark */}
      <section className="section-dark min-h-[90vh] flex items-center">
        {/* Cosmic glow orbs */}
        <div className="cosmic-orb cosmic-orb-blue w-[600px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 animate-glow-pulse" />
        <div className="cosmic-orb cosmic-orb-cyan w-[400px] h-[400px] top-[100px] right-[-100px] animate-float" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-8">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Competitive Intelligence Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
              Everything App{" "}
              <br />
              <span className="text-gradient-blue">for your teams</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Paste a competitor URL and instantly reveal their complete strategy. 
              AI-powered competitive intelligence that gives you the edge.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="url"
                placeholder="https://competitor.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent focus-visible:border-accent/50 rounded-xl"
              />
              <Button
                onClick={handleAnalyze}
                size="lg"
                className="h-14 px-8 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shrink-0"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 mt-16">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image with glow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-5xl mx-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,4%)] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl overflow-hidden glow-border">
              <img
                src={heroImage}
                alt="SpyAll competitive intelligence dashboard preview"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Light */}
      <section className="section-light py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Unmatched productivity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get complete competitive intelligence in seconds, not hours. 
              Our AI analyzes everything from pricing to positioning.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="feature-card"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Together Section - Dark */}
      <section className="section-dark py-24">
        <div className="cosmic-orb cosmic-orb-blue w-[500px] h-[500px] bottom-[-200px] left-[-100px] animate-glow-pulse" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Work together.
                <br />
                <span className="text-white/60">Like in the office.</span>
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Share competitive intelligence with your team in real-time. 
                Everyone stays on the same page with collaborative reports and insights.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Users, text: "Real-time collaboration" },
                  { icon: BarChart3, text: "Shared dashboards" },
                  { icon: Globe, text: "Team-wide access" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-white/80 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden glow-border">
                <img
                  src={heroImage}
                  alt="Team collaboration preview"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Light */}
      <section className="section-light py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the Movement
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Thousands of teams are already using SpyAll to stay ahead of their competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="h-14 px-8 rounded-xl"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">
              Spy<span className="text-accent">All</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SpyAll. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
