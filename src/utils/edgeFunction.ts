/**
 * Edge Function Service
 * Handles communication with Supabase Edge Functions
 * Includes comprehensive diagnostic logging for 400 Bad Request debugging
 */

const EDGE_FUNCTION_URL = 'https://luxeufxyluqxrwuejjpx.supabase.co/functions/v1/create-razorpay-order';

export interface CreateRazorpayOrderRequest {
  amount_paise: number; // Amount in paise (e.g., ₹100 = 10000)
  buyer_email: string;
  buyer_name: string;
  notes?: Record<string, any>;
}

export interface CreateRazorpayOrderResponse {
  id: string; // Razorpay order ID
  amount: number;
  currency: string;
  receipt?: string;
  created_at: string;
  status?: 'success' | 'error';
}

/**
 * Call Edge Function to create a Razorpay order
 * @param request - Order creation request with amount in paise
 * @returns Razorpay order response with order ID
 * @throws Error with clear message if something fails
 */
export async function createRazorpayOrderViaEdgeFunction(
  request: CreateRazorpayOrderRequest
): Promise<CreateRazorpayOrderResponse> {
  try {
    // Validate request before sending
    console.log('[EDGE-FUNCTION] Starting order creation');
    console.log('[EDGE-FUNCTION] Request validation:', {
      amount_paise: request.amount_paise,
      buyer_email: request.buyer_email,
      buyer_name: request.buyer_name,
      notes: request.notes,
    });

    if (!request.amount_paise || request.amount_paise <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!request.buyer_email) {
      throw new Error('Buyer email is required');
    }
    if (!request.buyer_name) {
      throw new Error('Buyer name is required');
    }

    // Log payload being sent
    const payload = {
      amount_paise: request.amount_paise,
      buyer_email: request.buyer_email,
      buyer_name: request.buyer_name,
      notes: request.notes,
    };
    console.log('[EDGE-FUNCTION] Sending payload:', JSON.stringify(payload, null, 2));
    console.log('[EDGE-FUNCTION] Calling URL:', EDGE_FUNCTION_URL);

    // Make the request to Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Log response metadata
    console.log('[EDGE-FUNCTION] Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      },
    });

    // Parse response body as JSON
    let responseData: any;
    try {
      responseData = await response.json();
      console.log('[EDGE-FUNCTION] Response body parsed:', JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.error('[EDGE-FUNCTION] Failed to parse response as JSON:', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        statusText: response.statusText,
      });
      throw new Error(
        `Invalid response from Edge Function: ${response.statusText || 'Unknown error'}`
      );
    }

    // Check if response is not OK (4xx or 5xx)
    if (!response.ok) {
      console.error('[EDGE-FUNCTION] Error response:', JSON.stringify(responseData, null, 2));

      // Extract error message from response
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        `Edge Function returned status ${response.status}`;
      
      console.error('[EDGE-FUNCTION] Error extracted:', errorMessage);
      throw new Error(errorMessage);
    }

    // Validate response has required order ID
    if (!responseData.id) {
      console.error('[EDGE-FUNCTION] Invalid response - missing order ID:', JSON.stringify(responseData, null, 2));
      throw new Error('No order ID returned from Edge Function');
    }

    // Return typed response (ensure it's an object, not stringified)
    const result = {
      id: responseData.id,
      amount: responseData.amount,
      currency: responseData.currency || 'INR',
      receipt: responseData.receipt,
      created_at: responseData.created_at,
      status: responseData.status || 'success',
    };
    
    console.log('[EDGE-FUNCTION] Success! Returning:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    // Log the full error for debugging
    console.error('[EDGE-FUNCTION] Caught error:', {
      error_type: error instanceof Error ? 'Error' : typeof error,
      error_message: error instanceof Error ? error.message : String(error),
      full_error: JSON.stringify(error, null, 2),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Extract message safely
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Failed to create Razorpay order';

    console.error('[EDGE-FUNCTION] Final error thrown:', errorMessage);

    // Throw error with clear message (frontend will display this)
    throw new Error(errorMessage);
  }
}
