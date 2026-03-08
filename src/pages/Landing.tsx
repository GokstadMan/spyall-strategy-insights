import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import { Eye, Zap, Shield, Target, ArrowRight } from "lucide-react";
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
    { icon: Target, title: "ICP Detection", desc: "Instantly identify who your competitor targets" },
    { icon: Zap, title: "AI-Powered", desc: "Deep analysis powered by advanced AI models" },
    { icon: Shield, title: "Strategic Intel", desc: "Strengths, weaknesses, and market positioning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />

      {/* Hero */}
      <section className="bg-spy-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 mb-8">
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium text-accent">Instant Competitive Intelligence</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6" style={{ color: 'hsl(0 0% 96%)' }}>
              Paste a competitor URL.{" "}
              <span className="text-gradient-spy">Instantly reveal their strategy.</span>
            </h1>

            <p className="text-lg md:text-xl mb-10" style={{ color: 'hsl(220 10% 65%)' }}>
              SpyAll analyzes any SaaS website and generates a full competitive intelligence report in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <Input
                type="url"
                placeholder="https://competitor.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="h-12 bg-card/10 border-accent/20 text-card-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                style={{ color: 'hsl(0 0% 92%)' }}
              />
              <Button
                onClick={handleAnalyze}
                size="lg"
                className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shrink-0"
              >
                Analyze Competitor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
