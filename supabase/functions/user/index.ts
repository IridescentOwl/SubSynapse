import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { verify as verifyJWT } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production";

const textEncoder = new TextEncoder();
const jwtKey = await crypto.subtle.importKey(
  "raw",
  textEncoder.encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

async function getUserFromToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, jwtKey);
    return payload.userId as string;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace("/user", "");
    const userId = await getUserFromToken(req.headers.get("Authorization"));

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /user/profile - Get user profile
    if (path === "/profile" && req.method === "GET") {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, full_name, avatar_url, credits, role, email_verified, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ user }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /user/profile - Update user profile
    if (path === "/profile" && req.method === "PUT") {
      const { full_name, avatar_url } = await req.json();

      const updateData: any = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const { data: user, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Profile updated successfully", user }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /user/change-password - Change user password
    if (path === "/change-password" && req.method === "POST") {
      const { old_password, new_password } = await req.json();

      if (!old_password || !new_password) {
        return new Response(
          JSON.stringify({ error: "Old and new passwords are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: user } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", userId)
        .single();

      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const validPassword = bcrypt.compareSync(old_password, user.password_hash);
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: "Incorrect current password" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(new_password, salt);

      await supabase
        .from("users")
        .update({ password_hash: passwordHash })
        .eq("id", userId);

      return new Response(
        JSON.stringify({ message: "Password changed successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
