import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpyNavbar } from "@/components/SpyNavbar";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            You now have unlimited access to SpyAll competitor analysis reports.
          </p>
          <Button asChild size="lg">
            <Link to="/analyze">Start Analyzing</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
