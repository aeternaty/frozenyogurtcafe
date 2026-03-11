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
    const applicantName = formData.get("applicant-name")?.toString();
    const applicantAge = parseInt(
      formData.get("applicant-age")?.toString() || "0",
    );
    const applicantEmail = formData.get("applicant-email")?.toString();
    const applicantPhone = formData.get("applicant-phone")?.toString();
    const preferredLocation = formData.get("preferred-location")?.toString();
    const positionType = formData.get("position-type")?.toString();
    const availability = formData.get("availability")?.toString();
    const experience = formData.get("experience")?.toString();
    const whyJoin = formData.get("why-join")?.toString();
    const terms = formData.get("terms")?.toString() === "on";
    const recaptchaToken = formData.get("recaptcha_token")?.toString();

    // Validate required fields
    if (
      !applicantName ||
      !applicantAge ||
      !applicantEmail ||
      !applicantPhone ||
      !preferredLocation ||
      !positionType ||
      !availability ||
      !whyJoin ||
      !terms
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields. Please fill out all required information.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate age
    if (applicantAge < 16 || applicantAge > 99) {
      return new Response(
        JSON.stringify({ error: "Age must be between 16 and 99" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate phone number format (basic)
    const phoneRegex = /^[\d\s\-\(\)\+\.]{10,}$/;
    if (!phoneRegex.test(applicantPhone)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate selection fields
    const validLocations = ["marlboro", "new-providence", "any"];
    const validPositionTypes = ["full-time", "part-time"];
    const validAvailability = ["weekdays", "weekends", "both"];

    if (
      !validLocations.includes(preferredLocation) ||
      !validPositionTypes.includes(positionType) ||
      !validAvailability.includes(availability)
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid selection for location, position type, or availability",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
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
          JSON.stringify({
            error: "reCAPTCHA verification failed. Please try again.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Check for duplicate applications (same email within 7 days)
    const weekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: existingApp } = await supabaseClient
      .from("job_applications")
      .select("id")
      .eq("applicant_email", applicantEmail.toLowerCase().trim())
      .gte("created_at", weekAgo)
      .single();

    if (existingApp) {
      return new Response(
        JSON.stringify({
          message:
            "Thank you for your interest! We have already received your application and will review it within 3-5 business days.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Basic content validation (prevent spam/inappropriate content)
    const inappropriatePattern = /\b(spam|test|asdf|qwerty|lorem ipsum)\b/i;
    if (
      inappropriatePattern.test(whyJoin) ||
      inappropriatePattern.test(applicantName)
    ) {
      return new Response(
        JSON.stringify({
          message:
            "Thank you for your application! We will review it and contact you within 3-5 business days.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert job application
    const { data, error } = await supabaseClient
      .from("job_applications")
      .insert([
        {
          applicant_name: applicantName.trim(),
          applicant_age: applicantAge,
          applicant_email: applicantEmail.toLowerCase().trim(),
          applicant_phone: applicantPhone.trim(),
          preferred_location: preferredLocation,
          position_type: positionType,
          availability,
          experience: experience ? experience.trim() : null,
          why_join: whyJoin.trim(),
          terms_accepted: terms,
          created_at: new Date().toISOString(),
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          status: "pending",
        },
      ]);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to submit application. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message:
          "Thank you for your application! We will review it and contact you within 3-5 business days.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
