# 🚀 Como Criar Sua Facebook App - Passo a Passo

## 📋 **1. Criar Facebook App**

### **Acesse o Facebook Developer Console:**
```
https://developers.facebook.com/apps/
```

### **Criar Nova App:**
1. Clique **"Criar app"**
2. Selecione **"Negócios"** (Business)
3. **Nome da app:** `Sheet Tools` (ou o nome que preferir)
4. **Email:** seu@email.com
5. Clique **"Criar app"**

---

## 🔧 **2. Configurar Produtos**

### **A. Adicionar Marketing API:**
1. No painel lateral, clique **"+ Adicionar produto"**
2. Encontre **"Marketing API"**
3. Clique **"Configurar"**

### **B. Adicionar Facebook Login:**
1. Clique **"+ Adicionar produto"** novamente
2. Encontre **"Facebook Login"**
3. Clique **"Configurar"**

---

## 🔐 **3. Configurar Facebook Login (IMPORTANTE)**

### **Ir para configurações:**
1. No menu lateral: **"Facebook Login" > "Configurações"**

### **Configurar URIs de redirecionamento:**
Na seção **"Valid OAuth Redirect URIs"**, adicione:
```
http://localhost:3000/meta-callback
```

### **Outras configurações:**
- **Client OAuth Login:** ✅ Ativado
- **Web OAuth Login:** ✅ Ativado
- **Force Web OAuth Reauthentication:** ❌ Desativado

### **Clique "Salvar alterações"**

---

## 📝 **4. Obter Credenciais**

### **App ID:**
1. Vá para **"Configurações" > "Básico"**
2. Copie o **"ID do app"** (exemplo: `1234567890123456`)

### **App Secret (para backend):**
1. Na mesma página, copie o **"Chave secreta do app"**
2. ⚠️ **NUNCA** coloque isto no frontend!

---

## ⚙️ **5. Configurar na Aplicação**

### **Atualizar App ID:**
Edite o arquivo: `src/components/MetaConnector.js`

Linha 10, trocar:
```javascript
// De:
const FACEBOOK_APP_ID = '3293651934284230';

// Para:
const FACEBOOK_APP_ID = 'SEU_APP_ID_AQUI';
```

### **Ou usar variável de ambiente (recomendado):**
```bash
# Criar arquivo .env na raiz do projeto:
echo "REACT_APP_FACEBOOK_APP_ID=SEU_APP_ID_AQUI" > .env
```

E no código usar:
```javascript
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || 'SEU_APP_ID_AQUI';
```

---

## 🔑 **6. Configurar Permissões**

### **Permissões necessárias:**
Na seção **"Permissões e funcionalidades"**, solicite:

- ✅ `ads_management` - Gerenciar anúncios
- ✅ `ads_read` - Ler dados de anúncios
- ✅ `business_management` - Acessar Business Manager
- ✅ `pages_manage_ads` - Gerenciar anúncios de páginas
- ✅ `pages_read_engagement` - Ler engajamento de páginas

---

## 🌐 **7. Para Produção (Opcional)**

### **Domínio próprio:**
Se quiser usar domínio próprio (ex: `meusite.com`):

1. **Adicionar domínio nas configurações**
2. **Atualizar redirect URI:** `https://meusite.com/meta-callback`
3. **Configurar HTTPS** (obrigatório)
4. **Verificar domínio** no Facebook

### **Revisão da App:**
Para uso público, pode precisar de revisão do Facebook.

---

## 🚀 **8. Testar**

### **Reiniciar aplicação:**
```bash
cd sheet-tools
npm start
```

### **Testar login:**
1. Clique **"Conectar Meta"**
2. Deve abrir popup com **SEU** App ID
3. Login funcionará com **suas** credenciais
4. Importará **suas** campanhas reais

---

## ⚡ **Resultado:**

✅ **Sua própria Facebook App**
✅ **Login seguro com suas credenciais**
✅ **Acesso ao seu Business Manager**
✅ **Importação de suas campanhas reais**
✅ **Sem dependência do TrackBee**

---

**🎯 Total: 10 minutos para ter sua própria integração Facebook!**

**Depois de criar, me diga seu App ID que eu atualizo no código!**