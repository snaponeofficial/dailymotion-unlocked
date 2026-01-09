import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// --------------------
// CONFIGURATION
// --------------------
const PORT = 5000; // change if needed
const XENDIT_KEY = "xnd_production_77BNek4CU27qGVzWr8CuCMR9ebZKi0wav6TCmBBkgTTYtCOZ0BUMMVk9IIRZo"; // <-- your API key here

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --------------------
// START SERVER
// --------------------
console.log(`Deno Xendit Invoice API running on port ${PORT}...`);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse JSON body
    const { userId, email, amount, description } = await req.json();

    // Validate required fields
    if (!userId || !email || !amount || !description) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build invoice info
    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const origin = req.headers.get("origin") || "";
    const successRedirectUrl = `${origin}/payment/success?external_id=${externalId}`;
    const failureRedirectUrl = `${origin}/payment`;

    // Call Xendit API
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

    if (!response.ok) {
      console.error("Xendit error:", data);
      throw new Error(data.message || "Failed to create invoice");
    }

    // Return successful invoice JSON
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
}, { port: PORT });
