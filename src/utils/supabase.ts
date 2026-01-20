import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: string;
  razorpay_order_id: string;
  public_token: string;
  buyer_email: string;
  buyer_name: string;
  total_amount_paise: number;
  referral_code?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  delivery_status: 'pending' | 'delivered';
  razorpay_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  price: number;
  delivery_link_sent: boolean;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  upi_id: string;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export async function createOrder(orderData: {
  razorpay_order_id: string;
  buyer_email: string;
  buyer_name: string;
  total_amount_paise: number;
  referral_code?: string;
  notes?: string; // <--- 1. Added here so the function accepts the link
}) {
  // Generate a unique token for secure guest access to the order
  const publicToken = crypto.randomUUID();

  // The ...orderData here will now include 'notes' because we added it above
  const { error } = await supabase
    .from('orders')
    .insert([{
      ...orderData,
      public_token: publicToken,
    }], { returning: 'minimal' });

  if (error) {
    console.error('Order insertion failed:', error.message);
    throw error;
  }

  return {
    id: orderData.razorpay_order_id,
    razorpay_order_id: orderData.razorpay_order_id,
    public_token: publicToken,
    buyer_email: orderData.buyer_email,
    buyer_name: orderData.buyer_name,
    total_amount_paise: orderData.total_amount_paise,
    notes: orderData.notes, // <--- 2. Added here so the Thank You page gets it back
    payment_status: 'pending' as const,
    delivery_status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Order;
}

export async function addOrderItems(
  orderId: string,
  items: Array<{
    product_id: string;
    product_title: string;
    price: number;
  }>
) {
  // Note: orderId here is actually the razorpay_order_id from anonymous checkout
  // We need to find the actual UUID order record to link order_items to it
  // Query by razorpay_order_id to get the real order ID
  const { data: orderData, error: queryError } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', orderId)
    .maybeSingle();

  if (queryError || !orderData) {
    console.error('Failed to find order by razorpay_order_id:', queryError?.message);
    throw new Error(`Could not find order with ID: ${orderId}`);
  }

  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: orderData.id,
  }));

  const { data, error } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select();

  if (error) {
    console.error('Failed to insert order items:', error.message);
    throw error;
  }
  return data as OrderItem[];
}

export async function updateOrderPayment(orderId: string, paymentData: {
  razorpay_payment_id: string;
  payment_status: 'completed' | 'failed';
}) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      razorpay_payment_id: paymentData.razorpay_payment_id,
      payment_status: paymentData.payment_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Order;
}

export async function getOrderByRazorpayId(razorpayOrderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export async function getOrderByPublicToken(publicToken: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('buyer_name, notes, total_amount_paise, public_token, created_at')
    .eq('public_token', publicToken)
    .maybeSingle();

  if (error) throw error;
  return data as Partial<Order> | null;
}

export async function getOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data as OrderItem[];
}

export async function addReferralTracking(referralData: {
  order_id: string;
  referral_code: string;
  commission_amount: number;
}) {
  const { data, error } = await supabase
    .from('referral_tracking')
    .insert([referralData])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllOrders(limit = 100) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Order[];
}

export async function markOrderAsDelivered(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      delivery_status: 'delivered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Order;
}

export async function markItemAsDelivered(itemId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .update({ delivery_link_sent: true })
    .eq('id', itemId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as OrderItem;
}

// ==================== PARTNER MANAGEMENT ====================

export async function getAllPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Partner[];
}

export async function createPartner(partnerData: {
  code: string;
  name: string;
  upi_id: string;
  commission_rate: number;
}) {
  // ⚠️ SECURITY: Partner creation must be done via Supabase Dashboard
  // or through a secure admin auth flow. Frontend cannot write to partners table.
  throw new Error(
    'Partner creation is disabled on frontend for security reasons. ' +
    'Please create partners via the Supabase Dashboard or secure admin console.'
  );
}

export async function deletePartner(partnerId: string) {
  // ⚠️ SECURITY: Partner deletion must be done via Supabase Dashboard
  throw new Error(
    'Partner deletion is disabled on frontend for security reasons. ' +
    'Please delete partners via the Supabase Dashboard.'
  );
}

