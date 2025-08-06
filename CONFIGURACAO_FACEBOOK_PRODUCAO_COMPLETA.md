# 🚀 CONFIGURAÇÃO COMPLETA - Facebook para Produção

## ✅ **SITUAÇÃO ATUAL**
- 🌐 **Site:** https://sheet-tools.netlify.app/
- 📱 **App ID:** 1525902928789947
- 🔧 **Netlify Function:** Criada para segurança do App Secret

---

## 🔥 **PASSO A PASSO OBRIGATÓRIO**

### **1. 🔗 CONFIGURAR URIs DE REDIRECIONAMENTO**

👉 **Acessa:** https://developers.facebook.com/apps/1525902928789947

**Passos:**
1. **Menu lateral:** "Facebook Login" → "Configurações"
2. **Na seção "Valid OAuth Redirect URIs"** adiciona:
   ```
   http://localhost:3000/meta-callback
   https://sheet-tools.netlify.app/meta-callback
   ```
3. **Outras configurações:**
   - ✅ **Client OAuth Login:** Ativado
   - ✅ **Web OAuth Login:** Ativado  
   - ❌ **Force Web OAuth Reauthentication:** Desativado
4. **Clica "Salvar alterações"**

### **2. 🔐 CONFIGURAR APP SECRET NO NETLIFY**

👉 **Acessa:** https://app.netlify.com/sites/sheet-tools/settings/env

**Variáveis necessárias:**
```bash
REACT_APP_FACEBOOK_APP_ID = 1525902928789947
FACEBOOK_APP_SECRET = [teu_app_secret_aqui]
```

**Para encontrar o App Secret:**
1. Facebook Developer Console → "Configurações" → "Básico"
2. **App Secret** → "Mostrar" → Copia o valor
3. **NUNCA** partilhes este valor publicamente!

### **3. 📱 SAIR DO MODO DEVELOPER**

**Problema atual:**
```
App not active
This app is not accessible right now and the app developer is aware of the issue.
```

**Solução - Opção A: Business Verification (Rápida)**
1. **Menu:** "App Review" → "Business Verification"
2. **Submete:** Informações da empresa
3. **Aguarda:** Aprovação (1-3 dias)

**Solução - Opção B: App Review (Mais demorada)**
1. **Menu:** "App Review" → "Permissions and Features"
2. **Solicita permissões:**
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_manage_ads`
3. **Submete:** Para revisão do Facebook

### **4. 🏗️ FAZER DEPLOY COM NOVA CONFIGURAÇÃO**

```bash
# No terminal, dentro da pasta sheet-tools:
npm run build
git add .
git commit -m "Configuração Facebook produção"
git push origin main
```

---

## 🎯 **TESTE FINAL**

Após todas as configurações:

1. **Acessa:** https://sheet-tools.netlify.app
2. **Clica:** "Conectar Meta"
3. **Deve abrir:** Popup do Facebook (sem erro de app inativa)
4. **Faz login:** Com tua conta
5. **Deve funcionar:** Login e importação de dados

---

## 🚨 **SE AINDA DER ERRO**

### **Erro: "URL bloqueado"**
- ✅ Verifica URIs no Facebook
- ✅ URL exata: `https://sheet-tools.netlify.app/meta-callback`
- ✅ Sem barra extra no final

### **Erro: "App not active"**
- ⏳ Business Verification ainda pendente
- 🔄 Aguarda 24-48h após submissão
- 📞 Contacta suporte Facebook se demorar muito

### **Erro: "Invalid redirect URI"**
- 🔍 Verifica se salvaste no Facebook
- ⏰ Aguarda 5-10 minutos para propagação
- 🔄 Limpa cache do navegador

### **Erro: "Token exchange failed"**
- 🔑 Verifica App Secret no Netlify
- 🔄 Redeploy após adicionar variáveis
- 📋 Verifica logs da Netlify Function

---

## 📋 **CHECKLIST FINAL**

Antes de testar:

- [ ] **Facebook URIs:** Configurados e salvos ✅
- [ ] **Netlify Variables:** App ID e Secret configurados ⚠️
- [ ] **Business Verification:** Submetida ⚠️
- [ ] **Deploy:** Feito com nova configuração ⚠️
- [ ] **Cache:** Limpo no navegador ⚠️

---

## 🆘 **CONTACTOS DE EMERGÊNCIA**

- **Facebook Support:** https://developers.facebook.com/support/
- **Netlify Docs:** https://docs.netlify.com/functions/overview/
- **Este projeto:** Todos os ficheiros estão documentados

---

**🎉 Depois disto tudo configurado, a tua app vai funcionar como o TrackBee!**