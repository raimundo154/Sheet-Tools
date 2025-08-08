# 📧 Sistema de Verificação por Email - Guia Completo

Este sistema permite que usuários criem contas inserindo apenas o email, recebam um código de 8 dígitos por email e verifiquem sua conta.

## 🚀 Funcionalidades Implementadas

✅ **Página de Cadastro** - Usuário insere email
✅ **Envio de Email** - Código de 8 dígitos enviado automaticamente  
✅ **Página de Verificação** - Usuário insere código recebido
✅ **Criação Automática de Conta** - Integração com Supabase
✅ **Timer de Expiração** - Código expira em 10 minutos
✅ **Reenvio de Código** - Usuário pode solicitar novo código
✅ **Interface Responsiva** - Funciona em mobile e desktop

## 📋 Fluxo do Usuário

1. **Usuário vai para `/signup`**
2. **Insere seu email** e clica "Enviar Código de Verificação"
3. **Recebe email** com código de 8 dígitos
4. **É redirecionado** para página de verificação (`/verify-email`)
5. **Insere o código** recebido
6. **Conta é criada automaticamente** no Supabase
7. **Login automático** e redirecionamento para aplicação

## ⚙️ Configuração do EmailJS

### Passo 1: Criar Conta
```
1. Acesse https://www.emailjs.com/
2. Crie uma conta gratuita
3. Confirme seu email
```

### Passo 2: Configurar Serviço de Email
```
1. No painel, vá em "Email Services"
2. Clique "Add New Service" 
3. Escolha seu provedor:
   - Gmail (recomendado)
   - Outlook
   - Yahoo
   - Outros
4. Conecte sua conta de email
5. Anote o SERVICE ID gerado (ex: service_abc123)
```

### Passo 3: Criar Template de Email
```
1. Vá em "Email Templates"
2. Clique "Create New Template"
3. Configure:
   - Nome: "Verificação de Conta"
   - Para: {{to_email}}
   - Assunto: Código de Verificação - {{from_name}}
4. Corpo do email (HTML):
```

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a3a 0%, #4a9bb8 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">{{from_name}}</h1>
      <p style="color: #b0c4de; margin: 10px 0 0 0;">Verificação de Conta</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #1e3a3a; margin-top: 0;">Bem-vindo!</h2>
      <p style="color: #333; line-height: 1.6;">Use o código abaixo para verificar sua conta:</p>
      
      <!-- Code Box -->
      <div style="background: #f8f9fa; border: 2px solid #4a9bb8; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Seu código de verificação:</p>
        <div style="font-size: 32px; font-weight: bold; color: #1e3a3a; letter-spacing: 4px; font-family: 'Courier New', monospace;">
          {{verification_code}}
        </div>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">Este código expira em 10 minutos</p>
      </div>
      
      <p style="color: #666; font-size: 14px;">Se você não solicitou este código, pode ignorar este email.</p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">Este é um email automático, não responda.</p>
      <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">&copy; 2024 {{from_name}}. Todos os direitos reservados.</p>
    </div>
    
  </div>
</body>
</html>
```

```
5. Anote o TEMPLATE ID gerado (ex: template_xyz789)
```

### Passo 4: Pegar Chave Pública
```
1. Vá em "Account" → "General"
2. Copie a "Public Key" (ex: abc123def456)
```

### Passo 5: Configurar Variáveis de Ambiente
Crie arquivo `.env` na raiz do projeto:

```env
# Supabase (já existente)
REACT_APP_SUPABASE_URL=sua-url-do-supabase
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima

# EmailJS (NOVO)
REACT_APP_EMAILJS_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789
REACT_APP_EMAILJS_PUBLIC_KEY=abc123def456
REACT_APP_EMAIL_FROM_NAME=Sheet Tools
```

### Passo 6: Reiniciar Servidor
```bash
npm start
```

## 🧪 Como Testar

1. **Acesse** `http://localhost:3000/signup`
2. **Insira seu email real** 
3. **Clique** "Enviar Código de Verificação"
4. **Verifique seu email** (incluindo spam)
5. **Insira o código** na página de verificação
6. **Conta criada!** Login automático

## 🔧 Modo Desenvolvimento

### Informações de Debug
No modo desenvolvimento, você verá:
- Status da configuração do EmailJS
- Código de verificação atual
- Botão para auto-preencher código
- Tempo restante de expiração

### Testar Configuração
Use o botão "🧪 Testar Configuração" na página de cadastro para verificar se o EmailJS está configurado corretamente.

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/services/emailService.js` - Serviço de envio de emails
- `src/components/SignupPage.js` - Página de cadastro
- `src/components/SignupPage.css` - Estilos do cadastro
- `src/components/EmailVerification.js` - Página de verificação
- `src/components/EmailVerification.css` - Estilos da verificação
- `EMAIL_VERIFICATION_SETUP.md` - Este guia

### Arquivos Modificados:
- `src/App.js` - Rotas e navegação
- `src/services/authService.js` - Criação de conta
- `src/components/LoginPage.js` - Link para cadastro
- `src/components/LoginPage.css` - Estilos do link
- `env.example` - Variáveis de exemplo
- `package.json` - Dependência @emailjs/browser

## 🚨 Troubleshooting

### Email não chegou?
- ✅ Verifique pasta de spam
- ✅ Confirme email correto no EmailJS
- ✅ Teste com outro provedor (Gmail, Outlook)
- ✅ Verifique console do navegador para erros

### Erro 400 - Bad Request?
- ✅ Verifique SERVICE_ID e TEMPLATE_ID
- ✅ Confirme variáveis no template: {{to_email}}, {{verification_code}}, {{from_name}}

### Erro 401 - Unauthorized?
- ✅ Verifique PUBLIC_KEY
- ✅ Confirme se a chave está correta no EmailJS

### Erro 403 - Forbidden?
- ✅ Verifique domínio autorizado no EmailJS
- ✅ Confirme configurações de segurança

### Erro 404 - Not Found?
- ✅ Serviço ou template pode ter sido deletado
- ✅ Recrie o serviço/template no EmailJS

## 💡 Dicas Importantes

### Segurança:
- ✅ Código expira em 10 minutos
- ✅ Código é único por solicitação
- ✅ Limpeza automática de dados temporários

### Performance:
- ✅ EmailJS é gratuito até 200 emails/mês
- ✅ Para mais volume, considere upgrade
- ✅ Dados temporários no localStorage

### UX:
- ✅ Interface responsiva
- ✅ Feedback visual de loading
- ✅ Mensagens de erro claras
- ✅ Timer de expiração visível

## 🔄 Fluxo Técnico

```
1. SignupPage.js → emailService.sendVerificationEmail()
2. Dados salvos no localStorage temporariamente
3. Redirecionamento para EmailVerification.js
4. Verificação do código → authService.createAccountWithEmail()
5. Criação automática no Supabase
6. Login automático e redirecionamento
```

## 📞 Suporte

Se precisar de ajuda:
1. Verifique este guia primeiro
2. Teste com as ferramentas de debug
3. Confira logs do console do navegador
4. Verifique configurações do EmailJS
