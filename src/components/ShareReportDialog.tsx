import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Share2, X, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Share = {
  id: string;
  shared_with_email: string;
  created_at: string;
};

export const ShareReportDialog = ({ reportId, reportName }: { reportId: string; reportName: string }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchShares = async () => {
    setFetching(true);
    const { data } = await supabase
      .from("report_shares")
      .select("id, shared_with_email, created_at")
      .eq("report_id", reportId);
    setShares((data as Share[]) || []);
    setFetching(false);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) fetchShares();
  };

  const handleShare = async () => {
    if (!email.trim() || !user) return;
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === user.email) {
      toast.error("You can't share a report with yourself");
      return;
    }

    if (shares.some(s => s.shared_with_email === trimmedEmail)) {
      toast.error("Already shared with this user");
      return;
    }

    setLoading(true);

    // Look up user by email using a edge function or just store email for now
    // We'll resolve user_id if they exist
    const { data: foundUsers } = await supabase.functions.invoke("resolve-user-email", {
      body: { email: trimmedEmail },
    });

    const { error } = await supabase.from("report_shares").insert({
      report_id: reportId,
      shared_by: user.id,
      shared_with_email: trimmedEmail,
      shared_with_user_id: foundUsers?.userId || null,
    });

    if (error) {
      toast.error("Failed to share report");
    } else {
      toast.success(`Shared with ${trimmedEmail}`);
      setEmail("");
      fetchShares();
    }
    setLoading(false);
  };

  const handleRemove = async (shareId: string) => {
    const { error } = await supabase.from("report_shares").delete().eq("id", shareId);
    if (error) {
      toast.error("Failed to remove");
    } else {
      setShares(prev => prev.filter(s => s.id !== shareId));
      toast.success("Access removed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share "{reportName}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleShare()}
            />
            <Button onClick={handleShare} disabled={loading || !email.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </Button>
          </div>

          {fetching ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shared with</p>
              {shares.map(share => (
                <div key={share.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-sm text-foreground truncate">{share.shared_with_email}</span>
                  <button
                    onClick={() => handleRemove(share.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">Not shared with anyone yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
