-- Script SQL para criar tabelas da integração Shopify
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela para configurações da Shopify
CREATE TABLE IF NOT EXISTS shopify_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL, -- Em produção, deve ser criptografado
  webhook_url TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir uma configuração por usuário
  CONSTRAINT unique_user_shopify_config UNIQUE(user_id)
);

-- 2. Adicionar campos Shopify à tabela de produtos existente
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku VARCHAR(255),
ADD COLUMN IF NOT EXISTS shopify_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shopify_variant_id VARCHAR(255);

-- 3. Criar tabela para quotations/pedidos
CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shopify_order_id VARCHAR(255),
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  order_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  products JSONB, -- Array de produtos do pedido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para log de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_type VARCHAR(100),
  shopify_order_id VARCHAR(255),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'received',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_shopify_configs_user_id ON shopify_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_configs_shop_name ON shopify_configs(shop_name);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_shopify_product_id ON products(shopify_product_id);

CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_shopify_order_id ON quotations(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_order_date ON quotations(order_date);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- 6. Habilitar RLS (Row Level Security) para as novas tabelas
ALTER TABLE shopify_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para shopify_configs
CREATE POLICY "Users can view their own shopify configs" ON shopify_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopify configs" ON shopify_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopify configs" ON shopify_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopify configs" ON shopify_configs
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Políticas RLS para quotations
CREATE POLICY "Users can view their own quotations" ON quotations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotations" ON quotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations" ON quotations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations" ON quotations
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Políticas RLS para webhook_logs
CREATE POLICY "Users can view their own webhook logs" ON webhook_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webhook logs" ON webhook_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Função para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Triggers para updated_at
CREATE TRIGGER update_shopify_configs_updated_at 
  BEFORE UPDATE ON shopify_configs 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at 
  BEFORE UPDATE ON quotations 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- 12. Função para processar webhooks (placeholder para implementação futura)
CREATE OR REPLACE FUNCTION process_shopify_webhook(
  webhook_data JSONB,
  webhook_type VARCHAR(100)
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Implementar lógica de processamento de webhook aqui
  -- Por agora, apenas registrar o webhook
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Webhook processado com sucesso',
    'webhook_type', webhook_type,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Comentários para documentação
COMMENT ON TABLE shopify_configs IS 'Configurações de integração com Shopify por usuário';
COMMENT ON TABLE quotations IS 'Quotations/Pedidos recebidos da Shopify';
COMMENT ON TABLE webhook_logs IS 'Log de webhooks recebidos da Shopify';

COMMENT ON COLUMN shopify_configs.access_token IS 'Token de acesso da API Shopify (deve ser criptografado em produção)';
COMMENT ON COLUMN quotations.products IS 'Array JSON com produtos do pedido';
COMMENT ON COLUMN webhook_logs.payload IS 'Payload completo do webhook recebido';

-- Script concluído!
-- Execute este script no SQL Editor do Supabase para criar toda a estrutura necessária
-- para a integração com Shopify.
