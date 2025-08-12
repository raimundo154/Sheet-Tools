-- Criar tabela para associar usuários às suas lojas Shopify
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Criar tabela user_shops para mapear usuários às suas lojas
CREATE TABLE user_shops (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  shop_name TEXT,
  access_token TEXT, -- Token de acesso da loja (criptografado)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Garantir que cada loja só pode estar associada a um usuário
  UNIQUE(shop_domain)
);

-- 2. Criar índices para performance
CREATE INDEX idx_user_shops_user_id ON user_shops(user_id);
CREATE INDEX idx_user_shops_domain ON user_shops(shop_domain);

-- 3. Trigger para atualizar updated_at
CREATE TRIGGER update_user_shops_updated_at
    BEFORE UPDATE ON user_shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Políticas RLS para user_shops
ALTER TABLE user_shops ENABLE ROW LEVEL SECURITY;

-- Usuários só veem suas próprias lojas
CREATE POLICY "Usuários veem suas lojas" ON user_shops
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias lojas
CREATE POLICY "Usuários inserem suas lojas" ON user_shops
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias lojas
CREATE POLICY "Usuários atualizam suas lojas" ON user_shops
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role pode fazer tudo (para webhook)
CREATE POLICY "Service role acesso total user_shops" ON user_shops
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Comentários para documentação
COMMENT ON TABLE user_shops IS 'Associação entre usuários e suas lojas Shopify';
COMMENT ON COLUMN user_shops.user_id IS 'ID do usuário proprietário da loja';
COMMENT ON COLUMN user_shops.shop_domain IS 'Domínio da loja Shopify (ex: minhaloja.myshopify.com)';
COMMENT ON COLUMN user_shops.access_token IS 'Token de acesso da loja (deve ser criptografado)';

-- 6. Inserir dados de exemplo (substitua pelos dados reais)
INSERT INTO user_shops (user_id, shop_domain, shop_name, is_active) VALUES
-- Você precisará substituir 'USER_UUID_AQUI' pelo UUID real do usuário
-- Para obter o UUID: SELECT id FROM auth.users WHERE email = 'seu@email.com';
('00000000-0000-0000-0000-000000000000', 'tech-store.myshopify.com', 'Tech Store', true),
('00000000-0000-0000-0000-000000000000', 'fashion-store.myshopify.com', 'Fashion Store', true)
ON CONFLICT (shop_domain) DO NOTHING;

-- 7. Função para buscar user_id pela shop_domain (será usada pelo webhook)
CREATE OR REPLACE FUNCTION get_user_by_shop_domain(domain TEXT)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT user_id INTO user_uuid
    FROM user_shops
    WHERE shop_domain = domain AND is_active = true
    LIMIT 1;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;