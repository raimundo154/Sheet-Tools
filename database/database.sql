-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_roas_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  date date NOT NULL,
  product_name character varying NOT NULL,
  price numeric DEFAULT 0 CHECK (price >= 0::numeric),
  cog numeric DEFAULT 0 CHECK (cog >= 0::numeric),
  units_sold integer DEFAULT 0 CHECK (units_sold >= 0),
  total_spend numeric DEFAULT 0 CHECK (total_spend >= 0::numeric),
  cpc numeric DEFAULT 0,
  atc integer DEFAULT 0,
  purchases integer DEFAULT 0,
  total_cog numeric DEFAULT 0,
  store_value numeric DEFAULT 0,
  margin_bruta numeric DEFAULT 0,
  ber numeric,
  roas numeric,
  cpa numeric,
  margin_eur numeric DEFAULT 0,
  margin_pct numeric,
  source character varying DEFAULT 'manual'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  shop_domain text,
  CONSTRAINT daily_roas_data_pkey PRIMARY KEY (id),
  CONSTRAINT daily_roas_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  amount integer NOT NULL,
  currency character varying NOT NULL DEFAULT 'EUR'::character varying,
  status character varying NOT NULL,
  payment_method character varying,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_history_pkey PRIMARY KEY (id),
  CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT payment_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  price numeric NOT NULL,
  shipping_time character varying,
  in_stock boolean DEFAULT true,
  image_url text,
  image_file_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  shop_domain text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stripe_price_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_amount integer NOT NULL,
  currency character varying NOT NULL DEFAULT 'EUR'::character varying,
  billing_period text NOT NULL CHECK (billing_period = ANY (ARRAY['monthly'::text, 'yearly'::text, 'trial'::text])),
  trial_days integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  shopify_domain text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_shops (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  shop_domain text NOT NULL UNIQUE,
  shop_name text,
  access_token text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_shops_pkey PRIMARY KEY (id),
  CONSTRAINT user_shops_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'trialing'::text, 'past_due'::text, 'unpaid'::text, 'incomplete'::text])),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.vendas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  produto text NOT NULL,
  preco numeric NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  total numeric DEFAULT (preco * (quantidade)::numeric),
  customer_email text,
  customer_name text,
  order_number text,
  financial_status text DEFAULT 'pending'::text,
  fulfillment_status text DEFAULT 'unfulfilled'::text,
  currency text DEFAULT 'EUR'::text,
  shop_domain text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  product_image_url text,
  user_id uuid,
  line_item_id text,
  CONSTRAINT vendas_pkey PRIMARY KEY (id),
  CONSTRAINT vendas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);