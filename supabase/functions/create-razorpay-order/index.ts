import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// These will be pulled from your Supabase Secret Vault
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

Deno.serve(async (req) => {
  // 1. Handle CORS (Essential so your website can talk to this function)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { amount, currency, receipt, notes } = await req.json();

    // 2. The Handshake: Call Razorpay Orders API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount,      // Amount in paise (e.g., 10000 for ₹100)
        currency: currency || "INR",
        receipt,     // Your internal tracking ID
        notes,       // Metadata (like productId)
      }),
    });

    const orderData = await response.json();

    // 3. Return the Order ID to your Frontend
    return new Response(JSON.stringify(orderData), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: response.status,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});