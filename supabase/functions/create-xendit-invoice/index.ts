import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, amount, description } = await req.json();

    const xenditKey = Deno.env.get("XENDIT_SECRET_KEY");
    if (!xenditKey) {
      throw new Error("Xendit API key not configured");
    }

    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const origin = req.headers.get("origin") ?? "";

    const successRedirectUrl =
      `${origin}/payment/success?external_id=${externalId}`;

    // ✅ CHANGE: Use free non-v2 endpoint
    const response = await fetch("https://api.xendit.co/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(xenditKey + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        currency: "PHP",
        description,
        payer_email: email,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: `${origin}/payment`,
        // optional for free API: remove invoice_duration if it causes issues
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Xendit error:", data);
      throw new Error(data?.message ?? "Failed to create invoice");
    }

    // ✅ KEEP: Same response structure
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Error:", error);

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
