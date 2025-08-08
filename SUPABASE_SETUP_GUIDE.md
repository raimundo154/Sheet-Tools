# Guia de Configuração do Supabase para Sheet Tools

Este guia irá te ajudar a configurar completamente o Supabase para o projeto Sheet Tools, incluindo autenticação com Google e email.

## 1. Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta ou faça login
4. Clique em "New Project"
5. Escolha uma organização
6. Configure o projeto:
   - **Name**: Sheet Tools
   - **Database Password**: Use uma senha forte
   - **Region**: Europe West (London) - mais próximo de Portugal
7. Clique em "Create new project"

## 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://[SEU_PROJETO_ID].supabase.co`
   - **API Key (anon public)**: Sua chave pública

3. Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://[SEU_PROJETO_ID].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[SUA_CHAVE_ANONIMA]

# App Configuration
REACT_APP_NAME=Sheet Tools
REACT_APP_DOMAIN=sheet-tools.com

# Environment
REACT_APP_ENV=development
```

## 3. Configurar Autenticação com Google

### 3.1 Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** → **Credentials**
4. Clique em **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**

### 3.2 Configurar OAuth 2.0

1. **Application type**: Web application
2. **Name**: Sheet Tools
3. **Authorized JavaScript origins**:
   - `http://localhost:3000` (desenvolvimento)
   - `https://sheet-tools.com` (produção)
4. **Authorized redirect URIs**:
   - `https://[SEU_PROJETO_ID].supabase.co/auth/v1/callback`

5. Clique em **Create**
6. Copie o **Client ID** e **Client Secret**

### 3.3 Configurar no Supabase

1. No Supabase, vá para **Authentication** → **Providers**
2. Encontre **Google** e clique em **Enable**
3. Configure:
   - **Enabled**: ✅
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google
4. Clique em **Save**

## 4. Configurar Email com Zoho

### 4.1 Configurar SMTP no Supabase

1. Vá para **Settings** → **Auth**
2. Role até **SMTP Settings**
3. Configure:
   - **Enable custom SMTP**: ✅
   - **SMTP Host**: `smtp.zoho.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `info@sheet-tools.com`
   - **SMTP Pass**: `T.eops405078`
   - **SMTP Admin Email**: `info@sheet-tools.com`
   - **SMTP Sender Name**: `Sheet Tools`

### 4.2 Templates de Email

1. Vá para **Authentication** → **Email Templates**
2. Configure os templates:

#### Template de Confirmação:
```html
<h2>Bem-vindo ao Sheet Tools!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não se registrou no Sheet Tools, ignore este email.</p>
```

#### Template de Magic Link:
```html
<h2>Seu código de acesso ao Sheet Tools</h2>
<p>Use o código abaixo para fazer login:</p>
<h3>{{ .Token }}</h3>
<p>Este código é válido por 60 minutos.</p>
<p>Se você não solicitou este código, ignore este email.</p>
```

## 5. Configurar URLs de Redirecionamento

### 5.1 No Supabase

1. Vá para **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: `https://sheet-tools.com` (produção)
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://sheet-tools.com/auth/callback`

## 6. Configurar RLS (Row Level Security)

### 6.1 Criar Política de Usuários

1. Vá para **Table Editor**
2. A tabela `auth.users` já existe
3. Vá para **Authentication** → **Policies**
4. Crie políticas básicas para gerenciar dados dos usuários

## 7. Teste a Configuração

### 7.1 Ambiente de Desenvolvimento

1. Execute `npm start`
2. Acesse `http://localhost:3000`
3. Teste:
   - Login com Google
   - Login com email (magic link)
   - Verificação de código

### 7.2 Deploy para Produção

1. Configure as variáveis de ambiente no Netlify:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_DOMAIN=sheet-tools.com`
   - `REACT_APP_ENV=production`

2. Faça o deploy
3. Teste em produção

## 8. Configurações Adicionais de Segurança

### 8.1 Configurar Rate Limiting

No Supabase, vá para **Settings** → **Auth**:
- **Rate Limiting**: Configure limites para login
- **Session Timeout**: Configure timeout das sessões

### 8.2 Configurar Roles e Permissões

1. Crie roles personalizadas se necessário
2. Configure permissões específicas para diferentes tipos de usuário

## 9. Monitoramento

### 9.1 Logs

- Monitore logs em **Settings** → **Logs**
- Configure alertas para erros de autenticação

### 9.2 Analytics

- Use as métricas do Supabase para monitorar uso
- Configure alertas para problemas de autenticação

## Comandos Úteis

```bash
# Instalar dependências
npm install @supabase/supabase-js

# Executar em desenvolvimento
npm start

# Build para produção
npm run build

# Deploy no Netlify
netlify deploy --prod
```

## Troubleshooting

### Problemas Comuns:

1. **Erro de CORS**: Verifique as URLs de redirecionamento
2. **Email não chegando**: Verifique configurações SMTP
3. **Google OAuth não funciona**: Verifique Client ID e URLs autorizadas
4. **Token inválido**: Verifique se as chaves do Supabase estão corretas

### Logs Importantes:

- Console do navegador para erros JavaScript
- Logs do Supabase para erros de backend
- Logs do Netlify para problemas de deploy

## Suporte

- [Documentação do Supabase](https://supabase.com/docs)
- [Suporte do Supabase](https://supabase.com/support)
- [Comunidade Discord](https://discord.supabase.com/)
