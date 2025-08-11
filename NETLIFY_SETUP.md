# 🚀 Configuração do Netlify para Webhooks Shopify

## 📋 Variáveis de Ambiente Necessárias

Vá para **Netlify Dashboard → Site Settings → Environment Variables** e adicione:

### 🔑 Supabase
```
SUPABASE_URL = https://dnamxsapwgltxmtokecd.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [SUA_SERVICE_ROLE_KEY_AQUI]
```

### 🛒 Shopify (Opcional)
```
SHOPIFY_WEBHOOK_SECRET = [SEU_WEBHOOK_SECRET_AQUI]
```

## ⚠️ IMPORTANTE: Use a Service Role Key

**NÃO** use a `anon key` para webhooks! Use a `service_role_key`:

1. Vá para **Supabase Dashboard → Settings → API**
2. Copie a **`service_role`** key (não a `anon public`)
3. Use essa key em `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 Configurações do netlify.toml

O arquivo `netlify.toml` foi atualizado com:

```toml
[build]
  functions = "netlify/functions"

# Permitir funções Netlify (não redirecionar)
[[redirects]]
  from = "/.netlify/functions/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## 🚀 Deploy

Após fazer as alterações, faça o deploy:

```bash
git add .
git commit -m "Configurar webhook Shopify"
git push
```

## 🧪 Teste após deploy

1. **Aguarde o deploy terminar** (2-3 minutos)
2. **Teste a função**: https://sheet-tools.com/.netlify/functions/shopify-webhook
   - Deve retornar erro 405 (método não permitido) - isso é correto!
3. **Configure o webhook no Shopify**:
   - URL: `https://sheet-tools.com/.netlify/functions/shopify-webhook`
   - Evento: "Order created"
   - Formato: JSON

## 🎯 URL Final do Webhook

```
https://sheet-tools.com/.netlify/functions/shopify-webhook
```

Use esta URL exata no Shopify!
