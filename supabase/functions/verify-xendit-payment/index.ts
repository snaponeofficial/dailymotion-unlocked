import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { externalId, userId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Activate subscription
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        payment_id: externalId,
        paid_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // Log activity (optional but good)
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert({
        user_id: userId,
        action: "payment_completed",
        details: { external_id: externalId, amount: 49 },
      });

    if (logError) {
      console.warn("Activity log failed:", logError.message);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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
