import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { verify as verifyJWT } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

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
    const path = url.pathname.replace("/credits", "");
    const userId = await getUserFromToken(req.headers.get("Authorization"));

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /credits/balance - Get user's credit balance
    if (path === "/balance" && req.method === "GET") {
      const { data: user, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ balance: user.credits }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /credits/add - Add credits (simulate payment)
    if (path === "/add" && req.method === "POST") {
      const { amount } = await req.json();

      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get current balance
      const { data: user } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      // Update balance
      const newBalance = (user?.credits || 0) + amount;
      await supabase
        .from("users")
        .update({ credits: newBalance })
        .eq("id", userId);

      // Create transaction record
      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "credit",
          amount,
          status: "completed",
          payment_gateway_id: `sim_${Date.now()}`,
        });

      return new Response(
        JSON.stringify({
          message: "Credits added successfully",
          newBalance,
          amount
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /credits/withdraw - Request withdrawal
    if (path === "/withdraw" && req.method === "POST") {
      const { amount, upi_id } = await req.json();

      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (amount < 500) {
        return new Response(
          JSON.stringify({ error: "Minimum withdrawal amount is 500 credits" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!upi_id) {
        return new Response(
          JSON.stringify({ error: "UPI ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get current balance
      const { data: user } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (!user || user.credits < amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Deduct credits
      await supabase
        .from("users")
        .update({ credits: user.credits - amount })
        .eq("id", userId);

      // Create withdrawal request
      await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: userId,
          amount,
          upi_id,
          status: "pending",
        });

      // Create transaction record
      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "debit",
          amount,
          status: "pending",
        });

      return new Response(
        JSON.stringify({
          message: "Withdrawal request submitted successfully",
          newBalance: user.credits - amount
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /credits/transactions - Get user's transaction history
    if (path === "/transactions" && req.method === "GET") {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ transactions }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /credits/withdrawals - Get user's withdrawal requests
    if (path === "/withdrawals" && req.method === "GET") {
      const { data: withdrawals, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ withdrawals }),
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
