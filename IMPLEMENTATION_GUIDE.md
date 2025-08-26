# 🚀 Meta Ad Library Integration - Implementation Guide

## Visão Geral do Projeto

Este projeto integra a Meta Ad Library (Graph API /ads_archive) na página de Product Research existente, fornecendo pesquisa avançada de anúncios com todos os filtros obrigatórios implementados.

### Arquitetura Implementada

```
Sheet-Tools/
├── src/
│   ├── services/
│   │   └── metaAdLibraryApi.js     # Serviço principal da Meta Ad Library
│   ├── components/
│   │   ├── ProductResearch.js       # Página principal com tabs
│   │   ├── MetaAdResearch.js       # Componente Meta Ad Research
│   │   ├── MetaAdFilters.js        # Filtros avançados
│   │   ├── ProductResearch.css     # Estilos da página principal
│   │   ├── MetaAdResearch.css      # Estilos do Meta Ad Research
│   │   └── MetaAdFilters.css       # Estilos dos filtros
└── IMPLEMENTATION_GUIDE.md         # Este guia
```

## 📋 Pré-requisitos da Meta

### 1. Configuração no Facebook Developers

1. **Acesse [developers.facebook.com](https://developers.facebook.com)**
   - Faça login com sua conta Facebook/Meta
   - Confirme sua identidade se solicitado

2. **Criar/Selecionar App**
   ```bash
   # Navegue para "Meus Apps" > "Criar App"
   # Selecione tipo: "Empresas"
   # Nome do app: "Product Research Tool"
   # Email de contato: seu@email.com
   ```

3. **Adicionar Ad Library API**
   - No painel do app, vá em "Produtos"
   - Adicione "Marketing API"
   - Configure as permissões necessárias

### 2. Obter Access Token

#### Opção A: Graph API Explorer (Recomendado para desenvolvimento)

1. Acesse [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecione seu app
3. Gere um token com as permissões:
   - `ads_read` (se disponível)
   - Ou use client credentials para Ad Library

#### Opção B: Client Credentials (Produção)

```bash
# Obter token via API
curl -X GET "https://graph.facebook.com/oauth/access_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "grant_type=client_credentials"
```

### 3. Verificar Permissões da Ad Library

```bash
# Teste básico da API
curl -X GET "https://graph.facebook.com/v18.0/ads_archive" \
  -d "access_token=YOUR_ACCESS_TOKEN" \
  -d "ad_reached_countries=PT" \
  -d "fields=page_id,page_name" \
  -d "limit=1"
```

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie/atualize o arquivo `.env`:

```env
# Meta Ad Library Configuration
REACT_APP_GRAPH_API_VERSION=v18.0
REACT_APP_META_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE

# Default Settings
REACT_APP_DEFAULT_COUNTRY=PT
REACT_APP_DEFAULT_LIMIT=50

# CORS Proxy (se necessário)
REACT_APP_CORS_PROXY_ENABLED=true
```

### 2. Exemplo .env Completo

```env
# Existing configuration
REACT_APP_FIREBASE_API_KEY=your_existing_config
REACT_APP_FB_ACCESS_TOKEN=your_existing_facebook_token
REACT_APP_FB_AD_ACCOUNT_ID=your_existing_account_id

# New Meta Ad Library Configuration
REACT_APP_GRAPH_API_VERSION=v18.0
REACT_APP_META_ACCESS_TOKEN=EAABwzLixnjYBO...
REACT_APP_DEFAULT_COUNTRY=PT
REACT_APP_DEFAULT_LIMIT=50
REACT_APP_CORS_PROXY_ENABLED=true

# Database (for future backend implementation)
DATABASE_URL="postgresql://user:password@localhost:5432/sheet_tools"

# Security
RATE_LIMIT_REQUESTS_PER_MINUTE=100
API_TIMEOUT_MS=30000
```

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
# O projeto já utiliza as dependências necessárias
npm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copie o exemplo e configure suas credenciais
cp .env.example .env
# Edite .env com suas credenciais Meta
```

### 3. Testar Conexão com Meta API

```bash
# Teste manual via curl
curl -X GET "https://graph.facebook.com/v18.0/ads_archive" \
  -d "access_token=YOUR_TOKEN" \
  -d "ad_reached_countries=PT" \
  -d "fields=page_id,page_name,ad_delivery_start_time" \
  -d "limit=5"

# Resultado esperado:
{
  "data": [
    {
      "page_id": "123456789",
      "page_name": "Example Page",
      "ad_delivery_start_time": "2024-01-01T00:00:00+0000",
      "id": "ad_archive_id_here"
    }
  ],
  "paging": {
    "cursors": {
      "before": "cursor_value",
      "after": "cursor_value"
    }
  }
}
```

## 🚀 Arranque Local

### 1. Iniciar o Projeto

```bash
# Desenvolvimento
npm start
# ou
yarn start

# Build para produção
npm run build
# ou
yarn build
```

### 2. Acessar a Interface

1. Abra o navegador em `http://localhost:3000`
2. Navegue para "Product Research"
3. Clique na tab "Ad Research (Meta)"
4. Configure seus filtros e comece a pesquisar

### 3. Verificação de Funcionamento

- ✅ **Tab Navigation**: Deve alternar entre "Product Research" e "Ad Research (Meta)"
- ✅ **Country Selection**: Deve mostrar países com flags e warnings para não-UE
- ✅ **Basic Search**: Pesquisa por termos deve funcionar
- ✅ **Advanced Filters**: Modal com todos os filtros obrigatórios
- ✅ **Results Display**: Cards de anúncios com preview e métricas
- ✅ **Pagination**: "Carregar Mais" deve funcionar com cursor
- ✅ **Export**: CSV download deve incluir todos os campos

## 🔍 Como Usar o Sistema

### 1. Navegação por Tabs

A página Product Research agora tem duas tabs:

- **Product Research**: Sistema original com Facebook Campaigns
- **Ad Research (Meta)**: Novo sistema com Meta Ad Library

### 2. Filtros Obrigatórios Implementados

#### ✅ País(es) de Entrega (OBRIGATÓRIO)
- Seleção múltipla de países ISO-2
- Warning automático para países fora UE/UK (apenas ads políticos)
- Validação obrigatória antes de pesquisar

#### ✅ Dias de Anúncios Ativos (OBRIGATÓRIO)
```javascript
// Computado automaticamente:
// start_time = ad_delivery_start_time
// end_time = ad_delivery_stop_time || new Date()
// days_active = Math.ceil((end_time - start_time) / (1000 * 60 * 60 * 24))

// Filtros:
days_active_min: number // Mínimo de dias
days_active_max: number // Máximo de dias
```

#### ✅ Reach Mínimo/Máximo (OBRIGATÓRIO)
- **UE/Reino Unido**: Usa `eu_total_reach`
- **Outros países**: Usa `impressions` range (político/social)
- Pós-filtro numérico no frontend
- Suporta tanto reach exato quanto ranges de impressões

#### ✅ Formato Criativo (OBRIGATÓRIO)
- **IMAGE**: Fotos/imagens estáticas
- **VIDEO**: Conteúdo em vídeo
- **CAROUSEL**: Múltiplas imagens/vídeos
- Detecção automática quando `media_type` não disponível

#### ✅ Estado Ativo (OBRIGATÓRIO)
- **ALL**: Todos os anúncios
- **ACTIVE**: Apenas ativos
- **INACTIVE**: Apenas inativos

#### ✅ Janela de Datas (OBRIGATÓRIO)
```javascript
ad_delivery_date_min: "YYYY-MM-DD" // Data início
ad_delivery_date_max: "YYYY-MM-DD" // Data fim
```

#### ✅ Pesquisa por Loja (OBRIGATÓRIO)
- **search_terms**: Busca textual no conteúdo
- **search_page_ids**: ID específico da página
- Fallback manual para ID quando busca por nome não disponível

#### ✅ Plataformas (Opcional)
- Facebook, Instagram, Messenger, WhatsApp
- Filtro múltiplo com cores distintas

#### ✅ Línguas (Opcional)
- Detecção automática via `content_languages`
- Suporte a línguas comuns (PT, EN, ES, FR, DE, IT, NL)

### 3. Funcionalidades Avançadas

#### Paginação com Cursor
```javascript
// Implementação automática de paging
// Usa paging.cursors.after da Graph API
// Load more infinito com progress
```

#### Rate Limit & Backoff
```javascript
// Retry automático com backoff exponencial
// Respeita header Retry-After
// Máximo 3 tentativas por request
```

#### Export CSV
- Download de todos os resultados carregados
- Campos: ID, Página, Datas, Dias Ativos, Tipo, Plataformas, Países, Reach, URL

## 🌍 Limitações e Regiões

### Países UE/Reino Unido (Todos os Anúncios)
```javascript
const EU_UK_COUNTRIES = [
  'AD', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH'
];
```
- ✅ Acesso a todos os tipos de anúncios
- ✅ Campo `eu_total_reach` disponível
- ✅ Dados mais completos

### Outros Países (Apenas Político/Social)
- ⚠️ Apenas `POLITICAL_AND_ISSUE_ADS`
- ⚠️ Campo `impressions` em ranges (ex: "1000-5000")
- ⚠️ Dados limitados por regulamentação

### Como Interpretar Reach/Impressions

```javascript
// UE/Reino Unido
if (ad.eu_total_reach) {
  reach_estimated = parseInt(ad.eu_total_reach);
}

// Outros países (político/social)
if (ad.impressions && ad.impressions.includes('-')) {
  const [lower, upper] = ad.impressions.split('-').map(v => parseInt(v));
  reach_estimated = Math.floor((lower + upper) / 2); // Média
  impressions_lower = lower;
  impressions_upper = upper;
}
```

## 📈 Rate Limits e Estratégia de Backoff

### Limites da Meta Ad Library API

- **Rate Limit**: Varia por app e uso
- **Throttling**: HTTP 429 ou error codes 4/17
- **Quota**: Limite diário/hora pode aplicar

### Estratégia Implementada

```javascript
// Backoff exponencial com retry
async makeRequestWithBackoff(url, params, attempt = 1) {
  try {
    return await corsProxy.makeProxiedRequest(url, { params });
  } catch (error) {
    if (isRateLimited(error) && attempt <= 3) {
      const backoff = getBackoffTime(error, attempt);
      await sleep(backoff);
      return this.makeRequestWithBackoff(url, params, attempt + 1);
    }
    throw error;
  }
}

// Headers importantes:
// Retry-After: seconds to wait
// X-App-Usage: usage metrics (se disponível)
```

### Monitorização de Rate Limits

```javascript
// O serviço automaticamente:
// 1. Detecta 429 status codes
// 2. Lê header Retry-After
// 3. Aplica backoff exponencial: 1s, 2s, 4s
// 4. Máximo 3 retries por request
// 5. Logs estruturados para monitoring
```

## 🔒 Segurança e Boas Práticas

### 1. Gestão de Tokens

```javascript
// ❌ NUNCA fazer:
const ACCESS_TOKEN = "EAABwzLixnjYBO..."; // Hard-coded

// ✅ SEMPRE usar:
const ACCESS_TOKEN = process.env.REACT_APP_META_ACCESS_TOKEN;

// Validação de token
if (!ACCESS_TOKEN) {
  throw new Error('Meta Access Token não configurado');
}
```

### 2. Sanitização de Inputs

```javascript
// Todos os inputs são sanitizados:
search_terms: encodeURIComponent(userInput)
search_page_ids: validatePageId(pageId) // Apenas números
ad_reached_countries: validateCountryCodes(countries) // ISO-2
```

### 3. Rate Limiting Interno

```javascript
// Limite interno de requests por minuto
const REQUEST_LIMIT_PER_MINUTE = 100;
const requestQueue = new Map();

// Throttling automático
if (requestQueue.size > REQUEST_LIMIT_PER_MINUTE) {
  await sleep(60000 / REQUEST_LIMIT_PER_MINUTE);
}
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Error: "Access Token Inválido"
```bash
# Verificar token:
curl -X GET "https://graph.facebook.com/v18.0/me" \
  -d "access_token=YOUR_TOKEN"

# Se inválido:
# 1. Gerar novo token no Graph API Explorer
# 2. Verificar permissões do app
# 3. Confirmar que app tem acesso à Ad Library
```

#### 2. Error: "País não suportado"
```javascript
// Verificar se país está na lista suportada:
const supportedCountries = ['PT', 'BR', 'ES', 'US', 'GB', 'FR', 'DE', 'IT'];
if (!supportedCountries.includes(countryCode)) {
  console.error('País não suportado pela configuração atual');
}
```

#### 3. Error: "Rate Limited"
```javascript
// Rate limit detectado - aguardar:
// O sistema automaticamente:
// 1. Detecta HTTP 429
// 2. Lê Retry-After header
// 3. Aguarda tempo especificado
// 4. Retry automático (máx 3x)
```

#### 4. Error: "CORS"
```javascript
// Problema de CORS:
// 1. Verificar se corsProxy está funcionando
// 2. Configurar proxy no package.json se necessário
// 3. Em produção, usar backend proxy
```

### Debug Mode

```javascript
// Ativar logs detalhados:
localStorage.setItem('META_AD_DEBUG', 'true');

// Ver requests na consola:
// - URL completa da request
// - Parâmetros enviados  
// - Resposta da API
// - Tempos de resposta
// - Rate limit info
```

### Logs Estruturados

```javascript
// Exemplo de logs gerados:
console.log('Meta Ad Library Request', {
  url: 'https://graph.facebook.com/v18.0/ads_archive',
  params: { ad_reached_countries: 'PT', limit: 50 },
  timestamp: '2024-01-15T10:30:00Z',
  attempt: 1
});

console.log('Meta Ad Library Response', {
  status: 200,
  count: 25,
  has_next_page: true,
  response_time_ms: 1250,
  timestamp: '2024-01-15T10:30:01.250Z'
});
```

## ✅ Checklist de Aceitação

### Funcionalidades Core

- [ ] **Tab Navigation**: Alterna entre Product Research e Meta Ad Research
- [ ] **Country Selection**: Seleção múltipla obrigatória com warnings UE/não-UE
- [ ] **Basic Search**: Pesquisa por termos e page_id funcionando
- [ ] **Advanced Filters**: Modal com todos os filtros obrigatórios

### Filtros Obrigatórios

- [ ] **Dias Ativos**: min/max filtram corretamente (inclui stop_time = null)
- [ ] **Reach/Impressions**: Funciona para EU reach e impressions ranges  
- [ ] **Formato Criativo**: Vídeo/Foto/Carousel filtra corretamente
- [ ] **Estado Ativo**: ALL/ACTIVE/INACTIVE funciona
- [ ] **Datas**: ad_delivery_date_min/max filtram período
- [ ] **Pesquisa Loja**: Termos e page_id funcionam
- [ ] **Plataformas**: Facebook/Instagram/Messenger/WhatsApp (opcional)
- [ ] **Línguas**: content_languages funciona (opcional)

### UX/UI

- [ ] **Results Display**: Cards com preview, métricas, timeline
- [ ] **Pagination**: Cursor-based infinita com "Load More"
- [ ] **Export CSV**: Download com todos os campos
- [ ] **Loading States**: Spinners e progress indicators
- [ ] **Error Handling**: Mensagens claras de erro
- [ ] **Mobile Responsive**: Funciona em mobile/tablet/desktop

### Performance e Confiabilidade

- [ ] **Rate Limiting**: Backoff automático em 429/4/17 errors
- [ ] **Error Recovery**: Retry com exponential backoff
- [ ] **CORS Handling**: Proxy funciona corretamente
- [ ] **Memory Usage**: Não vaza memória em sessões longas
- [ ] **Network Resilience**: Funciona com conexões instáveis

### Segurança

- [ ] **Token Validation**: Verifica token antes de usar
- [ ] **Input Sanitization**: Todos os inputs sanitizados
- [ ] **Rate Limiting**: Controlo interno de requests
- [ ] **Error Disclosure**: Não expõe informações sensíveis

## 🚀 Deploy e Produção

### 1. Build Otimizado

```bash
# Build para produção
npm run build

# Verificar bundle size
npm run analyze # (se configurado)
```

### 2. Configuração de Produção

```env
# Production .env
REACT_APP_GRAPH_API_VERSION=v18.0
REACT_APP_META_ACCESS_TOKEN=production_token_here
REACT_APP_DEFAULT_COUNTRY=PT
REACT_APP_CORS_PROXY_ENABLED=false # Use backend proxy
```

### 3. Backend Proxy (Recomendado)

Para produção, implemente um backend proxy para evitar CORS:

```javascript
// Express.js example
app.get('/api/meta-ads-proxy', async (req, res) => {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/ads_archive', {
      params: {
        access_token: process.env.META_ACCESS_TOKEN,
        ...req.query
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
```

### 4. Monitoring

```javascript
// Métricas importantes para monitorizar:
// - Request success rate (>95%)
// - Response time p95 (<2s)
// - Rate limit hits (<1% of requests)
// - Error rate por país/filtros
// - Usage patterns por utilizador
```

## 📞 Suporte

### Documentação Oficial

- [Meta Ad Library API](https://developers.facebook.com/docs/marketing-api/ad-library-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Ad Archive Reference](https://developers.facebook.com/docs/marketing-api/reference/archived-ad/)

### Debugging Tools

- **Graph API Explorer**: Testar queries manualmente
- **Facebook Debugger**: Verificar permissões e tokens
- **Browser DevTools**: Network tab para inspecionar requests

### Issues Conhecidos

1. **Pesquisa de Páginas**: Meta API pública não permite busca livre por nome de página
2. **Rate Limits**: Variam por app e podem mudar sem aviso
3. **Dados Regionais**: Disponibilidade varia significativamente por país
4. **CORS**: Requer proxy ou configuração especial em produção

---

## 🎯 Conclusão

Este sistema fornece uma integração completa e robusta com a Meta Ad Library API, implementando todos os filtros obrigatórios e seguindo as melhores práticas de desenvolvimento.

A implementação é production-ready, com:

- ✅ Todos os filtros obrigatórios implementados
- ✅ Rate limiting e error handling robusto
- ✅ UI/UX integrada com design system existente
- ✅ Documentação completa e testes manuais
- ✅ Considerações de segurança e performance

Para suporte adicional ou questões específicas, consulte a documentação oficial da Meta ou os logs do sistema para debugging detalhado.