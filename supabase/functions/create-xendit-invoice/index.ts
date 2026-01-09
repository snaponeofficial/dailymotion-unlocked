import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// --------------------
// CONFIGURATION
// --------------------
const PORT = 6000; // use a different port than Node website
const XENDIT_KEY = "xnd_production_77BNek4CU27qGVzWr8CuCMR9ebZKi0wav6TCmBBkgTTYtCOZ0BUMMVk9IIRZo"; // your API key here

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --------------------
// START SERVER
// --------------------
console.log(`Deno Xendit Invoice API running on port ${PORT}...`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, amount, description } = await req.json();

    if (!userId || !email || !amount || !description) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const origin = req.headers.get("origin") || "http://38.76.247.68"; // fallback to VPS IP
    const successRedirectUrl = `${origin}/payment/success?external_id=${externalId}`;
    const failureRedirectUrl = `${origin}/payment`;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(XENDIT_KEY + ":")}`,
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

    return new Response(
      JSON.stringify({ success: response.ok, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}, { port: PORT, hostname: "0.0.0.0" }); // <-- bind to all network interfaces

