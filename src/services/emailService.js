// Serviço de envio de emails para verificação de conta
// Este serviço usa EmailJS para enviar emails diretamente do frontend

// IMPORTANTE: Para usar este serviço, você precisa:
// 1. Criar conta no EmailJS (https://www.emailjs.com/)
// 2. Configurar um serviço de email (Gmail, Outlook, etc.)
// 3. Criar um template de email
// 4. Configurar as variáveis de ambiente no arquivo .env

// Variáveis de ambiente necessárias (adicionar no .env):
// REACT_APP_EMAILJS_SERVICE_ID=seu-service-id
// REACT_APP_EMAILJS_TEMPLATE_ID=seu-template-id
// REACT_APP_EMAILJS_PUBLIC_KEY=sua-chave-publica
// REACT_APP_EMAIL_FROM_NAME=Sheet Tools

// CONFIGURAÇÃO NO EMAILJS:
// 1. Acesse https://www.emailjs.com/ e crie uma conta
// 2. Vá em "Email Services" e adicione seu provedor (Gmail, Outlook, etc.)
// 3. Vá em "Email Templates" e crie um template com as variáveis: 
//    {{to_email}}, {{verification_code}}, {{from_name}}
// 4. Pegue o Service ID, Template ID e Public Key
// 5. Adicione no arquivo .env

