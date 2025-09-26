# Estrutura do Daily ROAS - Integração de Dados

## 📊 Visão Geral

O Daily ROAS agora combina dados de **duas fontes principais** para fornecer uma análise consolidada e completa:

1. **Campaigns** - Dados de performance de campanhas publicitárias
2. **Quotation Sheet** - Dados de produtos, custos e vendas

## 🔄 Fluxo de Dados

### 1. **Fonte: Campaigns**
**Dados extraídos:**
- ✅ **Total gasto da campanha** (`totalSpend`)
- ✅ **CPC da campanha** (`cpc`)
- ✅ **Link do produto** (`productLink`)
- ✅ **Clicks** (`clicks`)
- ✅ **Impressions** (`impressions`)
- ✅ **Market Type** (`marketType`)

**Origem:** `userService.getUserData('campaigns')`

### 2. **Fonte: Quotation Sheet**
**Dados extraídos:**
- ✅ **COG (Cost of Goods)** (`cogs`)
- ✅ **Preço do produto** (`price`)
- ✅ **Unidades vendidas** (`unitsSold`)
- ✅ **Número de vendas** (`numberOfSales`)
- ✅ **Total de vendas** (`totalSales`)
- ✅ **Shipping time** (`shippingTime`)
- ✅ **Stock status** (`inStock`)

**Origem:** 
- `productService.getProducts()` - Tabela `products`
- `salesService.getSalesByDate()` - Tabela `vendas`

## 🧮 Cálculos Consolidados

### **Métricas Derivadas:**
```javascript
// Cálculos automáticos
totalCog = cogs * unitsSold
storeValue = price * unitsSold
marginBruta = price - cogs
marginEur = (price - cogs) * unitsSold
marginPct = ((price - cogs) / price) * 100
roas = totalSpend > 0 ? (storeValue / totalSpend) : 0
cpa = numberOfSales > 0 ? (totalSpend / numberOfSales) : 0
ber = totalSpend > 0 ? (totalCog / totalSpend) : 0
```

### **Completude dos Dados:**
- **100%**: Tem dados de Campaigns + Quotation
- **50%**: Tem apenas dados de Campaigns OU Quotation
- **0%**: Não tem dados de nenhuma fonte

## 🎯 Interface do Usuário

### **Botão "Dados Consolidados"**
- 🔄 **Localização**: Header da página Daily ROAS
- ⚡ **Função**: Carrega e combina dados de ambas as fontes
- 🎨 **Estados**: Loading com animação de spinning
- 📊 **Resultado**: Atualiza produtos e resumo automaticamente

### **Indicadores Visuais nos Cards**

#### **Badges de Fonte:**
- 🔵 **"Campaigns"** - Dados de campanhas disponíveis
- 🟢 **"Quotation"** - Dados de quotation disponíveis

#### **Badge de Completude:**
- ✅ **"100%"** - Dados completos (verde)
- ⚠️ **"50%"** - Dados parciais (amarelo)

## 📋 Estrutura de Dados Consolidados

```javascript
{
  // Identificação
  productName: "Nome do Produto",
  date: "2025-01-15",
  
  // Dados de Campaigns
  totalSpend: 150.00,
  cpc: 0.45,
  clicks: 333,
  impressions: 10000,
  productLink: "https://loja.com/produto",
  marketType: "low",
  
  // Dados de Quotation
  price: 29.99,
  cogs: 12.50,
  unitsSold: 25,
  numberOfSales: 20,
  totalSales: 599.75,
  shippingTime: "2-3 dias",
  inStock: true,
  
  // Métricas Calculadas
  totalCog: 312.50,
  storeValue: 749.75,
  marginBruta: 17.49,
  marginEur: 437.25,
  marginPct: 58.35,
  roas: 4.99,
  cpa: 7.50,
  ber: 2.08,
  
  // Status de Dados
  hasCampaignData: true,
  hasQuotationData: true,
  dataCompleteness: {
    percentage: 100,
    isComplete: true,
    missingFields: []
  },
  
  // Metadados
  source: "integrated",
  sources: ["campaigns", "quotation"]
}
```

