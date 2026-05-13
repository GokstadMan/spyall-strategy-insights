import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Upgrade = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Unlock Unlimited Access</h1>
            <p className="text-muted-foreground mt-2">
              You've used your 2 free reports. Upgrade to keep analyzing.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-accent/30">
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="font-display text-5xl font-bold text-foreground">$12.99</span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Unlimited competitor reports",
                "Full AI-powered analysis",
                "PDF export included",
                "Lifetime access",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handlePurchase}
              className="w-full h-12 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening checkout...
                </>
              ) : (
                "Buy Now — $12.99"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upgrade;
