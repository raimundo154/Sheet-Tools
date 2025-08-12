-- Verificar se a tabela user_profiles existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles';

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Teste de inserção (substitua 'USER_ID_AQUI' pelo seu user_id real)
-- SELECT auth.uid(); -- Use este comando para obter seu user_id atual

-- Para testar inserção manual:
-- INSERT INTO user_profiles (user_id, shopify_domain) 
-- VALUES ('USER_ID_AQUI', 'teste.myshopify.com');