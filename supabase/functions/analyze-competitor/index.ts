import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, userId } = await req.json();
    if (!url || !userId) throw new Error("Missing url or userId");

    // Step 1: Fetch website content
    console.log("Fetching:", url);
    let pageContent = "";
    try {
      const fetchResp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SpyAll/1.0)" },
      });
      const html = await fetchResp.text();
      // Extract text content from HTML (simple approach)
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000); // Limit to ~15k chars for AI context
    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr);
      pageContent = `Could not fetch the website at ${url}. Please analyze based on the URL/domain name alone.`;
    }

    // Try to fetch pricing page too
    let pricingContent = "";
    try {
      const pricingUrl = new URL("/pricing", url).href;
      const pricingResp = await fetch(pricingUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SpyAll/1.0)" },
      });
      if (pricingResp.ok) {
        const pricingHtml = await pricingResp.text();
        pricingContent = pricingHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);
      }
    } catch { /* ignore */ }

    // Extract domain name for competitor name
    const domain = new URL(url).hostname.replace("www.", "");
    const companyName = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);

    // Step 2: AI analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are SpyAll, an AI competitive intelligence analyst. Analyze the provided website content and generate a structured competitive intelligence report. Be professional, analytical, and concise. Clearly label when you are inferring vs extracting directly from content. Avoid hallucinating specific numbers unless they are visible in the content.

You MUST respond with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "companyOverview": { "description": "string", "category": "string", "targetMarket": "string", "businessModel": "string" },
  "icp": { "companySize": "string", "targetIndustry": "string", "userPersona": "string", "useCases": ["string"] },
  "productOffering": { "features": ["string"], "modules": ["string"], "valuePropositions": ["string"] },
  "pricingStrategy": { "tiers": ["string"], "model": "string", "freePlan": "string", "enterprise": "string", "note": "string" },
  "messaging": { "headline": "string", "valueProposition": "string", "positioning": "string" },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "strategicInsights": ["string"]
}`;

    const userPrompt = `Analyze this competitor website and generate the competitive intelligence report.

Website URL: ${url}
Company Name: ${companyName}

=== HOMEPAGE CONTENT ===
${pageContent}

${pricingContent ? `=== PRICING PAGE CONTENT ===\n${pricingContent}` : "No pricing page found - infer pricing strategy."}`;

    console.log("Calling AI for analysis...");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    let analysisText = aiData.choices?.[0]?.message?.content || "";
    
    // Clean potential markdown wrapping
    analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let analysisOutput;
    try {
      analysisOutput = JSON.parse(analysisText);
    } catch {
      console.error("Failed to parse AI output:", analysisText.slice(0, 500));
      throw new Error("AI returned invalid JSON. Please try again.");
    }

    // Step 3: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: report, error: dbError } = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        competitor_url: url,
        competitor_name: companyName,
        analysis_output: analysisOutput,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save report");
    }

    console.log("Report saved:", report.id);

    return new Response(JSON.stringify({ reportId: report.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-competitor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
