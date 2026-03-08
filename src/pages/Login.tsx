import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpyNavbar } from "@/components/SpyNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen section-dark">
      {/* Cosmic orbs */}
      <div className="cosmic-orb cosmic-orb-blue w-[500px] h-[500px] top-[-150px] left-1/2 -translate-x-1/2 animate-glow-pulse" />
      <div className="cosmic-orb cosmic-orb-cyan w-[300px] h-[300px] bottom-[100px] right-[-50px]" />
      
      <SpyNavbar />
      
      <div className="flex items-center justify-center px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card-dark rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-white/50 text-sm mt-2">Log in to your SpyAll account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="mt-2 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent focus-visible:border-accent/50 rounded-xl" 
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="mt-2 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent focus-visible:border-accent/50 rounded-xl"
                  placeholder="••••••••"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <p className="text-center text-sm text-white/50 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
