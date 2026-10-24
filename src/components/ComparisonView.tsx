import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Swords, DollarSign, Users, Grid3x3, Trophy, Lightbulb, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

type Side = {
  name: string; url: string; summary: string; category: string; targetAudience: string;
  pricingModel: string; pricingTiers: string[]; freePlan: string; strengths: string[]; weaknesses: string[];
};
export type Comparison = {
  type: "comparison"; a: Side; b: Side; pricingGap: string; audienceDivergence: string;
  featureGaps: { feature: string; a: string; b: string }[]; advantagesA: string[]; advantagesB: string[];
  positioningContrast: string; verdict: string; opportunities: string[];
};

const Card = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-xl p-4 sm:p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center"><Icon className="w-4 h-4 text-accent" /></div>
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</span>
);

export const ComparisonView = ({ c, name, createdAt }: { c: Comparison; name: string; createdAt: string }) => {
  const navigate = useNavigate();
  const arr = (x?: string[]) => x || [];

  const exportPdf = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth(), m = 16, cw = W - m * 2;
    let y = 50;
    const page = (n = 20) => { if (y + n > 280) { doc.addPage(); y = 20; } };
    const head = (t: string) => {
      page(24); y += 6; doc.setFillColor(8, 32, 68); doc.roundedRect(m, y, cw, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(t, m + 4, y + 7); y += 16;
    };
    const text = (t: string, bold = false) => {
      page(); doc.setFontSize(10); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(30, 30, 30);
      const l = doc.splitTextToSize(t || "-", cw - 4); doc.text(l, m + 2, y); y += l.length * 4.5 + 3;
    };
    const bullets = (items: string[]) => items.forEach((i) => text(`• ${i}`));
    doc.setFillColor(8, 32, 68); doc.rect(0, 0, W, 40, "F");
    doc.setTextColor(32, 184, 162); doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("SpyAll — Battle Mode", m, 18);
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text(name, m, 30);
    head("Verdict"); text(c.verdict);
    head("Pricing Gap"); text(c.pricingGap);
    [c.a, c.b].forEach((s) => text(`${s.name}: ${s.pricingModel} | Free: ${s.freePlan} | Tiers: ${arr(s.pricingTiers).join(", ")}`));
    head("Audience Divergence"); text(c.audienceDivergence);
    [c.a, c.b].forEach((s) => text(`${s.name}: ${s.targetAudience}`));
    head("Feature Gaps");
    (c.featureGaps || []).forEach((f) => text(`${f.feature} — ${c.a.name}: ${f.a} | ${c.b.name}: ${f.b}`));
    head(`${c.a.name} Advantages`); bullets(arr(c.advantagesA));
    head(`${c.b.name} Advantages`); bullets(arr(c.advantagesB));
    head("Positioning Contrast"); text(c.positioningContrast);
    head("Market Opportunities"); bullets(arr(c.opportunities));
    doc.save(`SpyAll-${name.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-2 -ml-2 h-9">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider mb-1"><Swords className="w-4 h-4" /> Battle Mode</div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground break-words">{name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={exportPdf} className="w-full sm:w-auto h-11 sm:h-10"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
      </div>

      <div className="space-y-5">
        <Card icon={Trophy} title="Verdict"><p className="text-sm text-foreground">{c.verdict}</p></Card>

        <div className="grid md:grid-cols-2 gap-5">
          {[c.a, c.b].map((s) => (
            <div key={s.name} className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="font-display text-xl font-bold text-foreground">{s.name}</h3>
              <p className="text-xs text-muted-foreground break-all mb-3">{s.url}</p>
              <p className="text-sm text-foreground mb-3">{s.summary}</p>
              <Label>Category</Label><p className="text-sm text-foreground mb-2">{s.category}</p>
              <Label>Strengths</Label>
              <ul className="mb-2">{arr(s.strengths).map((x) => <li key={x} className="text-sm text-foreground"><span className="text-accent">✓</span> {x}</li>)}</ul>
              <Label>Weaknesses</Label>
              <ul>{arr(s.weaknesses).map((x) => <li key={x} className="text-sm text-foreground"><span className="text-destructive">✗</span> {x}</li>)}</ul>
            </div>
          ))}
        </div>

        <Card icon={DollarSign} title="Pricing Differences">
          <p className="text-sm text-foreground mb-4">{c.pricingGap}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[c.a, c.b].map((s) => (
              <div key={s.name} className="rounded-lg bg-secondary/50 p-3">
                <p className="font-semibold text-sm text-foreground mb-1">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.pricingModel}</p>
                <p className="text-xs text-muted-foreground mt-1">Free: {s.freePlan}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">{arr(s.pricingTiers).map((t) => <span key={t} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card icon={Users} title="Target Audience Divergence">
          <p className="text-sm text-foreground mb-3">{c.audienceDivergence}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[c.a, c.b].map((s) => <div key={s.name}><Label>{s.name}</Label><p className="text-sm text-foreground">{s.targetAudience}</p></div>)}
          </div>
        </Card>

        <Card icon={Grid3x3} title="Feature Gap Analysis">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[480px]">
              <thead><tr className="border-b border-border text-left">
                <th className="p-2 text-muted-foreground font-medium">Feature</th>
                <th className="p-2 text-foreground font-semibold">{c.a.name}</th>
                <th className="p-2 text-foreground font-semibold">{c.b.name}</th>
              </tr></thead>
              <tbody>{(c.featureGaps || []).map((f) => (
                <tr key={f.feature} className="border-b border-border last:border-0">
                  <td className="p-2 text-muted-foreground">{f.feature}</td>
                  <td className="p-2 text-foreground">{f.a}</td>
                  <td className="p-2 text-foreground">{f.b}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-5">
          <Card icon={Trophy} title={`Where ${c.a.name} wins`}>
            <ul className="space-y-2">{arr(c.advantagesA).map((x) => <li key={x} className="text-sm text-foreground">→ {x}</li>)}</ul>
          </Card>
          <Card icon={Trophy} title={`Where ${c.b.name} wins`}>
            <ul className="space-y-2">{arr(c.advantagesB).map((x) => <li key={x} className="text-sm text-foreground">→ {x}</li>)}</ul>
          </Card>
        </div>

        <Card icon={MessageSquare} title="Positioning Contrast"><p className="text-sm text-foreground">{c.positioningContrast}</p></Card>
        <Card icon={Lightbulb} title="Market Opportunities">
          <ul className="space-y-2">{arr(c.opportunities).map((x, i) => <li key={i} className="text-sm text-foreground">{i + 1}. {x}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
};
