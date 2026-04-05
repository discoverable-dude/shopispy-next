import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-time admin setup route
// Call: POST /api/admin/setup with { email: "your@email.com", setupKey: "your-secret" }
// This grants admin role to the specified email

export async function POST(request: Request) {
  const { email, setupKey } = await request.json();

  // Require a setup key to prevent unauthorized admin creation
  const expectedKey = process.env.ADMIN_SETUP_KEY;
  if (!expectedKey || setupKey !== expectedKey) {
    return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: `No user found with email ${email}` }, { status: 404 });
    }

    // Insert admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert(
        { user_id: user.id, role: "admin" },
        { onConflict: "user_id" }
      );

    if (roleError) {
      console.error("[ADMIN] Error setting role:", roleError);
      return NextResponse.json({ error: "Failed to set admin role" }, { status: 500 });
    }

    console.log(`[ADMIN] Admin role granted to ${email} (${user.id})`);
    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: email,
      role: "admin",
    });
  } catch (error) {
    console.error("[ADMIN] Setup error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
