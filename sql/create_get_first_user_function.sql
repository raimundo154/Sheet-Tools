-- Criar função para buscar primeiro usuário (fallback para webhook)
-- Execute este SQL no painel do Supabase em: SQL Editor

-- Função para buscar o primeiro usuário disponível
CREATE OR REPLACE FUNCTION get_first_user()
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar qualquer usuário na tabela auth.users
    SELECT id INTO user_uuid
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função
SELECT 
    'Teste da função:' as info,
    get_first_user() as primeiro_usuario;

-- Verificar se há usuários na base
SELECT 
    'Usuários na base:' as info,
    COUNT(*) as total_usuarios,
    MIN(created_at) as primeiro_usuario_criado
FROM auth.users;