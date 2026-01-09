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
    const { message, test } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Telegram settings from admin_settings table
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["telegram_bot_token", "telegram_chat_id", "notifications_enabled"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    // Check if notifications are enabled (always allow test messages)
    if (!test && settingsMap.notifications_enabled !== "true") {
      return new Response(
        JSON.stringify({ success: true, message: "Notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const botToken = settingsMap.telegram_bot_token;
    const chatId = settingsMap.telegram_chat_id;

    if (!botToken || !chatId) {
      throw new Error("Telegram not configured");
    }

    // Send message via Telegram Bot API
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("Telegram error:", telegramData);
      throw new Error(telegramData.description || "Failed to send Telegram message");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
