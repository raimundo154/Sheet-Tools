# 🚀 Deploy no Netlify - Guia Completo

## ✅ **Arquivos criados automaticamente:**

### **1. `netlify.toml` (configuração principal)**
- ✅ Build command: `npm run build`
- ✅ Publish directory: `build`
- ✅ Variáveis de ambiente configuradas
- ✅ Redirects para React Router
- ✅ Headers de segurança
- ✅ Cache otimizado

### **2. `public/_redirects` (backup para SPA)**
- ✅ Redireciona todas as rotas para `index.html`
- ✅ Suporte para `meta-callback.html`

### **3. `env.production` (variáveis de produção)**
- ✅ Facebook App ID configurado
- ✅ Otimizações de build

---

## 🔧 **Configurações no Netlify Dashboard:**

### **Configurações de Build:**
```
Base directory: (deixar vazio ou "sheet-tools")
Build command: npm run build
Publish directory: build
Functions directory: netlify/functions
```

### **Configurações Automáticas:**
- ✅ **Runtime:** Node.js 18 (automático)
- ✅ **Build command:** Já configurado no netlify.toml
- ✅ **Publish directory:** Já configurado
- ✅ **Redirects:** Já configurados

---

## 🌍 **Configurações de Domínio:**

### **1. Seu domínio Netlify:**
```
https://sheet-tools.netlify.app
```

### **2. ⚠️ IMPORTANTE - Configurar no Facebook Developer Console:**
1. Vá para sua Facebook App: https://developers.facebook.com/apps/1525902928789947
2. **Facebook Login > Configurações**
3. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   https://sheet-tools.netlify.app/meta-callback
   ```
4. **Salvar alterações**

**🔥 CRÍTICO: Sem esta configuração, o login Facebook NÃO funcionará em produção!**

---

## 🔐 **Variáveis de Ambiente (se necessário):**

Se as variáveis do `netlify.toml` não funcionarem, adicione manualmente:

### **No Netlify Dashboard:**
1. **Site settings > Environment variables**
2. Adicionar:
   ```
   REACT_APP_FACEBOOK_APP_ID = 1525902928789947
   REACT_APP_ENV = production
   ```

---

## 🚀 **Processo de Deploy:**

### **1. Via GitHub (recomendado):**
1. **Commit** e **push** para GitHub
2. **Conectar** repositório no Netlify
3. **Deploy automático** a cada push

### **2. Via Netlify CLI:**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### **3. Via Drag & Drop:**
1. **Build local:** `npm run build`
2. **Arrastar** pasta `build` para Netlify

---

## ✅ **Checklist pós-deploy:**

### **1. Testar funcionamento:**
- [ ] Site carrega corretamente
- [ ] Botão "Conectar Meta" funciona
- [ ] Popup do Facebook abre
- [ ] Login funciona
- [ ] Ad accounts são listadas
- [ ] Campanhas são importadas

### **2. Configurações Facebook:**
- [ ] Redirect URI atualizado
- [ ] Permissões configuradas
- [ ] App em modo público (se necessário)

### **3. Otimizações:**
- [ ] Domínio personalizado (opcional)
- [ ] HTTPS funcionando (automático)
- [ ] Cache configurado (automático)

---

## 🔧 **Troubleshooting:**

### **Erro "Invalid redirect URI":**
- Verificar se adicionou a URL correta no Facebook
- URL deve ser exata: `https://sheet-tools.netlify.app/meta-callback`

### **Erro 404 em rotas:**
- Verificar se `_redirects` existe em `public/`
- Verificar configuração no `netlify.toml`

### **Erro de build:**
- Verificar se `npm run build` funciona localmente
- Verificar logs de build no Netlify

---

## 🎉 **Resultado Final:**

✅ **Plataforma SaaS online**
✅ **Qualquer pessoa pode acessar**
✅ **Login Facebook funcionando**
✅ **Dados isolados por usuário**
✅ **Deploy automático**
✅ **HTTPS seguro**
✅ **Performance otimizada**

---

**🌍 Sua plataforma estará disponível para o mundo inteiro!**

**URL final:** `https://sheet-tools.netlify.app`