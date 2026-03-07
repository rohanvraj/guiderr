import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// These will be pulled from your Supabase Secret Vault
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

// ─── Strict CORS: only your production domain + localhost for testing ───
const ALLOWED_ORIGINS = [
  'https://guiderr.in',
  'https://www.guiderr.in',
  'https://legendary-guiderr-662402.netlify.app',
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

// ─── In-memory rate limiter (resets on cold start — fine for Edge Functions) ───
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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // 1. Handle CORS preflight request (MUST be first)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200,
    });
  }

  // 2. Reject disallowed origins
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403,
    });
  }

  // 3. Rate limit by IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';

  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      headers: corsHeaders,
      status: 429,
    });
  }

  try {
    // 4. Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Only POST requests are allowed',
      }), {
        headers: corsHeaders,
        status: 405,
      });
    }

    // 5. Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (_parseError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    const { amount_paise, buyer_email, buyer_name, notes } = requestData;

    // 6. Validate required fields
    if (!amount_paise || !buyer_email || !buyer_name) {
      const missingFields = [];
      if (!amount_paise) missingFields.push('amount_paise');
      if (!buyer_email) missingFields.push('buyer_email');
      if (!buyer_name) missingFields.push('buyer_name');

      return new Response(JSON.stringify({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // 7. Input validation — email format, name length, amount range
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer_email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    if (typeof buyer_name !== 'string' || buyer_name.length < 2 || buyer_name.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Amount range: ₹1 – ₹50,000 in paise
    if (!Number.isInteger(amount_paise) || amount_paise < 100 || amount_paise > 5_000_000) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // 8. Validate environment variables
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    // 9. Build Basic Auth header
    const keyId = RAZORPAY_KEY_ID.trim();
    const keySecret = RAZORPAY_KEY_SECRET.trim();
    const basicAuth = btoa(`${keyId}:${keySecret}`);

    // 10. Prepare Razorpay request payload
    const razorpayPayload = {
      amount: amount_paise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      // 🟢 Forces status to 'Captured' instead of 'Authorized'
      payment_capture: 1,
      notes: {
        buyer_email,
        buyer_name,
        ...notes,
      },
    };

    // 11. Call Razorpay Orders API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(razorpayPayload),
    });

    // 12. Parse Razorpay response
    const orderData = await razorpayResponse.json();

    // 13. Check if Razorpay returned an error
    if (!razorpayResponse.ok) {
      return new Response(JSON.stringify({ 
        error: orderData.error?.description || 'Failed to create Razorpay order',
        status: 'error',
      }), {
        headers: corsHeaders,
        status: razorpayResponse.status,
      });
    }

    // 14. Return successful order data to frontend
    return new Response(JSON.stringify({
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      created_at: new Date(orderData.created_at * 1000).toISOString(),
      status: 'success',
    }), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    // 15. Catch unexpected errors — return safe message without leaking stack traces
    return new Response(JSON.stringify({ 
      error: 'Unexpected server error',
      status: 'error',
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});