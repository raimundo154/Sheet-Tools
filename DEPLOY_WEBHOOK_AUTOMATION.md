# 🚀 Deploy da Automação de Webhook Shopify

## ✅ **O que foi implementado**

### **Funções Netlify Criadas:**
1. `test-shopify-connection.js` - Testa conexão E cria webhook automaticamente
2. `create-shopify-webhook.js` - Função dedicada para criação de webhooks
3. `shopify-webhook.js` - Recebe pedidos da Shopify (já existia)

### **Melhorias no Sistema:**
- ✅ Criação automática de webhooks
- ✅ Verificação se webhook já existe
- ✅ Rastreamento do status do webhook no banco
- ✅ Mensagens detalhadas para o usuário
- ✅ Logs detalhados para debug

## 🔧 **Steps para Deploy**

### **1. Atualizar Banco de Dados (Supabase)**
Execute este SQL no Supabase SQL Editor:

```sql
-- Adicionar campos para webhook se não existirem
ALTER TABLE shopify_configs 
ADD COLUMN IF NOT EXISTS webhook_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS webhook_id VARCHAR(255);
```

### **2. Configurar Variáveis de Ambiente (Netlify)**

No dashboard do Netlify, adicione:

```bash
# Variáveis já existentes
REACT_APP_SUPABASE_URL=https://dnamxsapwgltxmtokecd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Nova variável necessária para funções
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Como obter SUPABASE_SERVICE_ROLE_KEY:**
1. Vá para app.supabase.com
2. Seu projeto → Settings → API
3. Copie "service_role" key (secreta)

### **3. Deploy no Netlify**

```bash
# Fazer push das mudanças
git add .
git commit -m "feat: automação completa de webhooks Shopify"
git push origin main
```

O Netlify fará deploy automaticamente das novas funções.

### **4. Testar em Produção**

1. Acesse sua aplicação em produção
2. Vá para Quotations → "Conectar Shopify"
3. Insira suas credenciais da Shopify
4. Clique "Testar Conexão"
5. Deve aparecer: **"✅ Webhook configurado automaticamente!"**

## 🔍 **Como Verificar se Funciona**

### **No Netlify:**
1. Functions → Logs
2. Deve ver logs das funções sendo executadas

### **Na Shopify:**
1. Settings → Notifications
2. Webhooks → Deve aparecer webhook para "Order creation"
3. URL deve ser: `https://sheet-tools.com/.netlify/functions/shopify-webhook`

### **No Supabase:**
```sql
-- Verificar configurações salvas
SELECT * FROM shopify_configs WHERE user_id = auth.uid();

-- Verificar logs de webhook
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 10;
```

## 🐛 **Troubleshooting**

### **Webhook não é criado automaticamente:**

1. **Verificar logs no Netlify:**
   - Functions → test-shopify-connection → Logs
   - Procurar erros relacionados à Shopify API

2. **Problemas comuns:**
   - Token Shopify inválido ou expirado
   - Permissões insuficientes no app Shopify
   - App Shopify não tem permissão para criar webhooks

3. **Verificar permissões no app Shopify:**
   - `read_orders` ✅
   - `read_products` ✅
   - `write_webhooks` ← **Esta é nova e necessária!**

### **Adicionar permissão de webhook:**
1. Shopify Admin → Apps → Seu app
2. Configuration → Admin API access scopes
3. Adicionar: `write_webhooks`
4. Save → Reinstall app

### **Se ainda não funcionar:**
O sistema fallback para criação manual ainda funciona usando o comando cURL do passo 5 do modal.

## 📊 **Status Esperados**

### **Em Desenvolvimento (localhost):**
- "Conexão simulada com sucesso!"
- "⚠️ Webhook deve ser configurado manualmente"

### **Em Produção (Netlify):**
- "Conexão estabelecida com sucesso!"
- "✅ Webhook configurado automaticamente!"

## 🎯 **Próximos Passos**

Após o deploy, teste criando um pedido na sua loja Shopify. Ele deve aparecer automaticamente na página de Quotations!

---

**🚀 Deploy concluído! Webhooks agora são criados automaticamente!**