## 🔧 Serviços Implementados

### **`dailyRoasIntegrationService.js`**

#### **Métodos Principais:**
- `getConsolidatedDailyRoas(date)` - Busca dados consolidados
- `getCampaignsData(date)` - Extrai dados de campanhas
- `getQuotationData(date)` - Extrai dados de quotation
- `consolidateDataByProduct()` - Combina dados por produto
- `saveConsolidatedData()` - Salva dados na base de dados

#### **Funcionalidades:**
- ✅ **Busca Paralela**: Dados de ambas as fontes em paralelo
- ✅ **Consolidação Inteligente**: Combina dados por nome do produto
- ✅ **Cálculos Automáticos**: Métricas derivadas calculadas automaticamente
- ✅ **Validação de Completude**: Identifica dados faltantes
- ✅ **Persistência**: Salva dados consolidados na base de dados

## 📊 Resumo Consolidado

### **Métricas Agregadas:**
```javascript
{
  totalSpend: 0,        // Soma de todos os gastos
  totalRevenue: 0,      // Soma de todas as receitas
  totalMargin: 0,       // Soma de todas as margens
  totalUnitsSold: 0,    // Total de unidades vendidas
  totalSales: 0,        // Total de vendas
  productCount: 0,      // Número de produtos
  campaignsCount: 0,    // Produtos com dados de campanhas
  quotationCount: 0,    // Produtos com dados de quotation
  completeDataCount: 0, // Produtos com dados completos
  weightedRoas: 0,      // ROAS ponderado
  averageMargin: 0,     // Margem média
  dataCompleteness: 0   // Percentual de completude geral
}
```

## 🎨 Melhorias na Interface

### **Header Atualizado:**
- ✅ **Botão "Dados Consolidados"** com loading state
- ✅ **Animações** de spinning durante carregamento
- ✅ **Feedback visual** com toasts informativos

### **Cards de Produtos:**
- ✅ **Indicadores de fonte** (Campaigns/Quotation)
- ✅ **Badge de completude** (100%/50%)
- ✅ **Layout responsivo** para múltiplos badges
- ✅ **Tooltips informativos** nos badges

### **Estilos CSS:**
- ✅ **Cores diferenciadas** para cada fonte
- ✅ **Animações suaves** para transições
- ✅ **Design consistente** com o sistema de design

## 🚀 Como Usar

### **1. Carregar Dados Consolidados:**
```javascript
// No componente DailyRoasPageNew
const loadConsolidatedData = async () => {
  const result = await dailyRoasIntegrationService.getConsolidatedDailyRoas(selectedDate);
  // Dados são automaticamente convertidos e exibidos
};
```

### **2. Verificar Completude:**
```javascript
// Cada produto tem informações de completude
if (product.dataCompleteness.isComplete) {
  // Dados 100% completos
} else {
  // Dados parciais - mostrar campos faltantes
  console.log(product.dataCompleteness.missingFields);
}
```

### **3. Salvar Dados Consolidados:**
```javascript
// Salvar na base de dados
await dailyRoasIntegrationService.saveConsolidatedData(consolidatedData, date);
```

## ✅ Benefícios da Nova Estrutura

1. **🔄 Integração Automática**: Combina dados de múltiplas fontes
2. **📊 Visão Completa**: ROAS consolidado com todos os dados
3. **🎯 Identificação de Lacunas**: Mostra quais dados estão faltando
4. **⚡ Performance**: Busca paralela de dados
5. **🎨 UX Melhorada**: Indicadores visuais claros
6. **🔧 Flexibilidade**: Funciona com dados parciais
7. **📈 Análise Avançada**: Métricas derivadas calculadas automaticamente

## 🎯 Status

**✅ IMPLEMENTADO COMPLETAMENTE** - A estrutura do Daily ROAS está totalmente funcional e integra dados de Campaigns e Quotation sheet conforme especificado.
