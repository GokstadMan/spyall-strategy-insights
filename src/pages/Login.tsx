import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpyNavbar } from "@/components/SpyNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Log in to your SpyAll account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
