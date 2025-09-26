# Daily ROAS - Sincronização Automática

## 🚀 Visão Geral

O Daily ROAS agora funciona **automaticamente** - quando um produto é adicionado na Quotation sheet, ele aparece automaticamente no Daily ROAS com todos os dados preenchidos.

## ⚡ Como Funciona a Sincronização Automática

### **1. Detecção Automática**
- ✅ **Ao abrir o Daily ROAS**: Sistema verifica automaticamente produtos da Quotation sheet
- ✅ **Mudança de data**: Sincronização automática quando a data é alterada
- ✅ **Verificação inteligente**: Só adiciona produtos que ainda não existem no Daily ROAS

### **2. Preenchimento Automático de Dados**
Quando um produto da Quotation sheet é detectado, os seguintes dados são preenchidos automaticamente:

#### **Dados da Quotation Sheet:**
- ✅ **Nome do produto** (`productName`)
- ✅ **Preço** (`price`)
- ✅ **Unidades vendidas** (`unitsSold`) - calculado das vendas
- ✅ **Número de vendas** (`purchases`) - contagem de vendas
- ✅ **Valor da loja** (`storeValue`) - preço × unidades vendidas
- ✅ **Margem bruta** (`marginBruta`) - preço (assumindo COG = 0)
- ✅ **Margem em EUR** (`marginEur`) - preço × unidades vendidas
- ✅ **Percentagem de margem** (`marginPct`) - 100% (assumindo COG = 0)

#### **Dados que ficam vazios (para preenchimento posterior):**
- ⏳ **COG** (`cog`) - 0 (será preenchido manualmente ou via campaigns)
- ⏳ **Total gasto** (`totalSpend`) - 0 (será preenchido via campaigns)
- ⏳ **CPC** (`cpc`) - 0 (será preenchido via campaigns)
- ⏳ **ATC** (`atc`) - 0 (será preenchido via campaigns)
- ⏳ **ROAS** (`roas`) - 0 (será calculado quando houver spend)
- ⏳ **CPA** (`cpa`) - 0 (será calculado quando houver spend)
- ⏳ **BER** (`ber`) - 0 (será calculado quando houver spend)

## 🎯 Interface do Usuário

### **Indicador de Sincronização Automática**
- 🟢 **"Auto-sync ativo"** - Mostra que a sincronização está funcionando
- 💫 **Animação de pulso** - Indicador visual de atividade
- 📍 **Localização**: Header da página Daily ROAS

### **Badges nos Cards dos Produtos**

#### **Badge "Auto" (Roxo):**
- 🟣 **Cor**: Roxo com animação de pulso
- 🔄 **Ícone**: RefreshCw
- 📝 **Tooltip**: "Sincronizado automaticamente da Quotation sheet"
- 🎯 **Significado**: Produto foi adicionado automaticamente

#### **Badge "Quotation" (Verde):**
- 🟢 **Cor**: Verde
- 📊 **Ícone**: FileSpreadsheet
- 📝 **Tooltip**: "Dados de Quotation"
- 🎯 **Significado**: Tem dados da Quotation sheet

#### **Badge de Completude:**
- ✅ **"50%"** - Dados parciais (amarelo)
- ⚠️ **Significado**: Tem dados de Quotation, falta dados de Campaigns

## 🔄 Fluxo de Sincronização

### **1. Abertura da Página Daily ROAS:**
```javascript
// Automático ao carregar a página
useEffect(() => {
  loadDataForDate(selectedDate);
  loadQuotationProductsAutomatically(); // ← Sincronização automática
}, [selectedDate]);
```

### **2. Detecção de Novos Produtos:**
```javascript
// Verifica produtos da Quotation sheet
const quotationProducts = await dailyRoasIntegrationService.getQuotationProductsForDailyRoas(selectedDate);

// Filtra apenas produtos novos
const newProducts = quotationProducts.filter(qp => 
  !existingProductNames.includes(qp.productName.toLowerCase())
);
```

