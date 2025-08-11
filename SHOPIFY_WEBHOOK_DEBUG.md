# 🐛 Debug do Webhook Shopify - Lista de Verificação

Quando você cria uma venda na loja e não aparece nada na base de dados, pode ser um destes problemas:

## 📋 Checklist de Verificação

### ✅ 1. Verificar se a Tabela Vendas Existe no Supabase
```sql
-- Execute no SQL Editor do Supabase:
SELECT COUNT(*) as registros FROM vendas;
```

### ✅ 2. Verificar Variáveis de Ambiente no Netlify
Vá para **Netlify Dashboard → Site Settings → Environment Variables** e confirme:

- `SUPABASE_URL` = `https://dnamxsapwgltxmtokecd.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = sua service role key (não a anon key!)
- `SHOPIFY_WEBHOOK_SECRET` = secret do webhook (opcional)

### ✅ 3. Verificar se a Função Netlify Está Online
Acesse: `https://sheet-tools.com/.netlify/functions/shopify-webhook`

Você deve ver erro 405 (método não permitido) - isso é normal porque é um GET, mas confirma que a função existe.

### ✅ 4. Verificar Webhook no Shopify
No **Shopify Admin → Settings → Notifications → Webhooks**:

- **Event**: Order created
- **URL**: `https://sheet-tools.com/.netlify/functions/shopify-webhook`
- **Format**: JSON

### ✅ 5. Testar o Webhook Manualmente

#### Opção A: Teste via cURL
```bash
curl -X POST https://sheet-tools.com/.netlify/functions/shopify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "order_number": 1001,
    "name": "#1001",
    "financial_status": "paid",
    "fulfillment_status": "fulfilled",
    "currency": "EUR",
    "shop_domain": "sua-loja.myshopify.com",
    "customer": {
      "email": "teste@example.com",
      "first_name": "João",
      "last_name": "Silva"
    },
    "line_items": [
      {
        "title": "Produto Teste",
        "price": "29.99",
        "quantity": 1
      }
    ]
  }'
```

#### Opção B: Teste via SQL direto no Supabase
```sql
-- Execute no SQL Editor do Supabase para inserir teste:
INSERT INTO vendas (
  order_id, produto, preco, quantidade, 
  customer_email, customer_name, order_number,
  financial_status, currency
) VALUES (
  999999, 'Produto Teste Manual', 19.99, 1,
  'teste@example.com', 'Cliente Teste', '#TEST001',
  'paid', 'EUR'
);

-- Depois verificar:
SELECT * FROM vendas ORDER BY created_at DESC LIMIT 5;
```

### ✅ 6. Verificar Logs no Netlify
1. Vá para **Netlify Dashboard → Functions**
2. Clique em `shopify-webhook`
3. Veja os logs para erros

### ✅ 7. Verificar Logs no Shopify
1. Vá para **Shopify Admin → Settings → Notifications**
2. Clique no webhook configurado
3. Veja se há tentativas de envio e erros

## 🚨 Problemas Comuns

### Problema 1: "SUPABASE_URL is not defined"
**Solução**: Configurar variáveis de ambiente no Netlify

### Problema 2: "Permission denied for relation vendas"
**Solução**: Usar SUPABASE_SERVICE_ROLE_KEY (não anon key)

### Problema 3: "Function not found"
**Solução**: Fazer deploy da função - `npm run build`

### Problema 4: "Webhook delivery failed"
**Solução**: URL do webhook incorreta ou função com erro

### Problema 5: "Column does not exist"
**Solução**: Executar o SQL de criação da tabela

## 🔧 Comandos de Debug

### Testar localmente (se usando Netlify CLI):
```bash
netlify functions:serve
```

### Ver logs em tempo real:
```bash
netlify logs:function shopify-webhook
```

### Fazer deploy da função:
```bash
npm run build
```

## 📞 Próximos Passos

1. **Execute o checklist acima em ordem**
2. **Teste com o SQL manual primeiro**
3. **Depois teste com cURL**
4. **Por último, teste com uma venda real**

Me diga qual passo falhou para eu ajudar especificamente! 🎯
