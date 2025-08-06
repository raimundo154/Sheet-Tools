# 🚀 Como Criar Facebook App - Guia Rápido (5 minutos)

## 📋 **Passo a passo:**

### **1. Ir ao Facebook Developer Console**
```
https://developers.facebook.com/apps/
```

### **2. Criar Nova App**
- Clique **"Criar app"**
- Selecione **"Negócios"** (Business)
- Nome da app: `Campaign Manager Pro` (ou outro nome)
- Email: `seu@email.com`
- Clique **"Criar app"**

### **3. Adicionar Produtos**

#### **A. Marketing API:**
- No painel lateral, clique **"Adicionar produto"**
- Encontre **"Marketing API"**
- Clique **"Configurar"**

#### **B. Facebook Login:**
- Clique **"Adicionar produto"** novamente
- Encontre **"Facebook Login"**
- Clique **"Configurar"**

### **4. Configurar Facebook Login**
- Vá para **"Facebook Login" > "Configurações"**
- Em **"Valid OAuth Redirect URIs"** adicione:
  ```
  http://localhost:3000/facebook-callback.html
  ```
- Clique **"Salvar alterações"**

### **5. Obter App ID**
- Vá para **"Configurações" > "Básico"**
- Copie o **"ID do app"** (exemplo: `1234567890123456`)

### **6. Configurar na aplicação**
```bash
# No diretório sheet-tools:
cp env.example .env

# Editar .env e adicionar:
REACT_APP_FACEBOOK_APP_ID=1234567890123456
```

### **7. Reiniciar aplicação**
```bash
npm start
```

---

## ✅ **Pronto!** 

Agora quando clicar "Conectar Facebook Ads" será redirecionado para o login real do Facebook!

## 🔧 **Configurações adicionais (opcional):**

### **Permissões necessárias:**
- `ads_management` - Gerenciar campanhas
- `ads_read` - Ler dados de campanhas  
- `business_management` - Acessar Business Manager
- `pages_manage_ads` - Gerenciar anúncios de páginas

### **Para produção:**
1. **Verificar domínio** no Facebook
2. **Adicionar política de privacidade**
3. **Submeter para revisão** (se necessário)
4. **Configurar HTTPS** obrigatório

---

**⚡ Total: 5 minutos para ter OAuth funcionando!**