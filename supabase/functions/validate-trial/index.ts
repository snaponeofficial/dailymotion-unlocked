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
    const { sessionId, fingerprint, ipAddress, userAgent } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this fingerprint or IP has been used before
    const { data: existingSessions, error: checkError } = await supabase
      .from("trial_sessions")
      .select("*")
      .or(`fingerprint.eq.${fingerprint},ip_address.eq.${ipAddress}`)
      .neq("session_id", sessionId);

    if (checkError) {
      console.error("Error checking sessions:", checkError);
    }

    // If found existing sessions with same fingerprint/IP
    if (existingSessions && existingSessions.length > 0) {
      // Check if any are still valid or recently expired
      const recentSession = existingSessions.find(s => {
        const expiresAt = new Date(s.expires_at);
        const now = new Date();
        const hoursSinceExpiry = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);
        // Block if trial was used within last 24 hours
        return hoursSinceExpiry < 24;
      });

      if (recentSession) {
        // Mark current session as blocked
        await supabase
          .from("trial_sessions")
          .update({ 
            is_blocked: true,
            fingerprint,
            ip_address: ipAddress,
            user_agent: userAgent
          })
          .eq("session_id", sessionId);

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            reason: "Trial already used. Please purchase lifetime access." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update session with fingerprint and IP
    const { error: updateError } = await supabase
      .from("trial_sessions")
      .update({
        fingerprint,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .eq("session_id", sessionId);

    if (updateError) {
      console.error("Error updating session:", updateError);
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, allowed: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
