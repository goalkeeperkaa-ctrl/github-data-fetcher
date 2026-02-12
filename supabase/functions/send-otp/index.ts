import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 3 OTP requests per email per hour
    const { data: recentCodes } = await supabase
      .from("otp_codes")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());

    if (recentCodes && recentCodes.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous codes for this email
    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email)
      .eq("verified", false);

    // Store new code
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({ email, code, expires_at: expiresAt.toISOString() });

    if (insertError) {
      throw new Error(`Failed to store OTP: ${insertError.message}`);
    }

    // Send email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aidagis <onboarding@resend.dev>",
        to: [email],
        subject: "Ваш код подтверждения — Aidagis",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; text-align: center;">
            <h2 style="color: #1a1a1a;">Код подтверждения</h2>
            <p style="color: #666; margin-bottom: 24px;">Введите этот код для подтверждения вашего аккаунта:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f5; padding: 16px; border-radius: 12px; color: #1a1a1a;">
              ${code}
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 24px;">Код действителен 10 минут.</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      throw new Error(`Resend API error [${resendRes.status}]: ${resendError}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-otp error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
