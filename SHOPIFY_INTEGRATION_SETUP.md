# 🛒 Configuração Integração Shopify + Supabase + Netlify

Este guia explica como configurar o sistema completo de vendas em tempo real para o Sheet-Tools.

## 📋 Arquivos Criados

### 1. **SQL - Banco de Dados**
- `sql/create_vendas_table.sql` - Script para criar tabela no Supabase

### 2. **Backend - Netlify Functions**
- `netlify/functions/shopify-webhook.js` - Webhook para receber dados do Shopify

### 3. **Frontend - React Components**
- `src/services/salesService.js` - Serviço para consultar vendas
- `src/components/SalesPage.js` - Página de vendas em tempo real
- `src/components/SalesPage.css` - Estilos da página de vendas

### 4. **Navegação**
- Página adicionada ao sistema de rotas e sidebar

---

## 🔧 Configuração Passo a Passo

### **1️⃣ Configurar Banco de Dados Supabase**

1. Acesse o painel do Supabase: https://app.supabase.com
2. Vá para **SQL Editor**
3. Execute o script `sql/create_vendas_table.sql`
4. Verifique se a tabela `vendas` foi criada corretamente

### **2️⃣ Configurar Variáveis de Ambiente Netlify**

No painel do Netlify, adicione estas variáveis em **Site Settings → Environment Variables**:

```bash
# Supabase (obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Chave Service Role (não a pública!)

# Shopify (opcional - para validação webhook)
SHOPIFY_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

⚠️ **IMPORTANTE**: Use a **Service Role Key** do Supabase, não a chave pública!

### **3️⃣ Configurar Webhook no Shopify**

1. Acesse o painel da Shopify
2. Vá para **Configurações → Notificações → Webhooks**
3. Clique em **Criar webhook**
4. Configure:
   - **Evento**: `Order creation`
   - **Formato**: `JSON`
   - **URL**: `https://seu-site.netlify.app/.netlify/functions/shopify-webhook`
   - **Versão da API**: `2023-10` (ou mais recente)

### **4️⃣ Configurar Supabase Realtime**

1. No painel do Supabase, vá para **Database → Replication**
2. Ative a publicação para a tabela `vendas`:
   ```sql
   alter publication supabase_realtime add table vendas;
   ```

### **5️⃣ Testar Integração**

#### Teste do Webhook:
```bash
# Comando cURL para testar localmente
curl -X POST https://seu-site.netlify.app/.netlify/functions/shopify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "order_number": 1001,
    "financial_status": "paid",
    "customer": {
      "email": "teste@example.com",
      "first_name": "João",
      "last_name": "Silva"
    },
    "line_items": [{
      "title": "Produto Teste",
      "price": "29.99",
      "quantity": 2
    }]
  }'
```

#### Verificar no Supabase:
```sql
-- Ver vendas na tabela
SELECT * FROM vendas ORDER BY created_at DESC;
```

---

## 🚀 Como Funciona

### **Fluxo Completo:**
1. **Cliente faz compra** no Shopify
2. **Shopify envia webhook** para `/.netlify/functions/shopify-webhook`
3. **Função processa dados** e salva no Supabase
4. **Supabase Realtime** notifica a aplicação
5. **Interface atualiza automaticamente** sem refresh

### **Recursos Implementados:**
- ✅ Vendas em tempo real
- ✅ Estatísticas automáticas
- ✅ Filtros por período/status
- ✅ Notificações de novas vendas
- ✅ Interface responsiva
- ✅ Tratamento de erros
- ✅ Prevenção de duplicatas

---

## 📊 Funcionalidades da Página

### **Estatísticas em Tempo Real:**
- 💰 Faturamento total
- 📈 Número de vendas
- 📦 Itens vendidos
- ⚡ Vendas por hora

### **Filtros Disponíveis:**
- 🔍 Todas as vendas
- 📅 Vendas de hoje
- ✅ Vendas pagas
- ⏳ Vendas pendentes

### **Funcionalidades Especiais:**
- 🔔 Notificações browser para novas vendas
- 🔄 Atualização automática via Realtime
- 📱 Interface responsiva
- 🎨 Design consistente com a plataforma

---

## 🛠️ Manutenção e Logs

### **Logs Netlify Functions:**
```bash
# Ver logs da função
netlify logs:function shopify-webhook
```

### **Logs Supabase:**
- Acesse **Logs** no painel do Supabase
- Filtre por `postgres_changes` para ver eventos realtime

### **Monitoramento:**
- Verifique regularmente os logs do webhook
- Monitor o status de autenticação do Supabase
- Teste periodicamente a conexão realtime

---

## 🔒 Segurança

### **Validação Webhook:**
O webhook valida a assinatura do Shopify usando `SHOPIFY_WEBHOOK_SECRET`.

### **Políticas RLS:**
A tabela `vendas` usa Row Level Security para controlar acesso.

### **Service Role:**
Use a Service Role Key apenas no backend (Netlify Functions).

---

## 📞 Troubleshooting

### **Webhook não recebe dados:**
1. Verifique a URL do webhook no Shopify
2. Confirme variáveis de ambiente no Netlify
3. Veja logs da função no Netlify

### **Realtime não funciona:**
1. Verifique se a publicação está ativa
2. Confirme permissões RLS da tabela
3. Teste conexão Supabase

### **Vendas duplicadas:**
O sistema previne duplicatas usando `order_id` único.

---

## 🎯 Próximos Passos

Possíveis melhorias futuras:
- 📧 Notificações por email
- 📊 Gráficos de vendas
- 🔄 Sincronização bidirecional
- 📈 Analytics avançados
- 🎨 Customização de dashboards

---

**🎉 Sistema completo implementado e pronto para uso!**

