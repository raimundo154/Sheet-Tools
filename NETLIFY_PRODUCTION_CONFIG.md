# Configuração de Produção no Netlify

## 🚀 Variáveis de Ambiente para Produção

Configure estas variáveis no seu painel do Netlify:

### 1. Acesse o Netlify Dashboard
- Vá para o seu site Sheet Tools
- Clique em **Site settings**
- Vá para **Environment variables**

### 2. Adicione as Variáveis

Clique **Add variable** para cada uma:

```
REACT_APP_SUPABASE_URL
Valor: https://dnamxsapwgltxmtokecd.supabase.co

REACT_APP_SUPABASE_ANON_KEY  
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYW14c2Fwd2dsdHhtdG9rZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTA2MDQsImV4cCI6MjA3MDIyNjYwNH0.FhdEECAmYkrj78Zs8TI_m2qlZzydw1hYgOr113RPKS8

REACT_APP_NAME
Valor: Sheet Tools

REACT_APP_DOMAIN
Valor: sheet-tools.com

REACT_APP_ENV
Valor: production
```

### 3. Deploy Settings

No Netlify, configure:

**Build command**: `npm run build`
**Publish directory**: `build`
**Node version**: 18 (recomendado)

### 4. Configurações de Domínio

1. Vá para **Domain settings**
2. Configure `sheet-tools.com` como domínio principal
3. Configure SSL (deve ser automático)
4. Verifique redirects HTTP → HTTPS

### 5. Deploy

Após configurar tudo:
1. Clique **Deploy site**
2. Ou faça push para o repositório Git
3. Netlify fará deploy automaticamente

## ✅ Verificações Pós-Deploy

Após o deploy:

1. **Teste Google OAuth em produção**:
   - Acesse https://sheet-tools.com
   - Teste login com Google

2. **Teste Magic Link em produção**:
   - Digite email válido
   - Verifique se recebe o código
   - Teste login

3. **Verifique Console do Navegador**:
   - Abra F12 → Console
   - Não deve haver erros de configuração

## 🔧 Build Optimizations

Para melhor performance, configure no Netlify:

### Build & Deploy Settings
```
Build command: npm run build
Publish directory: build
Functions directory: netlify/functions
```

### Headers (opcional)
Crie `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### Redirects
O arquivo `public/_redirects` já está configurado:
```
/auth/callback    /index.html   200
/*                /index.html   200
```

## 📊 Monitoramento

Configure alertas no Netlify para:
- Build failures
- Deploy errors
- Form submissions (se usar)

No Supabase, monitore:
- Authentication metrics
- API usage
- Error logs

## 🚨 Troubleshooting Produção

**Se site não carregar**:
- Verifique se build foi bem-sucedido
- Confirme variáveis de ambiente
- Verifique logs do Netlify

**Se autenticação não funcionar**:
- Confirme URLs no Google Cloud incluem produção
- Verifique URLs no Supabase incluem produção
- Teste em modo incógnito

**Performance issues**:
- Use Lighthouse para auditoria
- Otimize imagens se necessário
- Configure cache headers
