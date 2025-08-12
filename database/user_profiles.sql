-- Criar tabela user_profiles se não existir
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shopify_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário tem apenas um perfil
  UNIQUE(user_id)
);

-- Criar índice para consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Criar índice para consultas por domínio Shopify (para webhook)
CREATE INDEX IF NOT EXISTS idx_user_profiles_shopify_domain ON user_profiles(shopify_domain);

-- Habilitar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só possam ver/editar o próprio perfil
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON user_profiles;
CREATE POLICY "Users can view and edit their own profile" 
ON user_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Função para obter user_id pelo domínio Shopify (usada pelo webhook)
CREATE OR REPLACE FUNCTION get_user_by_shop_domain(domain TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_user_id UUID;
BEGIN
  -- Buscar o usuário pelo domínio Shopify
  SELECT user_id INTO result_user_id
  FROM user_profiles
  WHERE shopify_domain = domain
  LIMIT 1;
  
  RETURN result_user_id;
END;
$$;

-- Função para obter o primeiro usuário (fallback)
CREATE OR REPLACE FUNCTION get_first_user()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_user_id UUID;
BEGIN
  -- Buscar o primeiro usuário disponível
  SELECT id INTO result_user_id
  FROM auth.users
  WHERE email_confirmed_at IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;
  
  RETURN result_user_id;
END;
$$;