CREATE TABLE public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'awaiting_payment',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  delivery text NOT NULL,
  street text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'DE',
  recipient text NOT NULL DEFAULT '',
  gift_text text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  total_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  access_token uuid NOT NULL DEFAULT gen_random_uuid()
);
GRANT ALL ON public.shop_orders TO service_role;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_kind text NOT NULL,
  quantity integer NOT NULL,
  unit_price_cents integer NOT NULL,
  subtotal_cents integer NOT NULL
);
GRANT ALL ON public.shop_order_items TO service_role;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shop_payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  sumup_checkout_id text UNIQUE,
  hosted_checkout_url text,
  status text NOT NULL DEFAULT 'PENDING',
  verified_at timestamptz
);
GRANT ALL ON public.shop_payment_attempts TO service_role;
ALTER TABLE public.shop_payment_attempts ENABLE ROW LEVEL SECURITY;