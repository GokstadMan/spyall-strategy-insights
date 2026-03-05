import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Eye } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5">
              <Eye className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Analyze a Competitor</h1>
            <p className="text-muted-foreground mt-2">
              Enter a SaaS website URL to generate a competitive intelligence report
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://competitor.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 pl-10"
                required
                disabled={analyzing}
              />
            </div>
            <Button type="submit" className="w-full h-12 font-semibold" disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing competitor strategy...
                </>
              ) : (
                "Run Analysis"
              )}
            </Button>
          </form>

          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-sm text-accent font-medium">Scraping & analyzing...</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">This may take 15-30 seconds</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;
