-- Adicionar controle de acesso por usuário na tabela vendas
-- Execute este SQL no painel do Supabase em: SQL Editor

-- 1. Adicionar coluna user_id para associar vendas aos usuários
ALTER TABLE vendas 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Criar índice para performance
CREATE INDEX idx_vendas_user_id ON vendas(user_id);

-- 3. Adicionar comentário para documentação
COMMENT ON COLUMN vendas.user_id IS 'ID do usuário proprietário da venda (referencia auth.users)';

-- 4. Atualizar políticas RLS para controle de acesso por usuário
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON vendas;
DROP POLICY IF EXISTS "Permitir inserção via service role" ON vendas;

-- 5. Nova política: usuários só veem suas próprias vendas
CREATE POLICY "Usuários veem apenas suas vendas" ON vendas
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Nova política: permitir inserção via service role (webhook)
CREATE POLICY "Permitir inserção via service role" ON vendas
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 7. Nova política: usuários podem atualizar suas próprias vendas (se necessário)
CREATE POLICY "Usuários atualizam suas vendas" ON vendas
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. Verificar se as mudanças foram aplicadas
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL"
FROM information_schema.columns 
WHERE table_name = 'vendas' 
AND column_name = 'user_id';

-- 9. Verificar políticas atualizadas
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    roles as "Funções"
FROM pg_policies 
WHERE tablename = 'vendas';