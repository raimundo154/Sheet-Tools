# 🌐 Configuração Variáveis de Ambiente - Netlify

## 📋 Variáveis Necessárias no Netlify Dashboard

Para o webhook Shopify funcionar, precisa configurar estas variáveis no **Netlify Dashboard**:

### 1. Ir ao Netlify Dashboard
1. Acede a [netlify.com](https://netlify.com)
2. Vai ao teu projeto **Sheet Tools**
3. Clica em **Site settings**
4. No menu lateral, clica em **Environment variables**

### 2. Adicionar Variáveis Obrigatórias

#### 🔐 SUPABASE_SERVICE_ROLE_KEY
```
Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: [IR BUSCAR NO SUPABASE DASHBOARD]
```

**Como obter a Service Role Key:**
1. Vai ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleciona o projeto **Sheet Tools**
3. Vai a **Settings** → **API**
4. Copia a **service_role key** (não a anon key!)

#### 🌐 SUPABASE_URL (já deve estar configurado)
```
Nome: SUPABASE_URL
Valor: https://dnamxsapwgltxmtokecd.supabase.co
```

#### 🛡️ SHOPIFY_WEBHOOK_SECRET (Opcional mas recomendado)
```
Nome: SHOPIFY_WEBHOOK_SECRET
Valor: [CRIAR UM SECRET FORTE]
```

**Como criar o webhook secret:**
1. Gera uma string aleatória forte (exemplo: usando openssl)
2. Configura essa mesma string no Shopify webhook
3. Adiciona no Netlify

### 3. Verificar Deploy
Depois de adicionar as variáveis:
1. Vai a **Deploys** no Netlify
2. Clica em **Trigger deploy** → **Deploy site**
3. Aguarda o deploy completar

### 4. Testar Webhook
URL do webhook: `https://teu-site.netlify.app/.netlify/functions/shopify-webhook`

## 🚨 Troubleshooting

### Se o webhook não funcionar:
1. Verifica os logs no Netlify: **Functions** → **shopify-webhook** → **View logs**
2. Confirma se todas as variáveis estão configuradas
3. Testa com uma venda no Shopify
4. Verifica se a função SQL `get_first_user()` foi criada no Supabase

### Logs importantes a procurar:
- ✅ "User ID encontrado: [uuid]"
- ❌ "Erro ao buscar user_id"
- 🏪 "Processando venda da loja: [domain]"

## 📞 URLs Importantes
- **Webhook URL**: `https://teu-site.netlify.app/.netlify/functions/shopify-webhook`
- **Netlify Dashboard**: `https://app.netlify.com`
- **Supabase Dashboard**: `https://supabase.com/dashboard`