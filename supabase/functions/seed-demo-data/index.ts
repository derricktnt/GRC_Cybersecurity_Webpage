import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    const { data: existingKeys } = await supabase
      .from("api_keys")
      .select("id")
      .eq("created_by", userId)
      .limit(1);

    if (existingKeys && existingKeys.length > 0) {
      return new Response(
        JSON.stringify({ message: "Demo data already exists" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const demoApiKeys = [
      {
        name: "Production Database",
        key_value: "sk_prod_51M9k8FJ9kL4m2nO3pQ5rS6tU7vW8xY9zAaBbCcDdEeFfGgHhIiJjKkLlMmNnOo",
        service: "AWS RDS",
        environment: "production",
        status: "active",
        last_rotated: new Date().toISOString(),
        created_by: userId,
      },
      {
        name: "Stripe Payment Processing",
        key_value: "rk_live_51MaB9FJ9kL4m2nO3pQ5rS6tU7vW8xY9zAaBbCcDdEeFfGgHhIiJjKkLlMmNnOo",
        service: "Stripe",
        environment: "production",
        status: "active",
        last_rotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
      },
      {
        name: "Development OpenAI",
        key_value: "sk_test_51M9k8FJ9kL4m2nO3pQ5rS6tU7vW8xY9zAaBbCcDdEeFfGgHhIiJjKkLlMmNnOo",
        service: "OpenAI",
        environment: "development",
        status: "active",
        last_rotated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
      },
      {
        name: "Staging Azure",
        key_value: "az_staging_51M9k8FJ9kL4m2nO3pQ5rS6tU7vW8xY9zAaBbCcDdEeFfGgHhIiJjKkLlMmNnOo",
        service: "Microsoft Azure",
        environment: "staging",
        status: "inactive",
        last_rotated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
      },
    ];

    const demoIpAddresses = [
      {
        ip_address: "203.0.113.45",
        hostname: "api.example-prod.com",
        location: "US-East (N. Virginia)",
        risk_level: "low",
        category: "internal",
        notes: "Production API server - monitored and whitelisted",
        last_seen: new Date().toISOString(),
        created_by: userId,
      },
      {
        ip_address: "198.51.100.82",
        hostname: "cdn.example.com",
        location: "EU (Frankfurt)",
        risk_level: "low",
        category: "internal",
        notes: "CDN distribution node - high traffic expected",
        last_seen: new Date().toISOString(),
        created_by: userId,
      },
      {
        ip_address: "192.0.2.156",
        hostname: "partner-api.acmecorp.com",
        location: "US-West (California)",
        risk_level: "medium",
        category: "partner",
        notes: "Third-party integration partner - API traffic",
        last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
      },
      {
        ip_address: "203.0.113.189",
        hostname: null,
        location: "Unknown",
        risk_level: "high",
        category: "external",
        notes: "Suspicious scanning activity detected - multiple failed login attempts",
        last_seen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        created_by: userId,
      },
      {
        ip_address: "198.51.100.245",
        hostname: null,
        location: "CN (China)",
        risk_level: "critical",
        category: "threat",
        notes: "Known malicious IP - added to blocklist. Attempted exploitation of CVE-2024-1234",
        last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        created_by: userId,
      },
      {
        ip_address: "192.0.2.99",
        hostname: "backup-server.internal.local",
        location: "US-East (N. Virginia)",
        risk_level: "low",
        category: "internal",
        notes: "Backup and disaster recovery server - secure internal network",
        last_seen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
      },
    ];

    const { error: apiKeysError } = await supabase
      .from("api_keys")
      .insert(demoApiKeys);

    if (apiKeysError) {
      console.error("Error inserting API keys:", apiKeysError);
    }

    const { error: ipAddressesError } = await supabase
      .from("ip_addresses")
      .insert(demoIpAddresses);

    if (ipAddressesError) {
      console.error("Error inserting IP addresses:", ipAddressesError);
    }

    return new Response(
      JSON.stringify({ message: "Demo data seeded successfully", userId }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
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
