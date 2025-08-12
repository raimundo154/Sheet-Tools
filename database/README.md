# Database Setup

Este diretório contém scripts SQL necessários para configurar a base de dados.

## Configuração da Tabela user_profiles

Para habilitar o salvamento do domínio Shopify, execute o seguinte script no SQL Editor do Supabase:

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Acesse o seu projeto
- Clique em "SQL Editor" na barra lateral

### 2. Execute o Script
Copie e cole o conteúdo do arquivo `user_profiles.sql` no SQL Editor e execute.

### 3. O que o script faz:
- **Cria a tabela `user_profiles`** para armazenar configurações do usuário
- **Configura RLS (Row Level Security)** para segurança dos dados
- **Cria índices** para performance das consultas
- **Atualiza as funções RPC** usadas pelo webhook Shopify

### 4. Estrutura da Tabela

```sql
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID (referência ao auth.users),
  shopify_domain TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 5. Verificação

Após executar o script, você pode verificar se foi criado corretamente:

```sql
SELECT * FROM user_profiles LIMIT 5;
```

## Funções RPC Disponíveis

- `get_user_by_shop_domain(domain TEXT)` - Obtém user_id pelo domínio Shopify
- `get_first_user()` - Obtém o primeiro usuário (fallback)

Estas funções são usadas pelo webhook Shopify para associar vendas aos usuários corretos.