# 🔥 CONFIGURAÇÃO CRÍTICA - Facebook para Produção

## ⚠️ **AÇÃO OBRIGATÓRIA ANTES DO DEPLOY**

Sua plataforma será: **`https://sheet-tools.netlify.app`**

### **🔧 Passo a passo obrigatório:**

#### **1. Acessar Facebook Developer Console:**
```
https://developers.facebook.com/apps/1525902928789947
```

#### **2. Ir para Facebook Login:**
- Menu lateral: **"Facebook Login"**
- Submenu: **"Configurações"**

#### **3. Configurar Valid OAuth Redirect URIs:**
Na seção **"Valid OAuth Redirect URIs"**, você deve ter:

```
http://localhost:3000/meta-callback
https://sheet-tools.netlify.app/meta-callback
```

**📝 Explicação:**
- `localhost` = Para desenvolvimento local
- `sheet-tools.netlify.app` = Para produção

#### **4. Outras configurações importantes:**
- ✅ **Client OAuth Login:** Ativado
- ✅ **Web OAuth Login:** Ativado  
- ❌ **Force Web OAuth Reauthentication:** Desativado

#### **5. Salvar alterações:**
- Clique **"Salvar alterações"**
- Aguarde confirmação

---

## 🚨 **O QUE ACONTECE SE NÃO CONFIGURAR:**

### **Erro que aparecerá:**
```
URL bloqueado
Este redirecionamento falhou porque o URL de redirecionamento 
não está na lista branca das Definições OAuth do Cliente da app.
```

### **Sintomas:**
- ✅ Localhost funciona
- ❌ Produção não funciona
- ❌ Popup fecha imediatamente
- ❌ Erro de "Invalid redirect URI"

---

## ✅ **CHECKLIST FINAL:**

Antes de fazer o deploy, verifique:

- [ ] **Facebook App ID:** `1525902928789947` ✅
- [ ] **Localhost URI:** `http://localhost:3000/meta-callback` ✅
- [ ] **Produção URI:** `https://sheet-tools.netlify.app/meta-callback` ⚠️
- [ ] **Configurações salvas** no Facebook ⚠️
- [ ] **Build funcionando:** `npm run build` ✅
- [ ] **Arquivos Netlify criados:** `netlify.toml`, `_redirects` ✅

---

## 🎯 **TESTE FINAL:**

### **Após configurar Facebook:**
1. **Deploy** no Netlify
2. **Acesse:** https://sheet-tools.netlify.app
3. **Clique:** "Conectar Meta"
4. **Deve abrir:** Popup do Facebook
5. **Faça login:** Com sua conta
6. **Deve funcionar:** Login e importação

---

## 🔧 **Se der erro mesmo assim:**

### **Verificações:**
1. **URL exata:** `https://sheet-tools.netlify.app/meta-callback`
2. **Sem barra extra** no final
3. **HTTPS obrigatório** em produção
4. **Aguardar 5-10 minutos** após salvar no Facebook

### **Logs para verificar:**
- **Console do navegador:** F12 → Console
- **Netlify Functions:** Se implementar backend
- **Facebook App Dashboard:** Logs de erro

---

**🔥 CRÍTICO: Esta configuração é OBRIGATÓRIA para funcionar em produção!**

**Sem ela, apenas localhost funcionará!**