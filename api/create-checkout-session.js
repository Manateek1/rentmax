// /api/create-checkout-session.js
import Stripe from "stripe";

// Initialize Stripe with your secret key from Vercel env vars
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.PRICE_ID, // Your test Price ID
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/?paid=1`,
      cancel_url: `${req.headers.origin}/?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message });
  }
}
