ALTER TABLE public.shop_orders ADD COLUMN customer_email_claimed_at timestamptz;
ALTER TABLE public.shop_orders ADD COLUMN operator_email_claimed_at timestamptz;
COMMENT ON COLUMN public.shop_orders.customer_email_claimed_at IS 'Atomic per-order delivery claim; retained on uncertain send outcomes to prevent duplicate confirmations.';
COMMENT ON COLUMN public.shop_orders.operator_email_claimed_at IS 'Atomic per-order operator notice claim; retained on uncertain send outcomes.';
GRANT ALL ON public.shop_email_events TO service_role;
REVOKE ALL ON public.shop_email_events FROM anon, authenticated;