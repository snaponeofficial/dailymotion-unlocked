import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, amount, description } = await req.json();

const xenditKey = "xnd_production_77BNek4CU27qGVzWr8CuCMR9ebZKi0wav6TCmBBkgTTYtCOZ0BUMMVk9IIRZo";
    if (!xenditKey) {
      throw new Error("Xendit API key not configured");
    }

    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const successRedirectUrl = `${req.headers.get("origin")}/payment/success?external_id=${externalId}`;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(xenditKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount,
        currency: "PHP",
        description: description,
        payer_email: email,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: `${req.headers.get("origin")}/payment`,
        invoice_duration: 86400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Xendit error:", data);
      throw new Error(data.message || "Failed to create invoice");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
