# Integração Facebook Marketing API

## 🎯 Funcionalidade Implementada

A plataforma agora possui integração com Facebook Ads Manager que permite:

- ✅ Conectar conta do Facebook Ads
- ✅ Sincronizar campanhas automaticamente  
- ✅ Importar dados de performance (gasto, impressões, cliques, vendas, ATC)
- ✅ Aplicar regras automáticas às campanhas importadas
- ✅ Interface visual para gestão da conexão

## 🔧 Como Funciona Atualmente (Demonstração)

**Status:** Implementação de demonstração com dados simulados

A integração atual usa dados simulados para demonstrar a funcionalidade. Para testar:

1. Clique em "Conectar Facebook Ads" no dashboard
2. Insira qualquer Access Token e ID de conta (serão aceitos para demonstração)
3. Veja 3 campanhas de exemplo sendo importadas
4. Configure preços e COGS para ativar as regras automáticas

## 🚀 Implementação Real em Produção

Para implementar a integração real com Facebook Marketing API, você precisa:

### 1. **Obter Credenciais Facebook**

```bash
# Criar app no Facebook Developer Console
https://developers.facebook.com/apps/

# Solicitar permissões necessárias:
- ads_read (obrigatório)
- ads_management (opcional, para modificar campanhas)
- business_management (para contas business)
```

### 2. **Resolver CORS (3 opções)**

#### Opção A: Backend Proxy (Recomendado)
```javascript
// backend/facebook-proxy.js
app.get('/api/facebook/campaigns', async (req, res) => {
  const { accessToken, adAccountId } = req.query;
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/campaigns?fields=id,name,objective,status&access_token=${accessToken}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Opção B: Facebook SDK for JavaScript
```javascript
// Instalar: npm install facebook-js-sdk
import FB from 'facebook-js-sdk';

FB.init({
  appId: 'YOUR_APP_ID',
  version: 'v23.0'
});

FB.api('/act_ACCOUNT_ID/campaigns', 'GET', {
  fields: 'id,name,objective,status',
  access_token: 'YOUR_ACCESS_TOKEN'
}, (response) => {
  console.log(response);
});
```

#### Opção C: Webhook (Para dados em tempo real)
```javascript
// Configurar webhook no Facebook Developer Console
// Receber notificações quando campanhas são atualizadas
app.post('/webhook/facebook', (req, res) => {
  const updates = req.body.entry;
  // Processar atualizações das campanhas
  updateLocalCampaigns(updates);
  res.sendStatus(200);
});
```

### 3. **Substituir Código Simulado**

No arquivo `FacebookApiIntegration.js`, substitua as funções:

```javascript
// Substituir validateConnection()
const validateConnection = async (config) => {
  setConnectionStatus('connecting');
  setError('');
  
  try {
    // REAL: Fazer chamada para seu backend proxy
    const response = await fetch(`/api/facebook/account-info?accessToken=${config.accessToken}&adAccountId=${config.adAccountId}`);
    
    if (response.ok) {
      const accountData = await response.json();
      setAccountInfo(accountData);
      setConnectionStatus('connected');
      localStorage.setItem('facebook_api_config', JSON.stringify(config));
      await fetchCampaigns(config);
    } else {
      throw new Error('Erro ao conectar com Facebook API');
    }
  } catch (err) {
    setError(err.message);
    setConnectionStatus('error');
  }
};

