import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== ADMIN AUTHENTICATION ====================
// Creates an authenticated session for admin users with Supabase Auth
export async function authenticateAdmin(adminEmail: string, adminPassword: string) {
  try {
    // Sign in with the real admin email and password created in Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      console.error('❌ Supabase auth failed:', error.message);
      return { success: false, error: error.message, fallback: false };
    }

    console.log('✅ Supabase auth successful, JWT token created');
    return { success: true, fallback: false, session: data.session };
  } catch (err) {
    console.error('❌ Admin authentication error:', err);
    return { success: false, error: String(err), fallback: false };
  }
}

// Get current authenticated user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.debug('No authenticated user:', error.message);
    return null;
  }
  return data.user;
}

// Check if user is authenticated
export async function isUserAuthenticated() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

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

export interface Product {
  id: string;
  name: string;
  price_in_rupees: number;
  delivery_link: string;
  category?: string;
  product_type?: string;
  author?: string;
  cover_image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== PRODUCT MANAGEMENT ====================

// Fetch a single product by UUID — delivery_link intentionally excluded (storefront-safe)
export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_in_rupees, cover_image_url, category, author, product_type')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Product lookup by ID failed:', error.message);
    throw error;
  }
  return data as Product;
}

export async function getProductByName(productName: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('name', productName)
    .single();

  if (error) {
    console.error('Product lookup failed:', error.message);
    throw error;
  }
  return data as Product;
}

export async function getProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from('products')
    // delivery_link intentionally excluded from storefront queries — only fetched during checkout
    .select('id, name, price_in_rupees, cover_image_url, category, author, product_type, description')
    .eq('category', category)
    .eq('product_type', 'ebook')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch products by category:', error.message);
    return [];
  }
  return (data || []) as Product[];
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    // delivery_link intentionally excluded from storefront queries — only fetched during checkout
    .select('id, name, price_in_rupees, cover_image_url, category, author, product_type, description')
    .eq('product_type', 'ebook')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch all products:', error.message);
    return [];
  }
  return (data || []) as Product[];
}

// ==================== ADMIN PRODUCT CRUD ====================

export async function createProduct(productData: {
  name: string;
  price_in_rupees: number;
  delivery_link: string;
  category: string;
  cover_image_url?: string;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...productData,
      product_type: 'ebook',
    }])
    .select()
    .single();

  if (error) {
    console.error('Failed to create product:', error.message);
    throw error;
  }
  return data as Product;
}

export async function updateProduct(productId: string, productData: {
  name?: string;
  price_in_rupees?: number;
  delivery_link?: string;
  category?: string;
  cover_image_url?: string;
}) {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...productData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update product:', error.message);
    throw error;
  }
  return data as Product;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Failed to delete product:', error.message);
    throw error;
  }
  return true;
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

export async function updateOrderWithPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
}) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      razorpay_payment_id: params.razorpay_payment_id,
      // Keep status values consistent with existing schema/app logic
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', params.razorpay_order_id)
    .select('*')
    .maybeSingle();

  if (error) {
    // Log but don't throw — RLS may block the select for anonymous users
    // The update itself may have succeeded; the webhook will reconcile later
    console.warn('Database sync warning:', error.message);
    console.warn('Payment ID was:', params.razorpay_payment_id);
    // Return a minimal object so the redirect still happens
    return { razorpay_order_id: params.razorpay_order_id } as Order;
  }

  return (data ?? { razorpay_order_id: params.razorpay_order_id }) as Order;
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

// Replaces the N+1 loop in OrdersPanel: fetches all orders + their items in 1 query.
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export async function getAllOrdersWithItems(limit = 100) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as OrderWithItems[];
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
    // secret_key intentionally excluded — it is only accessed server-side via getCreatorStats()
    .select('id, code, name, upi_id, commission_rate, clicks, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

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
  // or through a secure admin-authenticated flow. The public frontend should not write to `partners`.
  // This function is intentionally blocked client-side.
  console.warn('[SUPABASE] createPartner blocked (client-side)', {
    code: partnerData.code,
    name: partnerData.name,
  });
  throw new Error('Partner creation must be done via Supabase Dashboard.');
}

export async function getPartnerStats(
  startDate?: string | Date,
  endDate?: string | Date
) {
  const { data: partners = [], error: partnersError } = await supabase
    .from('partners')
    // secret_key intentionally excluded — never sent to the admin browser
    .select('id, code, name, upi_id, commission_rate, clicks, created_at, updated_at');

  if (partnersError) throw partnersError;

  // Push all filters to DB — uses idx_orders_referral_created (Phase 1 index) for frugality.
  // Only completed referral orders are read; date bounds further constrain the scan.
  let ordersQuery = supabase
    .from('orders')
    .select('referral_code, total_amount_paise')
    .eq('payment_status', 'completed')
    .not('referral_code', 'is', null)
    .limit(1000); // hard safety cap — prevents unbounded reads

  if (startDate) {
    const iso = startDate instanceof Date ? startDate.toISOString() : startDate;
    ordersQuery = ordersQuery.gte('created_at', iso);
  }
  if (endDate) {
    const iso = endDate instanceof Date ? endDate.toISOString() : endDate;
    ordersQuery = ordersQuery.lte('created_at', iso);
  }

  const { data: orders = [], error: ordersError } = await ordersQuery;

  if (ordersError) throw ordersError;

  const stats = (partners || []).map((partner: any) => {
    // payment_status filter is now applied at DB level — no JS re-filter needed
    const partnerOrders = (orders || []).filter(
      (order: any) => order.referral_code === partner.code
    );

    const totalRevenue = partnerOrders.reduce(
      (sum: number, order: any) => sum + (order.total_amount_paise || 0),
      0
    );

    const commissionOwed = Math.round((totalRevenue * (partner.commission_rate || 0)) / 100);

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
  const partnerCodes = (partners || []).map((p: any) => p.code);
  const orphanedCodes = [...new Set(
    (orders || [])
      .filter((order: any) => order.referral_code && !partnerCodes.includes(order.referral_code))
      .map((order: any) => order.referral_code)
  )];

  const orphanedStats = orphanedCodes.map((code) => {
    // payment_status filter already applied at DB level
    const codeOrders = (orders || []).filter(
      (order: any) => order.referral_code === code
    );

    const totalRevenue = codeOrders.reduce(
      (sum: number, order: any) => sum + (order.total_amount_paise || 0),
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
  const normalizedSecretKey = secretKey.trim();

  // Fetch partner data from partners table by secret_key (exact match)
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, code, name, commission_rate, upi_id, clicks, secret_key')
    .eq('secret_key', normalizedSecretKey)
    .maybeSingle();

  if (partnerError) throw partnerError;
  if (!partner) return null;

  // Fetch all completed orders attributed to this partner's referral code
  const { data: orders = [], error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount_paise, payment_status')
    .eq('referral_code', partner.code)
    .eq('payment_status', 'completed');

  if (ordersError) throw ordersError;

  const totalSales = orders?.length || 0;

  // Sum all order amounts (stored in paise in database)
  const totalRevenuePaise = (orders || []).reduce((sum, order) => sum + order.total_amount_paise, 0);

  // Math.round() ensures integer-safe paise — prevents floating-point drift (e.g. ₹10.00000004)
  const earningsPaise = Math.round((totalRevenuePaise * partner.commission_rate) / 100);

  return {
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
}

