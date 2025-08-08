# 🚀 Quick Start - Sheet Tools Authentication

## ⚡ Configuração Rápida (5 minutos)

### 1. 📝 Criar arquivo .env
```bash
# Na raiz do projeto, criar arquivo .env com:
REACT_APP_SUPABASE_URL=https://dnamxsapwgltxmtokecd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYW14c2Fwd2dsdHhtdG9rZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTA2MDQsImV4cCI6MjA3MDIyNjYwNH0.FhdEECAmYkrj78Zs8TI_m2qlZzydw1hYgOr113RPKS8
REACT_APP_NAME=Sheet Tools
REACT_APP_DOMAIN=sheet-tools.com
REACT_APP_ENV=development
```

### 2. 🏃‍♂️ Testar aplicação
```bash
npm start
```

### 3. 🔧 Configurar Google OAuth
1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Criar OAuth Client** com redirect: `https://dnamxsapwgltxmtokecd.supabase.co/auth/v1/callback`
3. **No Supabase**: Ir para Authentication → Providers → Google → Enable

### 4. 📧 Configurar Email (Opcional)
**No Supabase → Settings → Auth → SMTP:**
- Host: `smtp.zoho.com`
- Port: `587`
- User: `info@sheet-tools.com`
- Pass: `T.eops405078`

## 🎯 Testes Imediatos

### Teste 1: Magic Link (Funciona AGORA!)
1. Digite qualquer email válido
2. Clique "Enviar código"
3. Verifique email (código de 6 dígitos)
4. Digite código → Login automático!

### Teste 2: Google OAuth (Após configurar)
1. Clique botão Google
2. Login automático!

## 📂 Arquivos Importantes

- **`SUPABASE_SETUP_GUIDE.md`** - Guia completo Supabase
- **`GOOGLE_OAUTH_SETUP.md`** - Configuração Google passo-a-passo
- **`NETLIFY_PRODUCTION_CONFIG.md`** - Deploy produção
- **`IMPLEMENTATION_CHECKLIST.md`** - Lista verificação completa

## 🐛 Problemas?

### Console mostra erro de env?
```bash
# Verificar se .env existe na raiz
ls -la .env

# Se não existir, criar com o conteúdo do step 1
```

### Google OAuth não funciona?
- Primeiro configure Magic Link (funciona imediatamente)
- Depois configure Google OAuth seguindo `GOOGLE_OAUTH_SETUP.md`

### Email não chega?
- Verifique pasta spam
- Aguarde até 2 minutos
- Email será de `info@sheet-tools.com`

## 🎉 Funcionalidades Prontas

✅ **Login Visual** - Design idêntico à imagem
✅ **Magic Link** - Código por email instantâneo  
✅ **Google OAuth** - Um clique para login
✅ **Validações** - Email, loading, erros
✅ **Responsivo** - Mobile e desktop
✅ **Seguro** - Supabase + RLS
✅ **Produção Ready** - Deploy Netlify preparado

---

**💡 Dica**: Comece testando Magic Link (funciona imediatamente), depois configure Google OAuth quando tiver tempo!
