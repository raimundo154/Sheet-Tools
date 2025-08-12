-- ==========================================
-- SUPABASE SETUP: Daily ROAS Database
-- ==========================================

-- 1. Criar tabela daily_roas_data
CREATE TABLE IF NOT EXISTS daily_roas_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    
    -- Campos base (editáveis)
    price DECIMAL(10,2) DEFAULT 0,
    cog DECIMAL(10,2) DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0,
    cpc DECIMAL(10,4) DEFAULT 0,
    atc INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    
    -- Campos calculados (só leitura, mas salvos para performance)
    total_cog DECIMAL(12,2) DEFAULT 0,
    store_value DECIMAL(12,2) DEFAULT 0,
    margin_bruta DECIMAL(10,2) DEFAULT 0,
    ber DECIMAL(6,4),
    roas DECIMAL(6,4),
    cpa DECIMAL(8,2),
    margin_eur DECIMAL(12,2) DEFAULT 0,
    margin_pct DECIMAL(5,4),
    
    -- Metadados
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'excel-import', 'api'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_date_product UNIQUE(user_id, date, product_name),
    CONSTRAINT positive_price CHECK (price >= 0),
    CONSTRAINT positive_cog CHECK (cog >= 0),
    CONSTRAINT non_negative_units CHECK (units_sold >= 0),
    CONSTRAINT non_negative_spend CHECK (total_spend >= 0)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_roas_user_date ON daily_roas_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_roas_user_date_product ON daily_roas_data(user_id, date, product_name);
CREATE INDEX IF NOT EXISTS idx_daily_roas_created_at ON daily_roas_data(created_at);

-- 3. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_daily_roas_updated_at 
    BEFORE UPDATE ON daily_roas_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security) - Dados só visíveis para o próprio utilizador
ALTER TABLE daily_roas_data ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (utilizador só vê os seus dados)
CREATE POLICY "Users can view their own daily roas data" 
    ON daily_roas_data FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy para INSERT (utilizador só pode inserir dados para si)
CREATE POLICY "Users can insert their own daily roas data" 
    ON daily_roas_data FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE (utilizador só pode atualizar os seus dados)
CREATE POLICY "Users can update their own daily roas data" 
    ON daily_roas_data FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy para DELETE (utilizador só pode apagar os seus dados)
CREATE POLICY "Users can delete their own daily roas data" 
    ON daily_roas_data FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Função para obter resumo diário
CREATE OR REPLACE FUNCTION get_daily_summary(user_uuid UUID, target_date DATE)
RETURNS TABLE(
    total_spend DECIMAL,
    total_revenue DECIMAL,
    total_margin_eur DECIMAL,
    weighted_roas DECIMAL,
    product_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(d.total_spend), 0) as total_spend,
        COALESCE(SUM(d.store_value), 0) as total_revenue,
        COALESCE(SUM(d.margin_eur), 0) as total_margin_eur,
        CASE 
            WHEN SUM(d.total_spend) > 0 THEN SUM(d.store_value) / SUM(d.total_spend)
            ELSE 0
        END as weighted_roas,
        COUNT(*)::INTEGER as product_count
    FROM daily_roas_data d
    WHERE d.user_id = user_uuid 
    AND d.date = target_date;
END;
$$;

-- 6. Função para batch insert/update (importação Excel)
CREATE OR REPLACE FUNCTION upsert_daily_roas_batch(
    user_uuid UUID,
    target_date DATE,
    products_data JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- Loop através dos produtos
    FOR product_record IN 
        SELECT * FROM jsonb_to_recordset(products_data) AS x(
            product_name VARCHAR,
            price DECIMAL,
            cog DECIMAL,
            units_sold INTEGER,
            total_spend DECIMAL,
            cpc DECIMAL,
            atc INTEGER,
            purchases INTEGER,
            total_cog DECIMAL,
            store_value DECIMAL,
            margin_bruta DECIMAL,
            ber DECIMAL,
            roas DECIMAL,
            cpa DECIMAL,
            margin_eur DECIMAL,
            margin_pct DECIMAL,
            source VARCHAR
        )
    LOOP
        -- Insert ou update
        INSERT INTO daily_roas_data (
            user_id, date, product_name, price, cog, units_sold, total_spend,
            cpc, atc, purchases, total_cog, store_value, margin_bruta,
            ber, roas, cpa, margin_eur, margin_pct, source
        ) VALUES (
            user_uuid, target_date, product_record.product_name,
            product_record.price, product_record.cog, product_record.units_sold,
            product_record.total_spend, product_record.cpc, product_record.atc,
            product_record.purchases, product_record.total_cog, product_record.store_value,
            product_record.margin_bruta, product_record.ber, product_record.roas,
            product_record.cpa, product_record.margin_eur, product_record.margin_pct,
            COALESCE(product_record.source, 'manual')
        )
        ON CONFLICT (user_id, date, product_name) 
        DO UPDATE SET
            price = EXCLUDED.price,
            cog = EXCLUDED.cog,
            units_sold = EXCLUDED.units_sold,
            total_spend = EXCLUDED.total_spend,
            cpc = EXCLUDED.cpc,
            atc = EXCLUDED.atc,
            purchases = EXCLUDED.purchases,
            total_cog = EXCLUDED.total_cog,
            store_value = EXCLUDED.store_value,
            margin_bruta = EXCLUDED.margin_bruta,
            ber = EXCLUDED.ber,
            roas = EXCLUDED.roas,
            cpa = EXCLUDED.cpa,
            margin_eur = EXCLUDED.margin_eur,
            margin_pct = EXCLUDED.margin_pct,
            source = EXCLUDED.source,
            updated_at = NOW();
            
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$;

-- 7. Grant permissions para funções
GRANT EXECUTE ON FUNCTION get_daily_summary(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_daily_roas_batch(UUID, DATE, JSONB) TO authenticated;

-- 8. Comentários na tabela para documentação
COMMENT ON TABLE daily_roas_data IS 'Dados diários de ROAS por produto e utilizador';
COMMENT ON COLUMN daily_roas_data.user_id IS 'ID do utilizador (FK para auth.users)';
COMMENT ON COLUMN daily_roas_data.date IS 'Data dos dados (YYYY-MM-DD)';
COMMENT ON COLUMN daily_roas_data.source IS 'Origem dos dados: manual, excel-import, api';
COMMENT ON COLUMN daily_roas_data.ber IS 'Break Even ROAS = price / (price - cog)';
COMMENT ON COLUMN daily_roas_data.roas IS 'Return on Ad Spend = store_value / total_spend';
COMMENT ON COLUMN daily_roas_data.cpa IS 'Cost per Acquisition = total_spend / purchases';

-- ==========================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- ==========================================
-- 1. Copia este código SQL
-- 2. Vai ao Supabase Dashboard → SQL Editor
-- 3. Cola e executa este script
-- 4. Verifica se a tabela foi criada em Database → Tables
-- ==========================================
