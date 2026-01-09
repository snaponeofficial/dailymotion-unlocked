import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First try to get Xendit key from admin_settings
    let xenditKey = Deno.env.get("XENDIT_SECRET_KEY");
    
    const { data: xenditSetting } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "xendit_api_key")
      .single();
    
    if (xenditSetting?.value) {
      xenditKey = xenditSetting.value;
    }

    if (!xenditKey) {
      throw new Error("Xendit API key not configured");
    }

    const externalId = `dailywatch_${userId}_${Date.now()}`;
    const successRedirectUrl = `${req.headers.get("origin")}/payment/success?external_id=${externalId}`;

    // Get client IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

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
      
      // Log failed payment attempt
      await supabase.from("payment_logs").insert({
        user_id: userId,
        user_email: email,
        external_id: externalId,
        amount: amount,
        currency: "PHP",
        status: "failed",
        ip_address: clientIp,
        xendit_response: data,
      });
      
      throw new Error(data.message || "Failed to create invoice");
    }

    // Log successful invoice creation
    await supabase.from("payment_logs").insert({
      user_id: userId,
      user_email: email,
      external_id: externalId,
      amount: amount,
      currency: "PHP",
      status: "created",
      invoice_url: data.invoice_url,
      ip_address: clientIp,
      xendit_response: data,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
