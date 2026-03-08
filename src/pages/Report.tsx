import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Building2, Target, Package, DollarSign, MessageSquare, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { ShareReportDialog } from "@/components/ShareReportDialog";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

type AnalysisOutput = {
  companyOverview: { description: string; category: string; targetMarket: string; businessModel: string };
  icp: { companySize: string; targetIndustry: string; userPersona: string; useCases: string[] };
  productOffering: { features: string[]; modules: string[]; valuePropositions: string[] };
  pricingStrategy: { tiers: string[]; model: string; freePlan: string; enterprise: string; note?: string };
  messaging: { headline: string; valueProposition: string; positioning: string };
  strengths: string[];
  weaknesses: string[];
  strategicInsights: string[];
};

type ReportData = {
  id: string;
  competitor_url: string;
  competitor_name: string;
  analysis_output: AnalysisOutput;
  created_at: string;
};

const SectionCard = ({ icon: Icon, title, children, index }: { icon: any; title: string; children: React.ReactNode; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 + index * 0.05 }}
    className="glass-card rounded-xl p-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-accent" />
      </div>
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="py-2 border-b border-border last:border-0">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    <p className="text-sm text-foreground mt-0.5">{value}</p>
  </div>
);

const Tag = ({ children }: { children: string }) => (
  <span className="inline-block px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
    {children}
  </span>
);

const Report = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (data) {
        const output = typeof data.analysis_output === "string"
          ? JSON.parse(data.analysis_output as string)
          : data.analysis_output;
        setReport({
          id: data.id,
          competitor_url: data.competitor_url,
          competitor_name: data.competitor_name,
          analysis_output: output as AnalysisOutput,
          created_at: data.created_at,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user, id]);

  const exportPdf = () => {
    if (!report) return;
    const doc = new jsPDF();
    const a = report.analysis_output;
    let y = 20;
    const addLine = (text: string, size = 10) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, y);
      y += lines.length * (size * 0.5) + 4;
    };

    addLine(`SpyAll Report: ${report.competitor_name}`, 18);
    addLine(`URL: ${report.competitor_url}`, 10);
    addLine(`Date: ${new Date(report.created_at).toLocaleDateString()}`, 10);
    y += 8;
    addLine("Company Overview", 14);
    addLine(a.companyOverview.description);
    addLine(`Category: ${a.companyOverview.category}`);
    addLine(`Target Market: ${a.companyOverview.targetMarket}`);
    addLine(`Business Model: ${a.companyOverview.businessModel}`);
    y += 6;
    addLine("Ideal Customer Profile", 14);
    addLine(`Company Size: ${a.icp.companySize}`);
    addLine(`Industry: ${a.icp.targetIndustry}`);
    addLine(`Persona: ${a.icp.userPersona}`);
    addLine(`Use Cases: ${a.icp.useCases.join(", ")}`);
    y += 6;
    addLine("Strengths", 14);
    a.strengths.forEach(s => addLine(`• ${s}`));
    y += 6;
    addLine("Weaknesses", 14);
    a.weaknesses.forEach(w => addLine(`• ${w}`));
    y += 6;
    addLine("Strategic Insights", 14);
    a.strategicInsights.forEach(s => addLine(`• ${s}`));

    doc.save(`SpyAll-${report.competitor_name}.pdf`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SpyNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <SpyNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Report not found</p>
        </div>
      </div>
    );
  }

  const a = report.analysis_output;

  return (
    <div className="min-h-screen bg-background">
      <SpyNavbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="font-display text-3xl font-bold text-foreground">{report.competitor_name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{report.competitor_url} • {new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>

        {/* Report Sections */}
        <div className="space-y-5">
          <SectionCard icon={Building2} title="Company Overview" index={0}>
            <p className="text-sm text-foreground mb-3">{a.companyOverview.description}</p>
            <InfoRow label="Category" value={a.companyOverview.category} />
            <InfoRow label="Target Market" value={a.companyOverview.targetMarket} />
            <InfoRow label="Business Model" value={a.companyOverview.businessModel} />
          </SectionCard>

          <SectionCard icon={Target} title="Ideal Customer Profile" index={1}>
            <InfoRow label="Company Size" value={a.icp.companySize} />
            <InfoRow label="Target Industry" value={a.icp.targetIndustry} />
            <InfoRow label="User Persona" value={a.icp.userPersona} />
            <div className="mt-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Use Cases</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {a.icp.useCases.map(uc => <Tag key={uc}>{uc}</Tag>)}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Package} title="Product Offering" index={2}>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Features</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {a.productOffering.features.map(f => <Tag key={f}>{f}</Tag>)}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value Propositions</span>
                <ul className="mt-1.5 space-y-1">
                  {a.productOffering.valuePropositions.map(vp => (
                    <li key={vp} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span> {vp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={DollarSign} title="Pricing Strategy" index={3}>
            <InfoRow label="Pricing Model" value={a.pricingStrategy.model} />
            <InfoRow label="Free Plan" value={a.pricingStrategy.freePlan} />
            <InfoRow label="Enterprise" value={a.pricingStrategy.enterprise} />
            {a.pricingStrategy.tiers.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tiers</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {a.pricingStrategy.tiers.map(t => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            )}
            {a.pricingStrategy.note && (
              <p className="text-xs text-muted-foreground italic mt-2">{a.pricingStrategy.note}</p>
            )}
          </SectionCard>

          <SectionCard icon={MessageSquare} title="Messaging & Positioning" index={4}>
            <InfoRow label="Headline" value={a.messaging.headline} />
            <InfoRow label="Core Value Proposition" value={a.messaging.valueProposition} />
            <InfoRow label="Positioning" value={a.messaging.positioning} />
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-5">
            <SectionCard icon={TrendingUp} title="Strengths" index={5}>
              <ul className="space-y-2">
                {a.strengths.map(s => (
                  <li key={s} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={TrendingDown} title="Weaknesses" index={6}>
              <ul className="space-y-2">
                {a.weaknesses.map(w => (
                  <li key={w} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✗</span> {w}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard icon={Lightbulb} title="Strategic Insights" index={7}>
            <ul className="space-y-3">
              {a.strategicInsights.map((insight, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {insight}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Report;