// Substituir fetchCampaigns()
const fetchCampaigns = async (config = apiConfig) => {
  setIsLoading(true);
  try {
    // REAL: Buscar campanhas via backend proxy
    const campaignsResponse = await fetch(`/api/facebook/campaigns?accessToken=${config.accessToken}&adAccountId=${config.adAccountId}`);
    const campaignsData = await campaignsResponse.json();
    
    // Buscar insights para cada campanha
    const campaignsWithInsights = await Promise.all(
      campaignsData.data.map(async (campaign) => {
        const insightsResponse = await fetch(`/api/facebook/insights?campaignId=${campaign.id}&accessToken=${config.accessToken}`);
        const insights = await insightsResponse.json();
        return { ...campaign, insights: insights.data[0] || {} };
      })
    );
    
    setCampaigns(campaignsWithInsights);
    setLastSync(new Date());
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. **Endpoints da API Facebook Necessários**

```javascript
// Principais endpoints que a integração usa:

// 1. Informações da conta
GET https://graph.facebook.com/v23.0/act_{ad-account-id}?fields=name,currency,account_status,amount_spent

// 2. Campanhas ativas
GET https://graph.facebook.com/v23.0/act_{ad-account-id}/campaigns?fields=id,name,objective,status,created_time&effective_status=["ACTIVE","PAUSED"]

// 3. Insights das campanhas (últimos 7 dias)
GET https://graph.facebook.com/v23.0/{campaign-id}/insights?fields=impressions,clicks,spend,actions,cpc,cpm,ctr&date_preset=last_7d

// 4. Insights por dia (para dados diários)
GET https://graph.facebook.com/v23.0/{campaign-id}/insights?fields=impressions,clicks,spend,actions&time_range={"since":"2025-01-01","until":"2025-01-01"}
```

### 5. **Sincronização Automática (Opcional)**

```javascript
// Configurar sincronização automática a cada hora
useEffect(() => {
  if (connectionStatus === 'connected') {
    const interval = setInterval(() => {
      fetchCampaigns();
    }, 3600000); // 1 hora
    
    return () => clearInterval(interval);
  }
}, [connectionStatus]);
```

### 6. **Tratamento de Erros Comuns**

```javascript
const handleFacebookError = (error) => {
  switch (error.code) {
    case 190: // Invalid access token
      setError('Access token inválido ou expirado');
      setConnectionStatus('disconnected');
      break;
    case 100: // Invalid parameter
      setError('Parâmetros inválidos na requisição');
      break;
    case 4: // Rate limit
      setError('Limite de requisições atingido. Tente novamente em alguns minutos.');
      break;
    default:
      setError(error.message || 'Erro desconhecido');
  }
};
```

## 📊 Dados Disponíveis da API Facebook

A integração pode obter estas métricas automaticamente:

### Métricas de Campanha:
- `impressions` - Impressões
- `clicks` - Cliques totais  
- `spend` - Gasto
- `reach` - Alcance
- `frequency` - Frequência
- `cpc` - Custo por clique
- `cpm` - Custo por mil impressões
- `ctr` - Taxa de clique

### Actions (Conversões):
- `purchase` - Compras
- `add_to_cart` - Adicionar ao carrinho
- `initiate_checkout` - Iniciar checkout
- `lead` - Leads
- `link_click` - Cliques em links

### Valores de Conversão:
- `purchase_value` - Valor das compras
- `conversion_values` - Valores de todas as conversões

## 🔐 Segurança e Boas Práticas

1. **Nunca expor Access Tokens no frontend**
2. **Usar HTTPS sempre**
3. **Implementar rate limiting**
4. **Armazenar tokens de forma segura**
5. **Renovar tokens automaticamente**
6. **Validar permissões antes de cada requisição**

## 🎯 Benefícios da Integração Real

Quando implementada corretamente, a integração oferece:

- ✅ **Sincronização automática** de todas as campanhas ativas
- ✅ **Dados em tempo real** sem inserção manual
- ✅ **Aplicação automática** das regras de kill/scale/maintain
- ✅ **Histórico completo** de performance por dia
- ✅ **Alertas automáticos** quando regras são ativadas
- ✅ **Relatórios consolidados** entre Facebook e outras plataformas

## 🚨 Limitações Atuais (Demonstração)

- Dados são simulados, não reais
- Não há conexão real com Facebook API
- Limitado a 3 campanhas de exemplo
- Não sincroniza automaticamente
- Requer configuração manual de preços/COGS

---

**Para implementar a versão real, siga os passos acima ou contacte um desenvolvedor para configurar o backend proxy necessário.**