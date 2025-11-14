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
    const path = url.pathname.replace("/groups", "");
    const userId = await getUserFromToken(req.headers.get("Authorization"));

    // GET /groups - List all available subscription groups
    if (path === "" && req.method === "GET") {
      const { data: groups, error } = await supabase
        .from("subscription_groups")
        .select(`
          *,
          created_by_user:users!subscription_groups_created_by_fkey(id, full_name, email)
        `)
        .eq("is_active", true)
        .eq("admin_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ groups }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /groups/my - Get user's subscriptions
    if (path === "/my" && req.method === "GET") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: memberships, error } = await supabase
        .from("group_memberships")
        .select(`
          *,
          group:subscription_groups(
            *,
            created_by_user:users!subscription_groups_created_by_fkey(id, full_name, email)
          ),
          credentials:subscription_groups(credential:credentials(*))
        `)
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ subscriptions: memberships }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /groups - Create a new subscription group
    if (path === "" && req.method === "POST") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { name, icon, total_price, slots_total, category, tags, credential_username, credential_password, proof_url } = await req.json();

      // Create the subscription group
      const { data: newGroup, error: groupError } = await supabase
        .from("subscription_groups")
        .insert({
          name,
          icon,
          total_price,
          slots_total,
          slots_filled: 1,
          category,
          tags: tags || [],
          status: "pending_review",
          created_by: userId,
          owner_id: userId,
          service_type: name,
          is_active: true,
          admin_approved: false,
          proof_url,
        })
        .select()
        .single();

      if (groupError) {
        return new Response(
          JSON.stringify({ error: groupError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Store credentials if provided
      if (credential_username && credential_password) {
        const credentialsJson = JSON.stringify({
          username: credential_username,
          password: credential_password,
        });

        await supabase
          .from("credentials")
          .insert({
            group_id: newGroup.id,
            credentials: credentialsJson,
          });
      }

      // Create membership for the creator
      const shareAmount = total_price / slots_total;
      await supabase
        .from("group_memberships")
        .insert({
          user_id: userId,
          group_id: newGroup.id,
          membership_type: "owner",
          share_amount: shareAmount,
          is_active: true,
        });

      return new Response(
        JSON.stringify({ message: "Group created successfully", group: newGroup }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /groups/:id/join - Join a subscription group
    if (path.match(/^\/[^/]+\/join$/) && req.method === "POST") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const groupId = path.split("/")[1];

      // Get group details
      const { data: group, error: groupError } = await supabase
        .from("subscription_groups")
        .select("*")
        .eq("id", groupId)
        .maybeSingle();

      if (groupError || !group) {
        return new Response(
          JSON.stringify({ error: "Group not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if slots are available
      if (group.slots_filled >= group.slots_total) {
        return new Response(
          JSON.stringify({ error: "No slots available" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user already joined
      const { data: existingMembership } = await supabase
        .from("group_memberships")
        .select("*")
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .maybeSingle();

      if (existingMembership) {
        return new Response(
          JSON.stringify({ error: "Already a member" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check user credits
      const shareAmount = group.total_price / group.slots_total;
      const { data: user } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (!user || user.credits < shareAmount) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Deduct credits
      await supabase
        .from("users")
        .update({ credits: user.credits - shareAmount })
        .eq("id", userId);

      // Create membership
      await supabase
        .from("group_memberships")
        .insert({
          user_id: userId,
          group_id: groupId,
          membership_type: "member",
          share_amount: shareAmount,
          is_active: true,
        });

      // Update slots filled
      await supabase
        .from("subscription_groups")
        .update({ slots_filled: group.slots_filled + 1 })
        .eq("id", groupId);

      // Create transaction record
      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "debit",
          amount: shareAmount,
          status: "completed",
        });

      return new Response(
        JSON.stringify({ message: "Successfully joined group" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /groups/:id/leave - Leave a subscription group
    if (path.match(/^\/[^/]+\/leave$/) && req.method === "POST") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const groupId = path.split("/")[1];

      // Get membership
      const { data: membership, error: membershipError } = await supabase
        .from("group_memberships")
        .select("*, group:subscription_groups(*)")
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .maybeSingle();

      if (membershipError || !membership) {
        return new Response(
          JSON.stringify({ error: "Membership not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate refund (50% of share amount)
      const refundAmount = membership.share_amount * 0.5;

      // Update user credits
      const { data: user } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      await supabase
        .from("users")
        .update({ credits: (user?.credits || 0) + refundAmount })
        .eq("id", userId);

      // Deactivate membership
      await supabase
        .from("group_memberships")
        .update({ is_active: false, end_date: new Date().toISOString() })
        .eq("id", membership.id);

      // Update slots filled
      const group = membership.group as any;
      await supabase
        .from("subscription_groups")
        .update({ slots_filled: Math.max(0, group.slots_filled - 1) })
        .eq("id", groupId);

      // Create transaction record
      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "credit",
          amount: refundAmount,
          status: "completed",
        });

      return new Response(
        JSON.stringify({ message: "Successfully left group", refund: refundAmount }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /groups/:id/credentials - Get credentials for a group
    if (path.match(/^\/[^/]+\/credentials$/) && req.method === "GET") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const groupId = path.split("/")[1];

      // Verify membership
      const { data: membership } = await supabase
        .from("group_memberships")
        .select("*")
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .eq("is_active", true)
        .maybeSingle();

      if (!membership) {
        return new Response(
          JSON.stringify({ error: "Not a member of this group" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get credentials
      const { data: credentialData, error } = await supabase
        .from("credentials")
        .select("credentials")
        .eq("group_id", groupId)
        .maybeSingle();

      if (error || !credentialData) {
        return new Response(
          JSON.stringify({ error: "Credentials not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log access
      await supabase
        .from("credential_access_logs")
        .insert({
          group_id: groupId,
          user_id: userId,
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        });

      const credentials = JSON.parse(credentialData.credentials);

      return new Response(
        JSON.stringify({ credentials }),
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
