import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Analyze = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitor", {
        body: { url: finalUrl, userId: user.id },
      });

      if (error) throw error;
      if (!data?.reportId) throw new Error("No report generated");

      toast.success("Analysis complete!");
      navigate(`/report/${data.reportId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen section-dark">
      {/* Cosmic orbs */}
      <div className="cosmic-orb cosmic-orb-blue w-[600px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 animate-glow-pulse" />
      <div className="cosmic-orb cosmic-orb-cyan w-[350px] h-[350px] bottom-[50px] right-[-100px] animate-float" />
      
      <SpyNavbar />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Analyze a Competitor</h1>
            <p className="text-white/50 text-lg">
              Enter a SaaS website URL to generate a full competitive intelligence report
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="url"
                placeholder="https://competitor.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent focus-visible:border-accent/50 rounded-xl text-lg"
                required
                disabled={analyzing}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl text-lg" 
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing competitor strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </form>

          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 text-center"
            >
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span className="text-sm text-accent font-medium">Scraping & analyzing with AI...</span>
              </div>
              <p className="text-xs text-white/40 mt-4">This may take 15-30 seconds</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;
