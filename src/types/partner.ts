export interface Partner {
  id: string;
  code: string;
  name: string;
  upi_id: string;
  commission_rate: number;
  secret_key?: string;
  clicks?: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerStats {
  partner_code: string;
  partner_name: string;
  upi_id: string;
  commission_rate: number;
  total_sales: number;
  total_revenue: number;
  commission_owed: number;
}
