# 🛍️ Guia de Integração Shopify - Sheet Tools

## 📋 Visão Geral

Esta integração permite que sua loja Shopify envie automaticamente os pedidos para o sistema de quotations do Sheet Tools. Quando um cliente faz um pedido na sua loja, ele aparecerá automaticamente na sua plataforma.

## 🚀 Como Configurar

### 1. Executar Scripts SQL no Supabase

Primeiro, execute o script SQL no dashboard do Supabase:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Execute o arquivo `shopify-integration-tables.sql`

### 2. Configurar App na Shopify

1. **Acesse o painel da Shopify**
   - Faça login na sua loja Shopify
   - Vá para **Configurações → Apps e canais de vendas**

2. **Criar App Privado**
   - Clique em **Desenvolver apps**
   - Clique em **Criar um app**
   - Dê um nome: "Sheet Tools Integration"

3. **Configurar Permissões**
   - Vá para **Configuration**
   - Em **Admin API access scopes**, ative:
     - `read_orders` - Para ler pedidos
     - `read_products` - Para ler produtos
     - `write_orders` - Para modificar pedidos (opcional)

4. **Instalar e Obter Token**
   - Clique em **Install app**
   - Confirme a instalação
   - Vá para **API credentials**
   - Copie o **Admin API access token**

### 3. Configurar na Plataforma

1. **Acesse a página Quotations**
2. **Clique em "Conectar Shopify"**
3. **Siga o passo a passo no modal**
4. **Insira suas credenciais:**
   - Nome da loja (sem .myshopify.com)
   - Access Token copiado da Shopify

### 4. Configurar Webhook (Automático)

O sistema tentará criar o webhook automaticamente, mas se necessário, você pode criar manualmente:

```bash
curl -X POST "https://SUA-LOJA.myshopify.com/admin/api/2025-01/webhooks.json" \
-H "X-Shopify-Access-Token: SEU-TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "webhook": {
    "topic": "orders/create",
    "address": "https://sheet-tools.com/.netlify/functions/shopify-webhook",
    "format": "json"
  }
}'
```

## 🔧 Estrutura Técnica

### Tabelas Criadas

1. **`shopify_configs`** - Configurações da integração
2. **`quotations`** - Pedidos/quotations recebidos
3. **`webhook_logs`** - Log de webhooks processados
4. **`products`** - Produtos (campos Shopify adicionados)

### Fluxo de Dados

```
Shopify → Webhook → Netlify Function → Supabase → Quotations Page
```

1. Cliente faz pedido na Shopify
2. Shopify envia webhook para nossa função
3. Função processa o pedido e salva no banco
4. Produtos e quotation aparecem na plataforma

### Campos Processados

**Do Pedido Shopify:**
- ID do pedido
- Email do cliente
- Nome do cliente
- Valor total
- Moeda
- Data do pedido
- Items do pedido

**Produtos Criados:**
- Nome do produto
- Preço
- SKU
- IDs Shopify (produto e variante)
- Status de estoque

## 🔐 Segurança

### Verificação HMAC

O webhook verifica a assinatura HMAC para garantir que vem da Shopify:

```javascript
// Configurar no Netlify
SHOPIFY_WEBHOOK_SECRET=seu-webhook-secret
```

### Row Level Security (RLS)

Todas as tabelas têm RLS ativo - usuários só veem seus próprios dados.

### Tokens Seguros

- Access tokens são armazenados no Supabase
- Em produção, devem ser criptografados
- Nunca expostos no frontend

## 📊 Monitoramento

### Logs de Webhook

Todos os webhooks são registrados na tabela `webhook_logs`:

```sql
SELECT * FROM webhook_logs 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### Status dos Pedidos

Quotations têm status automático:
- `received` - Pedido recebido da Shopify
- `processed` - Processado com sucesso
- `error` - Erro no processamento

## 🛠️ Troubleshooting

### Webhook não está funcionando

1. **Verificar URL do webhook:**
   ```
   https://sheet-tools.com/.netlify/functions/shopify-webhook
   ```

2. **Verificar logs no Netlify:**
   - Acesse o dashboard do Netlify
   - Vá para Functions
   - Verifique logs da `shopify-webhook`

3. **Testar webhook manualmente:**
   ```bash
   curl -X POST "https://sheet-tools.com/.netlify/functions/shopify-webhook" \
   -H "Content-Type: application/json" \
   -H "X-Shopify-Topic: orders/create" \
   -H "X-Shopify-Shop-Domain: sua-loja.myshopify.com" \
   -d '{"test": true}'
   ```

### Credenciais inválidas

- Verificar nome da loja (sem .myshopify.com)
- Verificar access token (deve começar com `shpat_`)
- Verificar permissões do app na Shopify

### Produtos não aparecem

- Verificar se o webhook foi criado
- Verificar logs na tabela `webhook_logs`
- Verificar se a loja está corretamente configurada

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs no Supabase
2. Verificar logs no Netlify
3. Verificar configurações na Shopify
4. Verificar webhooks ativos na Shopify

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas

- [ ] Sincronização bidirecional de produtos
- [ ] Atualização de status de pedidos
- [ ] Sincronização de inventário
- [ ] Relatórios de vendas
- [ ] Notificações em tempo real

### Webhooks Adicionais

- `orders/updated` - Pedidos atualizados
- `orders/cancelled` - Pedidos cancelados
- `products/create` - Produtos criados
- `products/update` - Produtos atualizados

---

✅ **Integração Completa!** Sua loja Shopify agora está conectada ao Sheet Tools.
