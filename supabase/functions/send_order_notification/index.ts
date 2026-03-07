import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── Strict CORS: only your production domain + localhost for testing ───
const ALLOWED_ORIGINS = [
  'https://guiderr.in',
  'https://www.guiderr.in',
  'https://legendary-guiderr-662402.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

// ─── In-memory rate limiter ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(clientIp: string, maxRequests = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

interface OrderNotificationRequest {
  order_id: string;
  buyer_name: string;
  buyer_email: string;
  total_amount: number;
  products: Array<{
    title: string;
    price: number;
  }>;
  referral_code?: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Reject disallowed origins
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limit by IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';

  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests.' }), {
      status: 429,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const payload: OrderNotificationRequest = await req.json();

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@guiderr.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Order recorded. Email notifications disabled.",
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    const productsList = payload.products
      .map((p) => `- ${p.title}: ₹${(p.price / 100).toLocaleString("en-IN")}`)
      .join("\n");

    const adminEmailBody = `
New Order Received!

Order ID: ${payload.order_id}
Buyer: ${payload.buyer_name} (${payload.buyer_email})

Products:
${productsList}

Total Amount: ₹${(payload.total_amount / 100).toLocaleString("en-IN")}
${
      payload.referral_code
        ? `Referral: ${payload.referral_code}`
        : "Direct Purchase"
    }

Action Required:
1. Log in to admin dashboard at /admin
2. Find this order and mark as delivered after sending the digital product
3. Use the order details to send the product to the buyer
    `;

    const buyerEmailBody = `
Thank you for your purchase!

Dear ${payload.buyer_name},

Your order has been received. Your digital product(s) will be sent to this email within 2-4 hours.

Order Details:
${productsList}

Total Paid: ₹${(payload.total_amount / 100).toLocaleString("en-IN")}

Order ID: ${payload.order_id}

If you don't receive the product within 4 hours, please check your spam folder or contact support at support@guiderr.com

Best regards,
Guiderr Team
    `;

    const emailsToSend = [
      {
        to: adminEmail,
        subject: `New Order: ${payload.order_id}`,
        html: adminEmailBody.replace(/\n/g, "<br/>"),
      },
      {
        to: payload.buyer_email,
        subject: "Your Guiderr Purchase - Digital Product Coming Soon!",
        html: buyerEmailBody.replace(/\n/g, "<br/>"),
      },
    ];

    const results = [];
    for (const email of emailsToSend) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Guiderr <noreply@guiderr.com>",
            to: email.to,
            subject: email.subject,
            html: email.html,
          }),
        });

        results.push({
          to: email.to,
          success: response.ok,
        });
      } catch (err) {
        console.error(`Failed to send email to ${email.to}:`, err);
        results.push({
          to: email.to,
          success: false,
          error: String(err),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order notification processed",
        results,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process notification",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
