# 🛠️ Sheet Tools

Uma plataforma moderna para gestão de campanhas e automação, com sistema de autenticação seguro e interface profissional.

## 🚀 Funcionalidades

### 🔐 Sistema de Autenticação
- **Login com Google** - OAuth integrado via Supabase
- **Magic Link por Email** - Código de verificação de 6 dígitos
- **Interface Responsiva** - Design moderno e profissional
- **Segurança Avançada** - Row Level Security (RLS) no Supabase

### 🎨 Interface
- Design inspirado em plataformas modernas
- Layout de dois painéis (logo + formulário)
- Estados de loading e feedback visual
- Totalmente responsivo (desktop e mobile)

### ⚡ Tecnologias
- **Frontend**: React 19, CSS moderno
- **Backend**: Supabase (BaaS)
- **Autenticação**: Supabase Auth + Google OAuth
- **Deploy**: Netlify
- **Email**: Zoho SMTP integrado

## 🏃‍♂️ Quick Start

### 1. Configuração Local

```bash
# Clone e instale dependências
npm install

# Crie arquivo .env na raiz:
REACT_APP_SUPABASE_URL=https://dnamxsapwgltxmtokecd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui
REACT_APP_NAME=Sheet Tools
REACT_APP_DOMAIN=sheet-tools.com
REACT_APP_ENV=development

# Inicie a aplicação
npm start
```

### 2. Teste Imediato

✅ **Magic Link**: Digite qualquer email válido → Receberá código → Login automático  
✅ **Interface**: Visual completo, responsivo, com favicon personalizado  
✅ **Google OAuth**: Após configuração no Supabase  

## 📚 Documentação

- **[QUICK_START.md](QUICK_START.md)** - Configuração em 5 minutos
- **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)** - Guia completo do Supabase
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth passo-a-passo
- **[NETLIFY_PRODUCTION_CONFIG.md](NETLIFY_PRODUCTION_CONFIG.md)** - Deploy para produção
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Lista de verificação

## 🛡️ Segurança

- **Variáveis de ambiente** protegidas
- **HTTPS** obrigatório em produção
- **Headers de segurança** configurados
- **Row Level Security** no banco
- **OAuth seguro** via Supabase

## 🌐 Deploy

### Netlify (Automático)
```bash
# Push para repositório Git
git add .
git commit -m "Deploy production"
git push origin main

# Netlify faz deploy automático
```

### Variáveis de Produção
Configure no Netlify Dashboard:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_NAME`
- `REACT_APP_DOMAIN`
- `REACT_APP_ENV=production`

## 🎯 Roadmap

### ✅ Concluído
- [x] Sistema de autenticação completo
- [x] Interface visual moderna
- [x] Integração Supabase
- [x] Deploy automático Netlify
- [x] Documentação completa

### 🔄 Próximas Features
- [ ] Dashboard de campanhas
- [ ] Gestão de usuários
- [ ] Analytics integrado
- [ ] API para automações
- [ ] Integração com sheets

## 🐛 Troubleshooting

### Problemas Comuns

**Build falha no Netlify?**
- Arquivo `netlify.toml` já configurado com `CI=false`
- Variáveis de ambiente configuradas automaticamente

**Autenticação não funciona?**
- Verifique arquivo `.env` local
- Configure SMTP no Supabase (ver guias)
- Configure Google OAuth (ver `GOOGLE_OAUTH_SETUP.md`)

**Email não chega?**
- Verifique pasta spam
- Email vem de `info@sheet-tools.com`
- Aguarde até 2 minutos

## 📞 Suporte

- **Documentação**: Consulte os arquivos `.md` na raiz
- **Issues**: Use o sistema de issues do GitHub
- **Email**: info@sheet-tools.com

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

**🎉 Sistema pronto para produção! Comece testando localmente e depois faça deploy no Netlify.**