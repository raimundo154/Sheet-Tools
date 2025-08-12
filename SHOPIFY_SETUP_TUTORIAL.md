# 📝 Mini Tutorial: Configuração de Webhooks Shopify

## 🎯 Problema Resolvido
Agora as vendas serão associadas à loja correta baseada no `shop_domain` do Shopify.

## 🔧 Passos de Configuração

### 1. 📊 Configurar Base de Dados (PRIMEIRO!)
Execute este SQL no **Supabase SQL Editor**:

```sql
-- 1. Associar sua loja ao seu usuário
INSERT INTO user_shops (user_id, shop_domain, shop_name, is_active) VALUES
(
  -- Substitua pelo SEU UUID (veja abaixo como encontrar)
  'SEU_USER_UUID_AQUI',
  -- Substitua pelo SEU domínio Shopify
  'sua-loja.myshopify.com',
  'Nome da Sua Loja',
  true
)
ON CONFLICT (shop_domain) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  shop_name = EXCLUDED.shop_name,
  is_active = EXCLUDED.is_active;
```

### 2. 🔍 Como Encontrar Seu User UUID
Execute no **Supabase SQL Editor**:

```sql
-- Encontrar seu UUID pelo email
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
```

### 3. 🔗 Configurar Webhook no Shopify

1. **Acesse:** Admin da sua loja → Settings → Notifications
2. **Role até:** "Webhooks" section
3. **Clique:** "Create webhook"
4. **Configure:**
   - **Event:** Order payment
   - **Format:** JSON
   - **URL:** `https://SEU_SITE.netlify.app/.netlify/functions/shopify-webhook`
   - **API Version:** 2023-10 (ou mais recente)

### 4. ⚡ Variáveis de Ambiente no Netlify

Configure em **Netlify Dashboard → Site settings → Environment variables**:

```bash
SUPABASE_URL=https://dnamxsapwgltxmtokecd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY_AQUI
SHOPIFY_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET (opcional mas recomendado)
```

### 5. 🧪 Testar Configuração

Execute no **Supabase SQL Editor** para verificar:

```sql
-- Verificar se sua loja está registrada
SELECT * FROM user_shops WHERE user_id = 'SEU_USER_UUID';

-- Testar função de busca
SELECT get_user_by_shop_domain('sua-loja.myshopify.com');
```

## ✅ Como Funciona Agora

1. **Webhook recebe venda** → Pega `shop_domain` da ordem
2. **Sistema busca** → Usa `get_user_by_shop_domain()` para encontrar o usuário correto
3. **Venda é associada** → Ao usuário proprietário da loja específica
4. **Fallback seguro** → Se não encontrar, usa o primeiro usuário disponível

## 🚨 Importante

- **Execute o passo 1 ANTES** de configurar o webhook
- **Substitua todos os placeholders** pelos seus dados reais
- **Teste sempre** com uma venda de teste após configurar
- **Cada loja** deve estar associada ao usuário correto na tabela `user_shops`

## 🔧 Resolução de Problemas

Se as vendas ainda não aparecem:

1. **Verifique logs** no Netlify Functions
2. **Confirme associação** da loja na base de dados
3. **Teste webhook** com ferramenta como Postman
4. **Verifique variáveis** de ambiente no Netlify