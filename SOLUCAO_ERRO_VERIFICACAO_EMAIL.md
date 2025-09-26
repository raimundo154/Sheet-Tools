# 🔧 Solução para o Erro "Failed to fetch" na Verificação de Email

## 🚨 Problema Identificado

O erro `Failed to fetch` e `net::ERR_CONNECTION_REFUSED` ocorre porque:

1. **As funções Netlify não estão a correr localmente**
2. **Falta a configuração da `SUPABASE_SERVICE_ROLE_KEY`**
3. **O Netlify Dev não está iniciado**

## ✅ Soluções

### Opção 1: Usar Netlify Dev (Recomendado para Desenvolvimento)

1. **Instalar Netlify CLI** (já feito):
   ```bash
   npm install -g netlify-cli
   ```

2. **Configurar a Service Role Key**:
   - Vá para [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API
   - Copie a **"service_role"** key (não a "anon public")
   - Edite o arquivo `netlify-dev.env` e substitua `SUA_SERVICE_ROLE_KEY_AQUI` pela chave real

3. **Iniciar o ambiente de desenvolvimento**:
   ```bash
   # Opção A: Usar o script criado
   start-dev.bat
   
   # Opção B: Comando direto
   netlify dev --port 8888
   ```

4. **Acessar a aplicação**:
   - Abra: http://localhost:8888
   - As funções estarão disponíveis em: http://localhost:8888/.netlify/functions/

### Opção 2: Configurar para Produção

Se quiser testar diretamente com a produção:

1. **Configurar no Netlify Dashboard**:
   - Vá para [Netlify Dashboard](https://app.netlify.com) → Site Settings → Environment Variables
   - Adicione: `SUPABASE_SERVICE_ROLE_KEY` com a chave do Supabase

2. **Usar a aplicação em produção**:
   - Acesse: https://sheet-tools.com
   - As funções estarão em: https://sheet-tools.com/.netlify/functions/

## 🔍 Verificação do Problema

O erro ocorre na linha 97 do `authService.js`:
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: temporaryPassword })
})
```

A URL `http://localhost:8888/.netlify/functions/create-user` não está acessível porque:
- O Netlify Dev não está a correr na porta 8888
- Ou a `SUPABASE_SERVICE_ROLE_KEY` não está configurada

## 🎯 Fluxo Correto

1. **Usuário insere email** → Código enviado por EmailJS
2. **Usuário insere código** → `EmailVerification.js` chama `authService.createAccountWithEmail()`
3. **authService** chama a função Netlify `create-user`
4. **Função Netlify** cria usuário no Supabase com `email_confirm: true`
5. **authService** faz login automático com email/password temporária
6. **Usuário é redirecionado** para a aplicação principal

## 🚀 Próximos Passos

1. **Configure a Service Role Key** no arquivo `netlify-dev.env`
2. **Execute** `start-dev.bat` ou `netlify dev --port 8888`
3. **Teste** a verificação de email em http://localhost:8888
4. **Verifique** se não há mais erros na consola

## 📝 Notas Importantes

- A `SUPABASE_SERVICE_ROLE_KEY` é diferente da `REACT_APP_SUPABASE_ANON_KEY`
- A Service Role Key tem privilégios administrativos e deve ser mantida segura
- Em produção, configure as variáveis no Netlify Dashboard, não no código
- O Netlify Dev simula o ambiente de produção localmente
