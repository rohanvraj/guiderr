import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: string;
  razorpay_order_id: string;
  buyer_email: string;
  buyer_name: string;
  total_amount: number;
  referral_code?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  delivery_status: 'pending' | 'delivered';
  razorpay_payment_id?: string;
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

export async function createOrder(orderData: {
  razorpay_order_id: string;
  buyer_email: string;
  buyer_name: string;
  total_amount: number;
  referral_code?: string;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Order;
}

export async function addOrderItems(
  orderId: string,
  items: Array<{
    product_id: string;
    product_title: string;
    price: number;
  }>
) {
  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: orderId,
  }));

  const { data, error } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select();

  if (error) throw error;
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
