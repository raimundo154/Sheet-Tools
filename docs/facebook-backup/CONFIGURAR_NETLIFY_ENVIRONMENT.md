# 🔐 CONFIGURAR ENVIRONMENT VARIABLES NO NETLIFY

## 📍 **LINK DIRETO:**
👉 https://app.netlify.com/sites/sheet-tools/settings/env

---

## 🚀 **PASSO A PASSO:**

### **1. Aceder ao Painel:**
- Vai para: https://app.netlify.com
- Seleciona o site: **sheet-tools**
- Menu: **Site settings** → **Environment variables**

### **2. Adicionar Variáveis:**
Clica **"Add variable"** para cada uma:

#### **Variável 1:**
- **Key:** `REACT_APP_FACEBOOK_APP_ID`
- **Value:** `1525902928789947`

#### **Variável 2:**
- **Key:** `FACEBOOK_APP_SECRET`
- **Value:** `29dcb85842a8089cfd7878d850b19267`

#### **Variável 3:**
- **Key:** `REACT_APP_ENV`
- **Value:** `production`

### **3. Salvar:**
- Clica **"Save"** em cada variável
- **NÃO** é necessário redeploy (Netlify faz automaticamente)

---

## ⚠️ **SEGURANÇA:**

### **PÚBLICO (Frontend):**
- ✅ `REACT_APP_FACEBOOK_APP_ID` - Pode ser visto por todos

### **PRIVADO (Servidor):**
- 🔒 `FACEBOOK_APP_SECRET` - NUNCA partilhar, só no servidor
- 🔒 Só a Netlify Function tem acesso

---

## ✅ **VERIFICAÇÃO:**

Depois de configurar:

1. **Vai para:** https://sheet-tools.netlify.app
2. **Abre DevTools:** F12 → Console
3. **Clica:** "Conectar Meta"
4. **Deve funcionar:** Sem erros de "App Secret não encontrado"

---

## 🆘 **SE DER ERRO:**

### **"App Secret não encontrado":**
- ✅ Verifica se salvaste no Netlify
- ⏰ Aguarda 2-3 minutos para propagação
- 🔄 Faz hard refresh (Ctrl+F5)

### **"Invalid redirect URI":**
- ✅ Configura URIs no Facebook primeiro
- 👉 https://developers.facebook.com/apps/1525902928789947

---

**🎉 Depois disto, a tua app Facebook vai funcionar 100%!**