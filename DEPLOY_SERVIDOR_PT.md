# 🚀 Deploy para Servidor PT - Guia Completo

## 🎯 **Por que é melhor que localhost:**
- ✅ **HTTPS obrigatório** - Facebook exige SSL
- ✅ **Domínio real** - Mais profissional e confiável
- ✅ **Acessível globalmente** - Qualquer pessoa pode usar
- ✅ **Sem limitações** de desenvolvimento
- ✅ **Performance melhor** - Servidor dedicado

---

## 🛒 **1. Comprar Domínio + Hosting**

### **Recomendações Portugal:**
- **OVH Portugal** - ovh.pt (bom preço, boa performance)
- **Hostinger Portugal** - hostinger.pt (barato, fácil)
- **SiteGround** - siteground.pt (premium, suporte excelente)
- **Cloudflare Pages** - cloudflare.com (gratuito, muito rápido)

### **Domínio sugerido:**
- `campaignmanager.pt`
- `adsdashboard.pt` 
- `metaanalytics.pt`
- `fbcampaigns.pt`

---

## 🔧 **2. Configurações Facebook App**

### **Atualizar Redirect URIs:**
No Facebook Developer Console, ir para **Facebook Login > Configurações**:

```
# Remover:
http://localhost:3000/meta-callback

# Adicionar:
https://seudominio.pt/meta-callback
```

### **Adicionar domínio da app:**
Em **Configurações > Básico**:
- **App Domains:** `seudominio.pt`
- **Website:** `https://seudominio.pt`

---

## 📦 **3. Preparar Build de Produção**

### **Build React:**
```bash
cd sheet-tools
npm run build
```

### **Arquivos gerados:**
- Pasta `build/` contém todos os arquivos
- Upload desta pasta para servidor

---

## 🌐 **4. Configuração Servidor**

### **Opção A - Hosting Tradicional (PHP/cPanel):**
1. **Upload build/** para `public_html/`
2. **Configurar .htaccess** para React Router:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### **Opção B - Node.js Hosting:**
1. **Upload projeto completo**
2. **Instalar dependências:** `npm install`
3. **Build:** `npm run build`
4. **Servir:** `npm start` ou PM2

### **Opção C - Cloudflare Pages (RECOMENDADO):**
1. **Conectar repositório GitHub**
2. **Build automático** a cada commit
3. **HTTPS gratuito**
4. **CDN global**
5. **Zero configuração**

---

## 🔐 **5. Configurar HTTPS**

### **SSL Certificate:**
- **Let's Encrypt** (gratuito) - via cPanel/Hosting
- **Cloudflare SSL** (gratuito) - automático
- **Hosting SSL** - geralmente incluído

### **Forçar HTTPS:**
```apache
# .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ⚙️ **6. Variáveis de Ambiente**

### **Criar .env.production:**
```bash
# Seu domínio
REACT_APP_API_URL=https://seudominio.pt

# Facebook App (mesmo ID)
REACT_APP_FACEBOOK_APP_ID=1525902928789947

# Ambiente
REACT_APP_ENV=production
```

---

## 🎯 **7. Teste Final**

### **Verificar:**
1. **HTTPS funcionando** ✅
2. **Meta callback funcionando** ✅
3. **Login Facebook funcionando** ✅
4. **Campanhas importando** ✅
5. **Multi-tenant funcionando** ✅

### **URLs para testar:**
- `https://seudominio.pt` - Página principal
- `https://seudominio.pt/meta-callback` - Callback Facebook

---

## 📊 **8. Melhorias Opcionais**

### **Analytics:**
- **Google Analytics** - Tráfego
- **Facebook Pixel** - Conversões
- **Hotjar** - Comportamento usuários

### **Performance:**
- **CDN** - Cloudflare (gratuito)
- **Compressão** - Gzip/Brotli
- **Cache** - Browser + Server

### **SEO:**
- **Meta tags** - Título, descrição
- **Open Graph** - Partilha social
- **Sitemap** - Para Google

---

## 🚀 **Plano de Ação Recomendado:**

### **Opção Rápida (30 minutos):**
1. **Cloudflare Pages** (gratuito)
2. **Domínio .pt** via Cloudflare
3. **Upload automático** via GitHub
4. **HTTPS automático**

### **Opção Tradicional (1 hora):**
1. **Hosting PT** (OVH/Hostinger)
2. **Domínio .pt**
3. **Upload manual** build/
4. **Configurar SSL**

---

## 💡 **Vantagens Servidor PT:**

### **Para Facebook:**
- ✅ **HTTPS obrigatório** - Funciona perfeitamente
- ✅ **Domínio verificado** - Mais confiança
- ✅ **Sem limitações** de desenvolvimento

### **Para usuários:**
- ✅ **Acesso global** - Qualquer pessoa pode usar
- ✅ **Performance** - Servidor dedicado
- ✅ **Profissional** - URL própria

### **Para você:**
- ✅ **Escalável** - Sem limites de usuários
- ✅ **Monetizável** - Pode cobrar pelo serviço
- ✅ **Credível** - Plataforma profissional

---

## 🎉 **Resultado Final:**

**Plataforma SaaS profissional:**
- `https://seudominio.pt`
- Qualquer pessoa no mundo pode usar
- Login Facebook funcionando
- Dados isolados por usuário
- Performance excelente

**Pronto para competir com TrackBee!** 🚀

---

**Quer que eu ajude com alguma destas opções específicas?**