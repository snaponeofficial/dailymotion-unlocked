import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toBase64(str: string) {
  return Buffer.from(str, "utf-8").toString("base64");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, email, amount, description } = body;

    if (!userId || !email || !amount || !description) {
      console.error("Missing fields", body);
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xenditKey = "xnd_production_77BNek4CU27qGVzWr8CuCMR9ebZKi0wav6TCmBBkgTTYtCOZ0BUMMVk9IIRZo";
    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const origin = req.headers.get("origin") || "";
    const successRedirectUrl = `${origin}/payment/success?external_id=${externalId}`;
    const failureRedirectUrl = `${origin}/payment`;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: "Basic " + toBase64(xenditKey + ":"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        currency: "PHP",
        description,
        payer_email: email,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
        invoice_duration: 86400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Xendit returned error", data);
      return new Response(
        JSON.stringify({ error: data.message || "Xendit error" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
