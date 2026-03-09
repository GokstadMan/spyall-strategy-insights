import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPayment = async () => {
    if (!user) return;
    setVerifying(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-payment");
      if (fnError) throw fnError;
      if (data?.verified) {
        setVerified(true);
      } else {
        setError(data?.reason || "Payment not found yet. It may take a moment to process.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (user) verifyPayment();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          {verified ? (
            <>
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">Payment Verified!</h1>
              <p className="text-muted-foreground mb-8">
                You now have unlimited access to SpyAll competitor analysis reports.
              </p>
              <Button asChild size="lg">
                <Link to="/analyze">Start Analyzing</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                {verifying ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                {verifying ? "Verifying Payment..." : "Verifying Your Payment"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {error || "Checking your payment status with Stripe..."}
              </p>
              {!verifying && (
                <Button onClick={verifyPayment} variant="outline" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
