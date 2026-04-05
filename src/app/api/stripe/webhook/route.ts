// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook handler
// Receives events from Stripe and updates subscription status in Supabase

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Verify the webhook signature using Stripe's library
  let event;
  try {
    // Dynamic import to avoid bundling Stripe in client
    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16" as any,
    });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[STRIPE] Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (customerEmail && subscriptionId) {
          // Get subscription details
          const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2023-10-16" as any,
          });
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0;

          // Determine tier from price
          let tier = "lite";
          if (priceAmount >= 4900) tier = "pro";
          else if (priceAmount >= 1900) tier = "starter";
          else if (priceAmount >= 900) tier = "lite";

          const { error } = await supabase
            .from("subscribers")
            .upsert(
              {
                email: customerEmail,
                stripe_customer_id: customerId,
                subscribed: true,
                subscription_tier: tier,
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            );

          if (error) console.error("[STRIPE] Error upserting subscriber:", error);
          else console.log(`[STRIPE] Subscription created: ${customerEmail} → ${tier}`);

          // Notify via Slack
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-slack-notification`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "new_subscription",
              title: "New Subscription",
              message: `${customerEmail} subscribed to ${tier}`,
              data: { user_email: customerEmail, subscription_tier: tier },
              severity: "success",
            }),
          }).catch(() => {});
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // Look up subscriber by Stripe customer ID
        const { data: subscriber } = await supabase
          .from("subscribers")
          .select("email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subscriber) {
          const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0;
          let tier = "lite";
          if (priceAmount >= 4900) tier = "pro";
          else if (priceAmount >= 1900) tier = "starter";

          const isActive = subscription.status === "active" || subscription.status === "trialing";

          await supabase
            .from("subscribers")
            .update({
              subscribed: isActive,
              subscription_tier: isActive ? tier : null,
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("email", subscriber.email);

          console.log(`[STRIPE] Subscription updated: ${subscriber.email} → ${isActive ? tier : "cancelled"}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        await supabase
          .from("subscribers")
          .update({
            subscribed: false,
            subscription_tier: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`[STRIPE] Subscription cancelled for customer ${customerId}`);
        break;
      }

      default:
        console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE] Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
