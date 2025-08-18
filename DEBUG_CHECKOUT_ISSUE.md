# 🔍 **DEBUG - Erro 500 no Checkout**

## ❌ **Problema Identificado:**
- **Erro 500** na função `create-checkout-session`
- **User tem Free Trial ativo** mas não consegue fazer upgrade
- **"Gerir Plano"** não funciona para trials

## 🔧 **Verificações Necessárias no Netlify:**

### **1. Verificar Logs da Função:**
1. **Netlify Dashboard** → teu-site → **Functions**
2. **create-checkout-session** → **View function logs**
3. **Procurar erro específico** nos logs

### **2. Verificar Environment Variables:**
```
STRIPE_SECRET_KEY = sk_live_51RvfyuEEfx7nXgXb... (chave live do Stripe)
REACT_APP_SUPABASE_URL = https://dnamxsapwgltxmtokecd.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [chave do service role]
```

### **3. Possíveis Causas do Erro 500:**
- ❌ **STRIPE_SECRET_KEY** incorreta ou não configurada
- ❌ **SUPABASE_SERVICE_ROLE_KEY** em falta
- ❌ **Query SQL** com erro na verificação de subscription
- ❌ **Stripe API** a rejeitar request

---

## 🚀 **Soluções Implementadas:**

### **1. Portal Melhorado para Trials:**
- Trials agora redirecionam para página de upgrade
- Botão "Gerir Plano" mostra opções de upgrade

### **2. Checkout Corrigido:**
- Permite upgrade de trial para plano pago
- Webhook cancela trial automaticamente

### **3. Logs Melhorados:**
- Debugging completo em todas as funções
- Identificação clara de erros

---

## ⚡ **AÇÕES IMEDIATAS:**

### **No Netlify Dashboard:**
1. **Functions** → **create-checkout-session** → **View logs**
2. **Site settings** → **Environment variables**
3. **Verificar** se todas as chaves estão corretas

### **No Stripe Dashboard:**
1. **Developers** → **API keys**
2. **Confirmar** que a chave live está ativa
3. **Products** → Confirmar que `price_1RxSxHEEfx7nXgXb7s4vVEVK` existe

---

## 🔍 **Para Debug Imediato:**

### **Testa este URL diretamente:**
```
https://sheet-tools.com/.netlify/functions/create-checkout-session
```

### **Se der 404:**
- Função não foi deployada
- Problema no build do Netlify

### **Se der 500:**
- Verifica logs no Netlify
- Problema nas environment variables

### **Se der 405:**
- Função existe mas só aceita POST
- Testa com Postman/curl
