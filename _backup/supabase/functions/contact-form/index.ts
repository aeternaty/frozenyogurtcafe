import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const formData = await req.formData();

    // Extract form data
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const subject = formData.get("subject")?.toString();
    const message = formData.get("message")?.toString();
    const newsletter = formData.get("newsletter")?.toString() === "subscribed";
    const recaptchaToken = formData.get("recaptcha_token")?.toString();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate reCAPTCHA (production only)
    const isProduction = Deno.env.get("NODE_ENV") === "production";
    if (isProduction && recaptchaToken) {
      const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
        },
      );

      const recaptchaResult = await recaptchaResponse.json();
      if (!recaptchaResult.success) {
        return new Response(
          JSON.stringify({ error: "reCAPTCHA verification failed" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Basic spam prevention
    const spamKeywords = [
      "casino",
      "bitcoin",
      "cryptocurrency",
      "viagra",
      "loan",
      "forex",
      "investment",
      "click here",
    ];
    const messageText = (subject + " " + message + " " + name).toLowerCase();
    const hasSpam = spamKeywords.some((keyword) =>
      messageText.includes(keyword),
    );

    if (hasSpam) {
      console.log("Spam detected:", { email, subject });
      // Return success to avoid revealing spam detection
      return new Response(
        JSON.stringify({
          message:
            "Thank you for your message! We will get back to you within 24 hours.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert contact submission
    const { data, error } = await supabaseClient
      .from("contact_submissions")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject: subject.trim(),
          message: message.trim(),
          newsletter_subscribed: newsletter,
          created_at: new Date().toISOString(),
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ]);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit message" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Handle newsletter subscription
    if (newsletter) {
      await supabaseClient.from("newsletter_subscribers").upsert(
        [
          {
            email: email.toLowerCase().trim(),
            name: name.trim(),
            subscribed_at: new Date().toISOString(),
            source: "contact_form",
          },
        ],
        { onConflict: "email" },
      );
    }

    return new Response(
      JSON.stringify({
        message:
          "Thank you for your message! We will get back to you within 24 hours.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
