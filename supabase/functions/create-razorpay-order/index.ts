import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// These will be pulled from your Supabase Secret Vault
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Diagnostic logging helper
function logDiagnostics(stage: string, data: any) {
  console.log(`\n[RAZORPAY-DIAGNOSTICS] ${stage}`);
  console.log(JSON.stringify(data, null, 2));
}

Deno.serve(async (req) => {
  // 1. Handle CORS preflight request (MUST be first)
  if (req.method === 'OPTIONS') {
    logDiagnostics('CORS Preflight', { method: req.method });
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // 2. Validate request method
    if (req.method !== 'POST') {
      logDiagnostics('Invalid method', { method: req.method });
      return new Response(JSON.stringify({ 
        error: 'Only POST requests are allowed',
        received_method: req.method,
      }), {
        headers: corsHeaders,
        status: 405,
      });
    }

    // 3. Parse request body
    let requestData;
    try {
      requestData = await req.json();
      logDiagnostics('Request parsed successfully', requestData);
    } catch (parseError) {
      logDiagnostics('JSON Parse Error', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : String(parseError),
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    const { amount_paise, buyer_email, buyer_name, notes } = requestData;

    // 4. Validate required fields
    logDiagnostics('Field validation', {
      has_amount_paise: !!amount_paise,
      has_buyer_email: !!buyer_email,
      has_buyer_name: !!buyer_name,
      amount_paise_value: amount_paise,
      buyer_email_value: buyer_email,
      buyer_name_value: buyer_name,
    });

    if (!amount_paise || !buyer_email || !buyer_name) {
      const missingFields = [];
      if (!amount_paise) missingFields.push('amount_paise');
      if (!buyer_email) missingFields.push('buyer_email');
      if (!buyer_name) missingFields.push('buyer_name');

      logDiagnostics('Missing required fields', { missing: missingFields });

      return new Response(JSON.stringify({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received_fields: Object.keys(requestData),
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // 5. Validate amount is positive
    if (amount_paise <= 0) {
      logDiagnostics('Invalid amount', { amount_paise });
      return new Response(JSON.stringify({ 
        error: 'Amount must be greater than 0',
        received_amount: amount_paise,
      }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // 6. Validate environment variables
    logDiagnostics('Environment check', {
      has_key_id: !!RAZORPAY_KEY_ID,
      has_key_secret: !!RAZORPAY_KEY_SECRET,
      key_id_length: RAZORPAY_KEY_ID?.length || 0,
      key_secret_length: RAZORPAY_KEY_SECRET?.length || 0,
    });

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      logDiagnostics('Missing Razorpay credentials', {
        error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment',
      });
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing Razorpay credentials',
        status: 'error',
      }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    // 7. Build Basic Auth header
    // Matches curl: `curl -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET" ...`
    // (i.e., Authorization: Basic base64(key_id:key_secret))
    const keyId = RAZORPAY_KEY_ID.trim();
    const keySecret = RAZORPAY_KEY_SECRET.trim();
    const basicAuth = btoa(`${keyId}:${keySecret}`);
    logDiagnostics('Authorization header', {
      auth_format: `Basic [redacted - length: ${basicAuth.length}]`,
      using_credentials: 'YES - built from RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
    });

    // 8. Prepare Razorpay request payload
    const razorpayPayload = {
      amount: amount_paise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      // 🟢 THE FIX: Forces status to 'Captured' instead of 'Authorized'
      payment_capture: 1,
      notes: {
        buyer_email,
        buyer_name,
        ...notes,
      },
    };
    logDiagnostics('Razorpay API payload', razorpayPayload);

    // 9. Call Razorpay Orders API
    logDiagnostics('Calling Razorpay API', { url: 'https://api.razorpay.com/v1/orders' });
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(razorpayPayload),
    });

    // 10. Parse Razorpay response
    const orderData = await razorpayResponse.json();
    logDiagnostics('Razorpay response received', {
      status: razorpayResponse.status,
      status_ok: razorpayResponse.ok,
      response_body: orderData,
    });

    // 11. Check if Razorpay returned an error
    if (!razorpayResponse.ok) {
      logDiagnostics('Razorpay API Error', {
        status_code: razorpayResponse.status,
        error_object: orderData.error,
        full_response: orderData,
      });

      return new Response(JSON.stringify({ 
        error: orderData.error?.description || 'Failed to create Razorpay order',
        razorpay_error_code: orderData.error?.code,
        razorpay_error_description: orderData.error?.description,
        razorpay_error_source: orderData.error?.source,
        razorpay_error_reason: orderData.error?.reason,
        status: 'error',
      }), {
        headers: corsHeaders,
        status: razorpayResponse.status,
      });
    }

    // 12. Return successful order data to frontend
    const successResponse = {
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      created_at: new Date(orderData.created_at * 1000).toISOString(),
      status: 'success',
    };
    logDiagnostics('Success - returning to frontend', successResponse);

    return new Response(JSON.stringify(successResponse), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    // 13. Catch unexpected errors and return clear JSON
    logDiagnostics('Unexpected error caught', {
      error_type: error instanceof Error ? 'Error' : typeof error,
      error_message: error instanceof Error ? error.message : String(error),
      error_stack: error instanceof Error ? error.stack : null,
      full_error: JSON.stringify(error, null, 2),
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unexpected server error';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      status: 'error',
      timestamp: new Date().toISOString(),
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});