import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Eye, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Analyze = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [reportsRemaining, setReportsRemaining] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const checkAccess = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-purchase");
        if (error) throw error;
        setCanAnalyze(data.canAnalyze);
        setReportsRemaining(data.reportsRemaining);
        setHasPurchased(data.hasPurchased);
      } catch (err) {
        console.error("Error checking access:", err);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    if (!canAnalyze) {
      navigate("/upgrade");
      return;
    }

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

  if (authLoading || checkingAccess) return null;

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
            {!hasPurchased && reportsRemaining !== null && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
                {reportsRemaining > 0
                  ? `${reportsRemaining} free report${reportsRemaining === 1 ? "" : "s"} remaining`
                  : "No free reports remaining"}
              </div>
            )}
          </div>

          {canAnalyze ? (
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
          ) : (
            <div className="text-center space-y-4">
              <div className="glass-card rounded-xl p-6 border border-accent/20">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Free limit reached</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock unlimited reports for a one-time payment of $12.99
                </p>
                <Button asChild className="w-full">
                  <Link to="/upgrade">Upgrade Now — $12.99</Link>
                </Button>
              </div>
            </div>
          )}

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
