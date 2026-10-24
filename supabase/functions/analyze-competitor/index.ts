import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const htmlToText = (html: string, max: number) =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

async function fetchPage(url: string, max: number): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; SpyAll/1.0)" }, signal: ctrl.signal, redirect: "follow" });
    if (!r.ok) return "";
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("html")) return "";
    const text = htmlToText(await r.text(), max);
    return text.length > 200 ? text : "";
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

const SUBPAGES = ["pricing", "features", "integrations", "product"];

// Fetch homepage + key sub-pages in parallel (deep scan)
async function scanSite(url: string, compact = false) {
  const homeMax = compact ? 8000 : 12000;
  const subMax = compact ? 3500 : 6000;
  const [home, ...subs] = await Promise.all([
    fetchPage(url, homeMax),
    ...SUBPAGES.map((p) => fetchPage(new URL(`/${p}`, url).href, subMax)),
  ]);
  const pages: Record<string, string> = {};
  SUBPAGES.forEach((p, i) => { if (subs[i]) pages[p] = subs[i]; });
  // dedupe: some sites redirect sub-pages to homepage
  for (const k of Object.keys(pages)) if (pages[k].slice(0, 300) === home.slice(0, 300)) delete pages[k];
  return { home, pages, scanned: ["home", ...Object.keys(pages)] };
}

const formatScan = (label: string, url: string, s: Awaited<ReturnType<typeof scanSite>>) => {
  let out = `##### ${label} (${url}) #####\n=== HOMEPAGE ===\n${s.home || "Could not fetch homepage; infer from domain."}\n`;
  for (const [k, v] of Object.entries(s.pages)) out += `\n=== /${k.toUpperCase()} PAGE ===\n${v}\n`;
  return out;
};

const nameFromUrl = (url: string) => {
  const d = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  return d.charAt(0).toUpperCase() + d.slice(1);
};

const SINGLE_SCHEMA = `{
  "companyOverview": { "description": "string", "category": "string", "targetMarket": "string", "businessModel": "string" },
  "icp": { "companySize": "string", "targetIndustry": "string", "userPersona": "string", "useCases": ["string"] },
  "productOffering": { "features": ["string"], "modules": ["string"], "valuePropositions": ["string"] },
  "pricingStrategy": { "tiers": ["string"], "model": "string", "freePlan": "string", "enterprise": "string", "note": "string" },
  "messaging": { "headline": "string", "valueProposition": "string", "positioning": "string" },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "strategicInsights": ["string"],
  "deepScan": { "pricingLimits": ["usage limits, seat caps, quotas per tier"], "hiddenCosts": ["add-ons, overage fees, annual-only discounts, paywalled features"], "integrations": ["string"], "featureHighlights": ["string"] },
  "battlecard": {
    "howToWin": ["string"],
    "objections": [{ "objection": "what a prospect might say in favour of this competitor", "response": "how a sales rep should reply" }],
    "landmines": ["questions to plant that expose this competitor's weaknesses"],
    "talkingPoints": ["short punchy lines for a sales call"]
  }
}`;

const COMPARE_SCHEMA = `{
  "type": "comparison",
  "a": { "name": "string", "url": "string", "summary": "string", "category": "string", "targetAudience": "string", "pricingModel": "string", "pricingTiers": ["string"], "freePlan": "string", "strengths": ["string"], "weaknesses": ["string"] },
  "b": { same shape as a },
  "pricingGap": "string - direct comparison of pricing",
  "audienceDivergence": "string - how their target audiences differ",
  "featureGaps": [{ "feature": "string", "a": "string (Yes/No/Partial/details)", "b": "string" }],
  "advantagesA": ["competitive advantages A has over B"],
  "advantagesB": ["competitive advantages B has over A"],
  "positioningContrast": "string",
  "verdict": "string - who is likely to win which segment and why",
  "opportunities": ["gaps in the market neither covers well"]
}`;

async function callAI(system: string, user: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("AI error:", r.status, t);
    if (r.status === 429) throw Object.assign(new Error("Rate limit exceeded. Please try again in a moment."), { status: 429 });
    if (r.status === 402) throw Object.assign(new Error("AI credits exhausted. Please add credits."), { status: 402 });
    throw new Error(`AI gateway error: ${r.status}`);
  }
  const d = await r.json();
  const text = (d.choices?.[0]?.message?.content || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(text); } catch {
    console.error("Bad AI JSON:", text.slice(0, 500));
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

const BASE = `You are SpyAll, an AI competitive intelligence analyst for SaaS companies. Be professional, analytical and concise. Prefix inferred statements with "(Inferred)" when they are not directly visible in the content. Never invent specific prices or numbers that are not in the content. Respond ONLY with a valid JSON object, no markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { url, url2, userId, mode } = body ?? {};
    if (!url || !userId) return json({ error: "Missing url or userId" }, 400);
    try { new URL(url); if (url2) new URL(url2); } catch { return json({ error: "Invalid URL" }, 400); }

    let output: unknown;
    let competitorName: string;
    let competitorUrl: string;

    if (mode === "compare") {
      if (!url2) return json({ error: "Two URLs are required for Battle Mode" }, 400);
      const [sa, sb] = await Promise.all([scanSite(url, true), scanSite(url2, true)]);
      const nameA = nameFromUrl(url), nameB = nameFromUrl(url2);
      output = await callAI(
        `${BASE}\nCompare two companies head-to-head (gap analysis). Use exactly this JSON structure:\n${COMPARE_SCHEMA}`,
        `Compare A = ${nameA} and B = ${nameB}. Include 6-10 featureGaps rows.\n\n${formatScan("A: " + nameA, url, sa)}\n\n${formatScan("B: " + nameB, url2, sb)}`,
      );
      (output as any).type = "comparison";
      (output as any).pagesScanned = { a: sa.scanned, b: sb.scanned };
      competitorName = `${nameA} vs ${nameB}`;
      competitorUrl = `${url} | ${url2}`;
    } else {
      const s = await scanSite(url);
      competitorName = nameFromUrl(url);
      competitorUrl = url;
      output = await callAI(
        `${BASE}\nGenerate a competitive intelligence report plus a sales battlecard (for reps selling AGAINST this company). Use exactly this JSON structure:\n${SINGLE_SCHEMA}`,
        `Company: ${competitorName}\nPages scanned: ${s.scanned.join(", ")}${s.pages.pricing ? "" : "\nNo pricing page found - infer pricing strategy and label it."}\n\n${formatScan(competitorName, url, s)}`,
      );
      (output as any).deepScan = { ...((output as any).deepScan || {}), pagesScanned: s.scanned };
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: report, error } = await supabase
      .from("reports")
      .insert({ user_id: userId, competitor_url: competitorUrl, competitor_name: competitorName, analysis_output: output })
      .select("id")
      .single();
    if (error) { console.error("DB error:", error); throw new Error("Failed to save report"); }

    return json({ reportId: report.id });
  } catch (e: any) {
    console.error("analyze-competitor error:", e);
    return json({ error: e?.message || "Unknown error" }, e?.status || 500);
  }
});