export async function getPartnerStats() {
  // Get all partners using anon client (read-only)
  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('*');

  if (partnersError) throw partnersError;

  // Get all completed orders with referral codes
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('referral_code, total_amount_paise, payment_status')
    .not('referral_code', 'is', null);

  if (ordersError) throw ordersError;

  // Calculate stats for each partner
  const stats = partners.map(partner => {
    const partnerOrders = orders.filter(
      order => order.referral_code === partner.code && order.payment_status === 'completed'
    );

    const totalRevenue = partnerOrders.reduce(
      (sum, order) => sum + order.total_amount_paise,
      0
    );

    const commissionOwed = (totalRevenue * partner.commission_rate) / 100;

    return {
      partner_code: partner.code,
      partner_name: partner.name,
      partner_id: partner.id,
      upi_id: partner.upi_id,
      commission_rate: partner.commission_rate,
      total_sales: partnerOrders.length,
      total_revenue: totalRevenue,
      commission_owed: commissionOwed,
    };
  });

  // Also check for orphaned referral codes (codes in orders but not in partners table)
  const partnerCodes = partners.map(p => p.code);
  const orphanedCodes = [...new Set(
    orders
      .filter(order => order.referral_code && !partnerCodes.includes(order.referral_code))
      .map(order => order.referral_code)
  )];

  const orphanedStats = orphanedCodes.map(code => {
    const codeOrders = orders.filter(
      order => order.referral_code === code && order.payment_status === 'completed'
    );

    const totalRevenue = codeOrders.reduce(
      (sum, order) => sum + order.total_amount_paise,
      0
    );

    return {
      partner_code: code!,
      partner_name: `[Unregistered: ${code}]`,
      partner_id: null,
      upi_id: 'N/A',
      commission_rate: 0,
      total_sales: codeOrders.length,
      total_revenue: totalRevenue,
      commission_owed: 0,
    };
  });

  return [...stats, ...orphanedStats];
}

// ==================== CREATOR STATS ====================

export async function getCreatorStats(secretKey: string) {
  // Trim and normalize secret key
  const normalizedSecretKey = secretKey.trim();
  
  console.log('[DEBUG] getCreatorStats - Input secretKey:', secretKey);
  console.log('[DEBUG] getCreatorStats - Normalized secretKey:', normalizedSecretKey);
  
  // Fetch partner data from partners table by secret_key (exact match)
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, code, name, commission_rate, upi_id, clicks, secret_key')
    .eq('secret_key', normalizedSecretKey)
    .maybeSingle();

  if (partnerError) throw partnerError;
  
  console.log('[DEBUG] getCreatorStats - Partner lookup result:', partner);
  
  if (!partner) {
    console.log('[DEBUG] getCreatorStats - Partner not found for secret_key:', normalizedSecretKey);
    return null;
  }

  // Fetch all completed orders for this referral code (using partner's code field)
  // Using columns: referral_code, total_amount_paise, payment_status
  const { data: orders = [], error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount_paise, payment_status')
    .eq('referral_code', partner.code)
    .eq('payment_status', 'completed');

  if (ordersError) throw ordersError;
  
  console.log('[DEBUG] getCreatorStats - Orders found:', orders?.length || 0);
  console.log('[DEBUG] getCreatorStats - Orders data:', orders);

  // Calculate stats (gracefully handle zero orders)
  const totalSales = orders?.length || 0;
  
  // Sum all order amounts (stored in paise in database)
  const totalRevenuePaise = (orders || []).reduce((sum, order) => sum + order.total_amount_paise, 0);
  
  // Calculate earnings: (totalRevenue * commission_rate) / 100
  // Result is in paise (e.g., 900,000 paise = 9,000 rupees at 50% commission)
  const earningsPaise = (totalRevenuePaise * partner.commission_rate) / 100;

  const result = {
    partner: {
      name: partner.name,
      code: partner.code,
      commission_rate: partner.commission_rate,
      clicks: partner.clicks || 0,
    },
    stats: {
      totalClicks: partner.clicks || 0,
      totalSales,
      totalRevenuePaise, // In paise from database
      earningsPaise,     // In paise (calculated)
    },
  };
  
  console.log('[DEBUG] getCreatorStats - Final result:', result);
  return result;
}

