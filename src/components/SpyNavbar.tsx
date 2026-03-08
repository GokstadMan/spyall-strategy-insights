import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, LogOut, Plus, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const SpyNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on a dark section (landing page hero)
  const isDarkHero = location.pathname === "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${
      isDarkHero 
        ? "bg-black/50 border-white/10" 
        : "bg-background/80 border-border"
    }`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className={`font-semibold text-xl ${isDarkHero ? "text-white" : "text-foreground"}`}>
            Spy<span className="text-accent">All</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className={isDarkHero ? "text-white/80 hover:text-white hover:bg-white/10" : ""}
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className={isDarkHero ? "text-white/80 hover:text-white hover:bg-white/10" : ""}
              >
                <Link to="/analyze">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Analysis
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className={isDarkHero ? "text-white/80 hover:text-white hover:bg-white/10" : ""}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className={isDarkHero ? "text-white/80 hover:text-white hover:bg-white/10" : ""}
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="bg-accent hover:bg-accent/90 text-white rounded-lg"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
