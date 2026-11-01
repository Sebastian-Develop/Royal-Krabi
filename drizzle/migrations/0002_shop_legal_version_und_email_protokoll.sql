ALTER TABLE public.shop_orders ADD COLUMN legal_version text NOT NULL DEFAULT '2026-10-21';

CREATE TABLE public.shop_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  kind text NOT NULL,
  success boolean NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_email_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_email_events FROM anon, authenticated;
CREATE INDEX shop_email_events_order_idx ON public.shop_email_events(order_id);