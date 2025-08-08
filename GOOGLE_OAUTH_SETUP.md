# Configuração Google OAuth para Sheet Tools

## 🔧 Configurações Rápidas para seu Projeto Supabase

### 1. No Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Vá para **APIs & Services** → **Credentials**
4. Clique **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
5. Configure:

**Application type**: Web application
**Name**: Sheet Tools
**Authorized JavaScript origins**:
- `http://localhost:3000`
- `https://sheet-tools.com`

**Authorized redirect URIs**:
- `https://dnamxsapwgltxmtokecd.supabase.co/auth/v1/callback`

### 2. No seu Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/dnamxsapwgltxmtokecd
2. Vá para **Authentication** → **Providers**
3. Encontre **Google** e clique **Enable**
4. Configure:
   - **Enabled**: ✅ 
   - **Client ID**: [COPIE DO GOOGLE CLOUD]
   - **Client Secret**: [COPIE DO GOOGLE CLOUD]
5. Clique **Save**

### 3. Configurar Email/SMTP

1. No Supabase, vá para **Settings** → **Auth**
2. Role até **SMTP Settings**
3. Configure:
   - **Enable custom SMTP**: ✅
   - **SMTP Host**: `smtp.zoho.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `info@sheet-tools.com`
   - **SMTP Pass**: `T.eops405078`
   - **SMTP Admin Email**: `info@sheet-tools.com`
   - **SMTP Sender Name**: `Sheet Tools`

### 4. Configurar URLs de Redirecionamento

1. Vá para **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: `https://sheet-tools.com`
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://sheet-tools.com/auth/callback`

### 5. Templates de Email

1. Vá para **Authentication** → **Email Templates**
2. Configure o template de **Magic Link**:

```html
<h2>Seu código de acesso ao Sheet Tools</h2>
<p>Use o código abaixo para fazer login:</p>
<h3 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; border-radius: 8px;">{{ .Token }}</h3>
<p>Este código é válido por 60 minutos.</p>
<p>Se você não solicitou este código, ignore este email.</p>
<br>
<small style="color: #666;">
Atenciosamente,<br>
Equipe Sheet Tools<br>
info@sheet-tools.com
</small>
```

## ✅ Teste das Funcionalidades

Após configurar tudo acima:

1. **Teste Google OAuth**:
   - Acesse http://localhost:3000
   - Clique no botão Google
   - Deve redirecionar para Google e voltar logado

2. **Teste Magic Link**:
   - Digite um email válido
   - Clique "Enviar código de verificação"
   - Verifique o email recebido
   - Digite o código de 6 dígitos
   - Deve fazer login automaticamente

## 🚨 Troubleshooting

**Se Google OAuth não funcionar**:
- Verifique se as URLs estão corretas no Google Cloud
- Confirme que o Client ID/Secret estão corretos no Supabase

**Se email não chegar**:
- Verifique as configurações SMTP no Supabase
- Confirme que as credenciais Zoho estão corretas
- Verifique pasta de spam

**Se houver erro 400/401**:
- Confirme que o arquivo .env existe e tem as configurações corretas
- Reinicie a aplicação (`npm start`)

## 📱 Deploy para Produção

Quando estiver tudo funcionando localmente:

1. Configure as mesmas variáveis no Netlify
2. Atualize as URLs no Google Cloud para produção
3. Teste em https://sheet-tools.com
