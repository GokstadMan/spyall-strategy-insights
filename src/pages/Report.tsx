import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SpyNavbar } from "@/components/SpyNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Building2, Target, Package, DollarSign, MessageSquare, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

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
    className="glass-card rounded-xl p-4 sm:p-6"
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
      // Try own report first, then shared
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
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
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentW = pageW - margin * 2;
    let y = 20;

    const checkPage = (needed = 20) => {
      if (y + needed > 280) { doc.addPage(); y = 20; }
    };

    const drawSectionHeader = (title: string) => {
      checkPage(24);
      y += 6;
      doc.setFillColor(8, 32, 68); // navy
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin + 4, y + 7);
      doc.setTextColor(30, 30, 30);
      y += 16;
    };

    const addLabel = (label: string) => {
      checkPage();
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text(label.toUpperCase(), margin + 2, y);
      y += 4;
    };

    const addValue = (text: string) => {
      checkPage();
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(text, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 4.5 + 3;
    };

    const addInfoRow = (label: string, value: string) => {
      addLabel(label);
      addValue(value);
    };

    const addBullet = (text: string, symbol = "•") => {
      checkPage();
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(symbol, margin + 2, y);
      const lines = doc.splitTextToSize(text, contentW - 12);
      doc.text(lines, margin + 8, y);
      y += lines.length * 4.5 + 2;
    };

    const addTags = (items: string[]) => {
      checkPage();
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      let x = margin + 2;
      items.forEach(item => {
        const w = doc.getTextWidth(item) + 8;
        if (x + w > pageW - margin) { x = margin + 2; y += 8; checkPage(); }
        doc.setFillColor(230, 235, 240);
        doc.roundedRect(x, y - 4, w, 7, 1.5, 1.5, "F");
        doc.setTextColor(50, 50, 50);
        doc.text(item, x + 4, y);
        x += w + 3;
      });
      y += 10;
    };

    // Title block
    doc.setFillColor(8, 32, 68);
    doc.rect(0, 0, pageW, 40, "F");
    doc.setTextColor(32, 184, 162); // teal accent
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SpyAll", margin, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(report.competitor_name, margin, 28);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 200, 220);
    doc.text(`${report.competitor_url}  •  ${new Date(report.created_at).toLocaleDateString()}`, margin, 36);
    y = 50;

    // Company Overview
    drawSectionHeader("Company Overview");
    addValue(a.companyOverview.description);
    addInfoRow("Category", a.companyOverview.category);
    addInfoRow("Target Market", a.companyOverview.targetMarket);
    addInfoRow("Business Model", a.companyOverview.businessModel);

    // ICP
    drawSectionHeader("Ideal Customer Profile");
    addInfoRow("Company Size", a.icp.companySize);
    addInfoRow("Target Industry", a.icp.targetIndustry);
    addInfoRow("User Persona", a.icp.userPersona);
    addLabel("Use Cases");
    addTags(a.icp.useCases);

    // Product Offering
    drawSectionHeader("Product Offering");
    addLabel("Key Features");
    addTags(a.productOffering.features);
    if (a.productOffering.modules?.length > 0) {
      addLabel("Modules");
      addTags(a.productOffering.modules);
    }
    addLabel("Value Propositions");
    a.productOffering.valuePropositions.forEach(vp => addBullet(vp));

    // Pricing Strategy
    drawSectionHeader("Pricing Strategy");
    addInfoRow("Pricing Model", a.pricingStrategy.model);
    addInfoRow("Free Plan", a.pricingStrategy.freePlan);
    addInfoRow("Enterprise", a.pricingStrategy.enterprise);
    if (a.pricingStrategy.tiers?.length > 0) {
      addLabel("Tiers");
      addTags(a.pricingStrategy.tiers);
    }
    if (a.pricingStrategy.note) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      const noteLines = doc.splitTextToSize(a.pricingStrategy.note, contentW - 4);
      checkPage();
      doc.text(noteLines, margin + 2, y);
      y += noteLines.length * 4 + 4;
    }

    // Messaging & Positioning
    drawSectionHeader("Messaging & Positioning");
    addInfoRow("Headline", a.messaging.headline);
    addInfoRow("Core Value Proposition", a.messaging.valueProposition);
    addInfoRow("Positioning", a.messaging.positioning);

    // Strengths
    drawSectionHeader("Strengths");
    a.strengths.forEach(s => addBullet(s, "✓"));

    // Weaknesses
    drawSectionHeader("Weaknesses");
    a.weaknesses.forEach(w => addBullet(w, "✗"));

    // Strategic Insights
    drawSectionHeader("Strategic Insights");
    a.strategicInsights.forEach((s, i) => addBullet(s, `${i + 1}.`));

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
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-2 -ml-2 h-9">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground break-words">{report.competitor_name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all">{report.competitor_url} • {new Date(report.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportPdf} className="w-full sm:w-auto h-11 sm:h-10">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
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