import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.initialized = false;
    this.initializeEmailJS();
  }

  // Inicializar o EmailJS
  initializeEmailJS() {
    try {
      // Verificar se as variáveis estão configuradas
      if (process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
        // Inicializar EmailJS com a chave pública
        emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
        this.initialized = true;
        console.log('EmailJS inicializado com sucesso');
      } else {
        console.warn('EmailJS não configurado. Configure as variáveis REACT_APP_EMAILJS_* no .env');
      }
    } catch (error) {
      console.error('Erro ao inicializar EmailJS:', error);
    }
  }

  // Gerar código de verificação de 8 dígitos
  generateVerificationCode() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  // Verificar se o serviço de email está configurado
  isConfigured() {
    return this.initialized && 
           !!process.env.REACT_APP_EMAILJS_SERVICE_ID && 
           !!process.env.REACT_APP_EMAILJS_TEMPLATE_ID &&
           !!process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
  }

  // Enviar email de verificação
  async sendVerificationEmail(toEmail, verificationCode) {
    try {
      // Verificar se o serviço está configurado
      if (!this.isConfigured()) {
        throw new Error('EmailJS não está configurado. Verifique as variáveis de ambiente.');
      }

      // Parâmetros para o template do EmailJS
      const templateParams = {
        to_email: toEmail,
        verification_code: verificationCode,
        from_name: process.env.REACT_APP_EMAIL_FROM_NAME || 'Sheet Tools',
        subject: 'Código de Verificação - Sheet Tools'
      };

      // Enviar email usando EmailJS
      const response = await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams
      );
      
      console.log('Email enviado com sucesso:', response);
      return {
        success: true,
        messageId: response.text,
        code: verificationCode
      };

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      
      // Tratamento de erros específicos do EmailJS
      let errorMessage = 'Erro ao enviar email de verificação.';
      
      if (error.status === 400) {
        errorMessage = 'Erro na configuração do EmailJS. Verifique o Service ID e Template ID.';
      } else if (error.status === 401) {
        errorMessage = 'Chave pública do EmailJS inválida.';
      } else if (error.status === 403) {
        errorMessage = 'Acesso negado. Verifique as configurações do EmailJS.';
      } else if (error.status === 404) {
        errorMessage = 'Serviço ou template não encontrado no EmailJS.';
      }

      throw new Error(errorMessage);
    }
  }

  // Enviar email de suporte para info@sheet-tools.com
  async sendSupportEmail(message, userInfo = null) {
    try {
      // Get current user info if not provided
      if (!userInfo) {
        const currentUser = this.getCurrentUser();
        userInfo = {
          email: currentUser?.email || 'Usuário não identificado',
          name: currentUser?.user_metadata?.display_name || 
                currentUser?.user_metadata?.full_name || 
                'Nome não disponível',
          userId: currentUser?.id || 'ID não disponível'
        };
      }

      // Prepare email parameters for support
      const templateParams = {
        to_email: 'info@sheet-tools.com',
        from_name: userInfo.name,
        from_email: userInfo.email,
        user_id: userInfo.userId,
        message: message,
        timestamp: new Date().toLocaleString('pt-PT'),
        subject: `Suporte - Mensagem de ${userInfo.name}`,
        reply_to: userInfo.email
      };

      console.log('🔄 Enviando email de suporte...');
      console.log('Para:', templateParams.to_email);
      console.log('De:', `${templateParams.from_name} <${templateParams.from_email}>`);
      console.log('Mensagem:', templateParams.message);

      // Check if EmailJS is configured for support emails
      const supportServiceId = process.env.REACT_APP_EMAILJS_SUPPORT_SERVICE_ID || process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const supportTemplateId = process.env.REACT_APP_EMAILJS_SUPPORT_TEMPLATE_ID;

      if (!supportServiceId || !supportTemplateId) {
        console.log('⚠️ EmailJS para suporte não configurado, simulando envio...');
        
        // Log detailed email information for development
        console.log('=== EMAIL DE SUPORTE SERIA ENVIADO ===');
        console.log('Para:', templateParams.to_email);
        console.log('De:', `${templateParams.from_name} <${templateParams.from_email}>`);
        console.log('Assunto:', templateParams.subject);
        console.log('Mensagem:', templateParams.message);
        console.log('Data:', templateParams.timestamp);
        console.log('ID do Usuário:', templateParams.user_id);
        console.log('======================================');
        
        return {
          success: true,
          message: 'Email de suporte simulado enviado com sucesso (modo desenvolvimento)',
          details: templateParams
        };
      }

      // Send actual support email using EmailJS
      const response = await emailjs.send(
        supportServiceId,
        supportTemplateId,
        templateParams
      );

      console.log('✅ Email de suporte enviado com sucesso:', response);

      return {
        success: true,
        message: 'Email de suporte enviado com sucesso!',
        response: response
      };

    } catch (error) {
      console.error('❌ Erro ao enviar email de suporte:', error);
      
      return {
        success: false,
        message: 'Erro ao enviar email de suporte. Por favor, contacte-nos diretamente em info@sheet-tools.com',
        error: error.message
      };
    }
  }

  // Helper method to get current user (since we can't import authService here due to circular dependency)
  getCurrentUser() {
    try {
      // Try to get from localStorage or sessionStorage
      const supabaseAuth = localStorage.getItem('sb-iqgwxnscnlfqwqakqxol-auth-token') || 
                          sessionStorage.getItem('sb-iqgwxnscnlfqwqakqxol-auth-token');
      
      if (supabaseAuth) {
        const authData = JSON.parse(supabaseAuth);
        return authData.user;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Testar configuração do EmailJS
  async testEmailConfiguration() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'EmailJS não configurado. Verifique as variáveis REACT_APP_EMAILJS_*'
        };
      }

      // Testar envio para email de teste
      const testCode = '12345678';
      const testEmail = 'test@example.com'; // Email de teste
      
      // Nota: Este teste não enviará email real, apenas verificará a configuração
      return {
        success: true,
        message: 'EmailJS configurado corretamente',
        config: {
          serviceId: !!process.env.REACT_APP_EMAILJS_SERVICE_ID,
          templateId: !!process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          publicKey: !!process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
          initialized: this.initialized
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro na configuração: ${error.message}`
      };
    }
  }
}

// Exportar instância única (singleton)
const emailService = new EmailService();
export default emailService;

/* 
INSTRUÇÕES DE CONFIGURAÇÃO DO EMAILJS:

1. CRIAR CONTA NO EMAILJS:
   - Acesse https://www.emailjs.com/
   - Crie uma conta gratuita
   - Confirme seu email

2. CONFIGURAR SERVIÇO DE EMAIL:
   - No painel do EmailJS, vá em "Email Services"
   - Clique "Add New Service"
   - Escolha seu provedor (Gmail, Outlook, Yahoo, etc.)
   - Conecte sua conta de email
   - Anote o SERVICE ID gerado service_nbrfd49

3. CRIAR TEMPLATE DE EMAIL:
   - Vá em "Email Templates"
   - Clique "Create New Template"
   - Configure o template com estas variáveis:
     * Para: {{to_email}}
     * Assunto: Código de Verificação - {{from_name}}
     * Corpo: Seu código de verificação é: {{verification_code}}
   - Anote o TEMPLATE ID gerado template_5zx1wou

4. PEGAR CHAVE PÚBLICA:
   - Vá em "Account" > "General"
   - Copie a "Public Key" Yfpi-SMF6d1A6F315

5. CONFIGURAR ARQUIVO .env:
   REACT_APP_EMAILJS_SERVICE_ID=seu-service-id
   REACT_APP_EMAILJS_TEMPLATE_ID=seu-template-id
   REACT_APP_EMAILJS_PUBLIC_KEY=sua-chave-publica
   REACT_APP_EMAIL_FROM_NAME=Sheet Tools

6. REINICIAR O SERVIDOR:
   npm start

EXEMPLO DE TEMPLATE HTML NO EMAILJS:
-----------------------------------
Assunto: Código de Verificação - {{from_name}}

Corpo:
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Verificação de Conta - {{from_name}}</h2>
  <p>Olá!</p>
  <p>Seu código de verificação é:</p>
  <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
    {{verification_code}}
  </div>
  <p>Este código expira em 10 minutos.</p>
  <p>Se você não solicitou este código, ignore este email.</p>
</body>
</html>

LIMITES GRATUITOS DO EMAILJS:
- 200 emails por mês
- Upgrade para planos pagos se precisar de mais
*/
