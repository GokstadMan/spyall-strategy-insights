import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ExternalLink, Calendar, Globe, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Report = {
  id: string;
  competitor_url: string;
  competitor_name: string;
  created_at: string;
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchReports = async () => {
      const { data } = await supabase
        .from("reports")
        .select("id, competitor_url, competitor_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) {
      toast.error("Failed to delete report");
    } else {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success("Report deleted");
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your competitive intelligence reports</p>
          </div>
          <Button asChild>
            <Link to="/analyze">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No reports yet</h2>
            <p className="text-muted-foreground mb-6">Analyze your first competitor to get started</p>
            <Button asChild>
              <Link to="/analyze">
                <Plus className="w-4 h-4 mr-2" />
                Run First Analysis
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/report/${report.id}`}
                  className="block glass-card rounded-xl p-5 hover:border-accent/40 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                        {report.competitor_name || "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">{report.competitor_url}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.preventDefault()}
                          className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2 mt-0.5"
                          title="Delete report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you really sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the report for {report.competitor_name || report.competitor_url}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleDelete(e, report.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
