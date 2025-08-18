# Guia de Configuração do EmailJS para Suporte

Este guia vai te ajudar a configurar o EmailJS para que o chat bot envie emails reais para info@sheet-tools.com.

## 📋 Pré-requisitos

- Conta no EmailJS (gratuito até 200 emails/mês)
- Acesso ao email info@sheet-tools.com

## 🚀 Passo a Passo

### 1. Criar Conta no EmailJS

1. Acesse [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clique em "Sign Up" e crie sua conta
3. Confirme seu email
4. Faça login no dashboard

### 2. Configurar Serviço de Email

1. No dashboard, vá em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha seu provedor de email:
   - **Gmail** (recomendado se info@sheet-tools.com for Gmail)
   - **Outlook** (se for Outlook/Hotmail)
   - **Custom SMTP** (para outros provedores)

4. **Para Gmail:**
   - Conecte a conta info@sheet-tools.com
   - Autorize o EmailJS a enviar emails
   - **Importante:** Pode ser necessário gerar uma "App Password" no Google

5. **Para Outlook:**
   - Conecte a conta info@sheet-tools.com
   - Autorize o EmailJS

6. **Para SMTP Personalizado:**
   - Configure com as informações do seu provedor de email
   - Host, porta, usuário, senha, etc.

7. **Anote o SERVICE ID** gerado (ex: `service_abc123`)

### 3. Criar Template de Suporte

1. Vá em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Configure o template com estas informações:

**Configurações do Template:**

- **Template Name:** Support Email Template
- **Subject:** `Suporte - Mensagem de {{from_name}}`
- **To Email:** `info@sheet-tools.com` (fixo)
- **From Name:** `{{from_name}}`
- **Reply To:** `{{from_email}}`

**Corpo do Email (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1c6f5b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .message-box { background: #f9f9f9; border-left: 4px solid #96f2d7; padding: 15px; margin: 20px 0; }
        .user-info { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .footer { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🆘 Nova Mensagem de Suporte</h1>
        <p>Sheet Tools - Sistema de Suporte</p>
    </div>
    
    <div class="content">
        <h2>Detalhes do Usuário</h2>
        <div class="user-info">
            <p><strong>Nome:</strong> {{from_name}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
            <p><strong>ID do Usuário:</strong> {{user_id}}</p>
            <p><strong>Data/Hora:</strong> {{timestamp}}</p>
        </div>
        
        <h2>Mensagem</h2>
        <div class="message-box">
            {{message}}
        </div>
        
        <p><strong>⚡ Para responder:</strong> Responda diretamente a este email que será enviado para {{from_email}}</p>
    </div>
    
    <div class="footer">
        <p>Enviado automaticamente pelo sistema de suporte do Sheet Tools</p>
        <p>Este email foi enviado para info@sheet-tools.com</p>
    </div>
</body>
</html>
```

4. **Teste o template** clicando em "Test"
5. **Anote o TEMPLATE ID** gerado (ex: `template_xyz789`)

### 4. Obter Chave Pública

1. Vá em **"Account"** > **"General"**
2. Copie a **"Public Key"** (ex: `Abc123XyZ`)

### 5. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# EmailJS Support Configuration
REACT_APP_EMAILJS_SUPPORT_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_SUPPORT_TEMPLATE_ID=template_xyz789
REACT_APP_EMAILJS_PUBLIC_KEY=Abc123XyZ
```

### 6. Reiniciar o Servidor

```bash
npm start
```

## 🧪 Testar a Configuração

1. Abra o chat bot no sistema
2. Clique em "Falar com um humano"
3. Envie uma mensagem de teste
4. Verifique se o email chegou em info@sheet-tools.com
5. Verifique os logs do navegador (F12 > Console)

## 🔧 Troubleshooting

### Problema: Email não chega

**Soluções:**
1. Verifique se todas as variáveis estão corretas no `.env`
2. Verifique se o serviço EmailJS está conectado corretamente
3. Verifique a pasta de spam
4. Teste enviando para outro email primeiro

### Problema: Erro 401 (Unauthorized)

**Soluções:**
1. Verifique se a Public Key está correta
2. Regenear a Public Key no EmailJS

### Problema: Erro 404 (Not Found)

**Soluções:**
1. Verifique se o SERVICE_ID está correto
2. Verifique se o TEMPLATE_ID está correto

### Problema: Erro 400 (Bad Request)

**Soluções:**
1. Verifique se todas as variáveis do template estão sendo enviadas
2. Verifique se o template está configurado corretamente

## 📊 Logs e Debugging

Durante desenvolvimento, todos os emails são logados no console:

```
🔄 Enviando email de suporte...
Para: info@sheet-tools.com
De: João Silva <joao@example.com>
Mensagem: Preciso de ajuda com...
=== EMAIL DE SUPORTE SERIA ENVIADO ===
Para: info@sheet-tools.com
De: João Silva <joao@example.com>
Assunto: Suporte - Mensagem de João Silva
Mensagem: Preciso de ajuda com...
Data: 14/08/2025, 15:30:42
ID do Usuário: user_123abc
======================================
```

## 🎯 Configuração Alternativa (SMTP Direto)

Se preferires não usar EmailJS, podes configurar um backend com Nodemailer:

### Exemplo de Backend (Node.js + Express)

```javascript
// server.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@sheet-tools.com',
        pass: 'your-app-password'
    }
});

app.post('/api/send-support-email', async (req, res) => {
    const { from_name, from_email, message, user_id } = req.body;
    
    try {
        await transporter.sendMail({
            from: 'info@sheet-tools.com',
            to: 'info@sheet-tools.com',
            replyTo: from_email,
            subject: `Suporte - Mensagem de ${from_name}`,
            html: `
                <h2>Nova mensagem de suporte</h2>
                <p><strong>De:</strong> ${from_name} (${from_email})</p>
                <p><strong>ID:</strong> ${user_id}</p>
                <hr>
                <p>${message}</p>
            `
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 📞 Suporte

Se tiveres problemas com a configuração:
1. Verifica os logs do console do navegador
2. Testa com um email pessoal primeiro
3. Contacta o suporte do EmailJS se necessário

---

**✅ Após configurar corretamente, todos os emails do chat bot serão enviados automaticamente para info@sheet-tools.com!**