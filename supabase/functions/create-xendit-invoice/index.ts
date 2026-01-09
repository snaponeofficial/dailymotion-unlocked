import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, email, amount, description } = await req.json();

    // Hardcode your key for testing
    const xenditKey = "xnd_production_77BNek4CU27qGVzWr8CuCMR9ebZKi0wav6TCmBBkgTTYtCOZ0BUMMVk9IIRZo";

    const externalId = `dailywatch_${userId || "test"}_${Date.now()}`;
    const origin = req.headers.get("origin") || "http://localhost:5000";
    const successRedirectUrl = `${origin}/payment/success?external_id=${externalId}`;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(xenditKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount || 1,
        currency: "PHP",
        description: description || "Test Payment",
        payer_email: email || "test@example.com",
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: `${origin}/payment`,
        invoice_duration: 86400,
      }),
    });

    const data = await response.json();
    console.log("Xendit response:", data);

    // Always return 200 for debugging
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Server error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