### **3. Adição Automática:**
```javascript
// Adiciona novos produtos ao estado
setProducts(prevProducts => [...prevProducts, ...newProducts]);

// Salva automaticamente na base de dados
for (const product of newProducts) {
  await dailyRoasService.saveProduct(product);
}
```

### **4. Feedback ao Usuário:**
```javascript
// Toast de sucesso
toast.success(`${newProducts.length} produtos da Quotation sheet adicionados automaticamente!`);

// Recalcula decisões automaticamente
await recalculateDecisions();
```

## 📊 Estrutura de Dados Automática

### **Produto Sincronizado Automaticamente:**
```javascript
{
  id: "quotation-{productId}-{date}",
  productName: "Nome do Produto",
  price: 29.99,
  cog: 0, // ← Vazio, para preenchimento posterior
  unitsSold: 25, // ← Calculado das vendas
  totalSpend: 0, // ← Vazio, para preenchimento posterior
  cpc: 0, // ← Vazio, para preenchimento posterior
  atc: 0, // ← Vazio, para preenchimento posterior
  purchases: 20, // ← Contagem de vendas
  totalCog: 0, // ← Calculado automaticamente
  storeValue: 749.75, // ← Calculado automaticamente
  marginBruta: 29.99, // ← Preço (COG = 0)
  marginEur: 749.75, // ← Calculado automaticamente
  marginPct: 100, // ← 100% (COG = 0)
  roas: 0, // ← Será calculado quando houver spend
  cpa: 0, // ← Será calculado quando houver spend
  ber: 0, // ← Será calculado quando houver spend
  date: "2025-01-15",
  source: "quotation-auto", // ← Identifica como sincronizado automaticamente
  hasCampaignData: false,
  hasQuotationData: true,
  dataCompleteness: {
    percentage: 50,
    isComplete: false,
    missingFields: ["Dados de Campanhas"]
  }
}
```

## 🎨 Indicadores Visuais

### **Header da Página:**
- 🟢 **"Auto-sync ativo"** com animação de pulso
- 🔄 **Botão "Dados Consolidados"** para sincronização manual

### **Cards dos Produtos:**
- 🟣 **Badge "Auto"** - Produto sincronizado automaticamente
- 🟢 **Badge "Quotation"** - Tem dados da Quotation sheet
- ⚠️ **Badge "50%"** - Dados parciais (amarelo)

### **Animações:**
- 💫 **Pulso no indicador** - Mostra atividade de sincronização
- 🔄 **Pulso no badge "Auto"** - Destaque para produtos automáticos
- ⚡ **Transições suaves** - Animações de entrada dos novos produtos

## ✅ Benefícios da Sincronização Automática

1. **🔄 Automático**: Não precisa adicionar produtos manualmente
2. **📊 Dados Preenchidos**: Informações da Quotation sheet já estão lá
3. **🎯 Eficiência**: Economiza tempo e evita erros de digitação
4. **👁️ Visibilidade**: Indicadores claros de origem dos dados
5. **🔗 Integração**: Conecta automaticamente as duas páginas
6. **📈 Completude**: Mostra claramente quais dados estão faltando
7. **🎨 UX Melhorada**: Interface intuitiva e informativa

## 🚀 Como Usar

### **Para o Usuário:**
1. **Adicionar produto na Quotation sheet** ✅
2. **Ir para o Daily ROAS** ✅
3. **Produto aparece automaticamente** ✅
4. **Dados já estão preenchidos** ✅
5. **Completar dados de campanhas** (opcional)

### **Indicadores a Observar:**
- 🟢 **"Auto-sync ativo"** - Sincronização funcionando
- 🟣 **Badge "Auto"** - Produto foi sincronizado automaticamente
- ⚠️ **Badge "50%"** - Dados parciais, falta completar com campanhas

## 🎯 Status

**✅ IMPLEMENTADO COMPLETAMENTE** - A sincronização automática entre Quotation sheet e Daily ROAS está totalmente funcional. Produtos aparecem automaticamente com dados preenchidos! 🎉
