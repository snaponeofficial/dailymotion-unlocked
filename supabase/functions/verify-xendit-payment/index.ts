import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendTelegramNotification(supabaseUrl: string, supabaseKey: string, message: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Telegram settings
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["telegram_bot_token", "telegram_chat_id", "notifications_enabled"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap.notifications_enabled !== "true") {
      console.log("Telegram notifications disabled");
      return;
    }

    const botToken = settingsMap.telegram_bot_token;
    const chatId = settingsMap.telegram_chat_id;

    if (!botToken || !chatId) {
      console.log("Telegram not configured");
      return;
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { externalId, userId, email } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    // Activate subscription
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        payment_id: externalId,
        paid_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;

    // Update payment log
    await supabase
      .from("payment_logs")
      .update({
        status: "paid",
        payment_method: "xendit",
      })
      .eq("external_id", externalId);

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action: "payment_completed",
      details: { external_id: externalId, amount: 49 },
      ip_address: clientIp,
    });

    // Send Telegram notification
    const now = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    const telegramMessage = `
💰 <b>New Payment Received!</b>

👤 <b>User:</b> ${email || "Unknown"}
💵 <b>Amount:</b> ₱49
📝 <b>Transaction ID:</b> <code>${externalId}</code>
🌐 <b>IP:</b> <code>${clientIp}</code>
🕐 <b>Time:</b> ${now}

✅ Subscription activated successfully!
    `.trim();

    await sendTelegramNotification(supabaseUrl, supabaseKey, telegramMessage);

    return new Response(JSON.stringify({ success: true }), {
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
