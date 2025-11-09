import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import bcrypt from "npm:bcryptjs@2.4.3";
import { create as createJWT, verify as verifyJWT } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production";
const JWT_REFRESH_SECRET = Deno.env.get("JWT_REFRESH_SECRET") || "your-refresh-secret-key";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

const textEncoder = new TextEncoder();
const jwtKey = await crypto.subtle.importKey(
  "raw",
  textEncoder.encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

const jwtRefreshKey = await crypto.subtle.importKey(
  "raw",
  textEncoder.encode(JWT_REFRESH_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  email_verified: boolean;
  credits: number;
}

async function generateTokens(user: User) {
  const accessToken = await createJWT(
    { alg: "HS256", typ: "JWT" },
    { userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 3600 },
    jwtKey
  );

  const refreshToken = await createJWT(
    { alg: "HS256", typ: "JWT" },
    { userId: user.id, exp: Math.floor(Date.now() / 1000) + 604800 },
    jwtRefreshKey
  );

  return { accessToken, refreshToken };
}

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, email not sent");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") || "noreply@synapse.thapar.edu",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
    }
  } catch (error) {
    console.error("Email sending error:", error);
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
    const path = url.pathname.replace("/auth", "");

    if (path === "/register" && req.method === "POST") {
      const { email, password, full_name } = await req.json();

      if (!email.endsWith("@thapar.edu")) {
        return new Response(
          JSON.stringify({ error: "Only @thapar.edu emails are allowed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Email already registered" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const verificationToken = crypto.randomUUID();

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: passwordHash,
          full_name,
          verification_token: verificationToken,
          email_verified: false,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(
        email,
        "Verify your Synapse account",
        `<h1>Welcome to Synapse!</h1><p>Click <a href="${verificationLink}">here</a> to verify your email.</p><p>Or copy this link: ${verificationLink}</p>`
      );

      return new Response(
        JSON.stringify({ message: "Registration successful. Please check your email to verify your account.", userId: newUser.id }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/verify-email" && req.method === "GET") {
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("verification_token", token)
        .maybeSingle();

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("users")
        .update({ email_verified: true, verification_token: null })
        .eq("id", user.id);

      return new Response(
        JSON.stringify({ message: "Email verified successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/login" && req.method === "POST") {
      const { email, password } = await req.json();

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const validPassword = bcrypt.compareSync(password, user.password_hash);
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!user.email_verified) {
        return new Response(
          JSON.stringify({ error: "Please verify your email first" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokens = await generateTokens(user);

      return new Response(
        JSON.stringify({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            credits: user.credits,
          },
          ...tokens,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/refresh" && req.method === "POST") {
      const { refreshToken } = await req.json();

      try {
        const payload = await verifyJWT(refreshToken, jwtRefreshKey);
        const userId = payload.userId as string;

        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (!user) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokens = await generateTokens(user);

        return new Response(
          JSON.stringify(tokens),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid refresh token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (path === "/forgot-password" && req.method === "POST") {
      const { email } = await req.json();

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!user) {
        return new Response(
          JSON.stringify({ message: "If email exists, a reset link has been sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 3600000);

      await supabase
        .from("users")
        .update({ reset_token: resetToken, reset_token_expires: expiresAt.toISOString() })
        .eq("id", user.id);

      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail(
        email,
        "Reset your Synapse password",
        `<h1>Password Reset</h1><p>Click <a href="${resetLink}">here</a> to reset your password.</p><p>Or copy this link: ${resetLink}</p><p>This link expires in 1 hour.</p>`
      );

      return new Response(
        JSON.stringify({ message: "If email exists, a reset link has been sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/reset-password" && req.method === "POST") {
      const { token, password } = await req.json();

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("reset_token", token)
        .maybeSingle();

      if (!user || !user.reset_token_expires) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired reset token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (new Date(user.reset_token_expires) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Reset token has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      await supabase
        .from("users")
        .update({ password_hash: passwordHash, reset_token: null, reset_token_expires: null })
        .eq("id", user.id);

      return new Response(
        JSON.stringify({ message: "Password reset successful" }),
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