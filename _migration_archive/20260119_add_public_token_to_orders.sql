-- Add public_token to orders table for secure guest order access
-- This allows buyers to access their order with a unique, unguessable token
-- without needing to log in (completing the secure anonymous checkout flow)

ALTER TABLE IF EXISTS orders 
ADD COLUMN IF NOT EXISTS public_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_orders_public_token ON orders(public_token);

-- Add comment explaining the purpose
COMMENT ON COLUMN orders.public_token IS 'Unique token for secure guest access to order details. Used in thank-you page URLs: /thank-you?token={public_token}';
