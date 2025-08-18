# 🔧 **Corrigir Domínio do Google OAuth**

## ❌ **Problema Atual:**
O Google OAuth está a mostrar o domínio antigo do Supabase (`dnamxsapwgltxmtokecd.supabase.co`) em vez do teu domínio personalizado (`sheet-tools.com`).

---

## ✅ **Solução - Configurar no Supabase Dashboard:**

### **1. Atualizar Site URL no Supabase:**
1. Acede ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Vai para **Settings** → **General** → **Configuration**
3. **Site URL:** `https://sheet-tools.com`
4. **Clica "Save"**

### **2. Configurar URLs de Redirecionamento:**
1. Na mesma página (**General** → **Configuration**)
2. **Additional redirect URLs:**
   ```
   https://sheet-tools.com/auth/callback
   https://sheet-tools.com
   http://localhost:3000/auth/callback
   http://localhost:3000
   ```
3. **Clica "Save"**

### **3. Atualizar Google OAuth Provider:**
1. Vai para **Authentication** → **Providers**
2. Clica em **Google**
3. **Redirect URL (para copiar):** Copia o URL mostrado
4. **Este URL deve ser:** `https://dnamxsapwgltxmtokecd.supabase.co/auth/v1/callback`

---

## 🔧 **Configurar no Google Cloud Console:**

### **1. Aceder ao Google Cloud Console:**
1. Vai para [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Clica no teu **OAuth 2.0 Client ID**

### **2. Atualizar Authorized Origins:**
```
Authorized JavaScript origins:
- https://sheet-tools.com
- https://dnamxsapwgltxmtokecd.supabase.co
- http://localhost:3000 (para desenvolvimento)
```

### **3. Atualizar Authorized Redirect URIs:**
```
Authorized redirect URIs:
- https://dnamxsapwgltxmtokecd.supabase.co/auth/v1/callback
- https://sheet-tools.com/auth/callback
- http://localhost:3000/auth/callback (para desenvolvimento)
```

### **4. Clica "Save"**

---

## 🔄 **Configurar DNS e Domínio Personalizado:**

### **Opção 1: Usar Domínio Personalizado do Supabase (Recomendado)**
1. **Supabase Dashboard** → **Settings** → **General** → **Custom Domains**
2. **Adicionar domínio:** `auth.sheet-tools.com`
3. **Seguir instruções** para configurar DNS
4. **Depois atualizar redirect URLs** para usar `auth.sheet-tools.com`

### **Opção 2: Manter Domínio Supabase (Mais Simples)**
1. **Manter** `dnamxsapwgltxmtokecd.supabase.co` para auth
2. **Atualizar apenas** as configured origins no Google

---

## 📝 **Atualizar Código (se necessário):**

### **Verificar ficheiro `src/config/supabase.js`:**
```javascript
export const getRedirectUrl = () => {
  // Em produção, usar o domínio real
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheet-tools.com/auth/callback'  // ✅ Correto
  }
  // Em desenvolvimento, usar localhost
  return 'http://localhost:3000/auth/callback'
}
```

### **Se usares domínio personalizado do Supabase:**
```javascript
export const getRedirectUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://auth.sheet-tools.com/auth/v1/callback'
  }
  return 'http://localhost:3000/auth/callback'
}
```

---

## 🧪 **Testar a Configuração:**

### **1. Limpar Cache:**
```bash
# Limpar cache do browser
# Ou usar incógnito/privado
```

### **2. Testar Login:**
1. **Ir para** `https://sheet-tools.com`
2. **Clicar "Login com Google"**
3. **Verificar** se aparece "sheet-tools.com" na página do Google
4. **Confirmar redirecionamento** correto após login

---

## 🔍 **Diagnóstico de Problemas:**

### **Se ainda aparece domínio antigo:**
1. **Verificar** se Site URL está correto no Supabase
2. **Limpar cookies** e cache do browser
3. **Testar em modo incógnito**
4. **Aguardar propagação** (pode demorar alguns minutos)

### **Se houver erro de redirect:**
1. **Verificar** se URLs estão corretos no Google Cloud
2. **Confirmar** que redirect URI no Supabase está configurado
3. **Testar** com `http://localhost:3000` primeiro

---

## ⚡ **Solução Rápida (Recomendada):**

1. **Supabase:** Site URL = `https://sheet-tools.com`
2. **Google Cloud:** Adicionar `https://sheet-tools.com` aos origins
3. **Manter** redirect URI do Supabase como está
4. **Testar** em modo incógnito

Isso deve resolver o problema de aparecer o domínio antigo! 🎉
