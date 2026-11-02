ALTER TABLE public.shop_orders ADD COLUMN discount_checked_at timestamptz;
ALTER TABLE public.shop_orders ADD COLUMN discount_valid boolean;