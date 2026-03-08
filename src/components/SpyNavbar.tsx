import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, LogOut, Plus, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const SpyNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Eye className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Spy<span className="text-accent">All</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/analyze">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Analysis
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
