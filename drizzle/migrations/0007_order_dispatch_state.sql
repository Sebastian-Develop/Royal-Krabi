ALTER TABLE public.shop_orders ADD COLUMN dispatch jsonb;
COMMENT ON COLUMN public.shop_orders.dispatch IS 'Operator-confirmed fulfillment with permanent atomic dispatch email claim and truthful provider outcome. Separate from payment and legal documents. No automatic retry.';
ALTER TABLE public.shop_orders ADD CONSTRAINT shop_orders_dispatch_object CHECK (dispatch IS NULL OR (jsonb_typeof(dispatch) = 'object' AND dispatch->>'emailStatus' IN ('sending','sent','failed','uncertain')));
GRANT ALL ON public.shop_orders TO service_role;
REVOKE ALL ON public.shop_orders FROM anon, authenticated;