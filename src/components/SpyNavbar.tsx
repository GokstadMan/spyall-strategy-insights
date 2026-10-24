import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { LogOut, Plus, LayoutDashboard, Menu } from "lucide-react";
import spyMark from "@/assets/spyall-mark.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const SpyNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <img
            src={spyMark}
            alt=""
            aria-hidden="true"
            className="w-8 h-8 rounded-full shrink-0 object-contain ring-1 ring-primary/30"
          />
          <span className="font-display font-bold text-xl text-foreground">
            Spy<span className="text-accent">All</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile nav */}
        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[80%] max-w-sm p-0 flex flex-col border-l border-primary/20 bg-[hsl(222_80%_8%)] text-[hsl(220_14%_92%)]"
            >
              <div className="flex items-center gap-2 px-5 h-16 border-b border-primary/20">
                <img
                  src={spyMark}
                  alt=""
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full shrink-0 object-contain ring-1 ring-primary/30"
                />
                <span className="font-display font-bold text-xl text-[hsl(220_14%_92%)]">
                  Spy<span className="text-accent">All</span>
                </span>
              </div>

              <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 h-12 rounded-lg text-base font-medium text-[hsl(220_14%_92%)] hover:bg-primary/15 transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/analyze"
                        className="flex items-center gap-3 px-3 h-12 rounded-lg text-base font-medium text-[hsl(220_14%_92%)] hover:bg-primary/15 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        New Analysis
                      </Link>
                    </SheetClose>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 h-12 rounded-lg text-base font-medium text-[hsl(220_14%_92%)] hover:bg-primary/15 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link
                        to="/login"
                        className="flex items-center px-3 h-12 rounded-lg text-base font-medium text-[hsl(220_14%_92%)] hover:bg-primary/15 transition-colors"
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/signup"
                        className="flex items-center justify-center px-3 h-12 rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                      >
                        Get Started
                      </Link>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
