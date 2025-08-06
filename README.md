# Facebook Ads Campaign Manager

Uma plataforma interativa para gestão inteligente de campanhas Facebook Ads com decisões automáticas baseadas em performance.

## 🚀 Funcionalidades

### 🔗 Sistema OAuth Multi-usuário (NOVO!)
- ✅ **Login OAuth do Facebook** - Sistema profissional igual ao TrackBee
- ✅ **Múltiplos usuários** - Cada pessoa conecta sua própria conta
- ✅ **Gerenciador de contas** - Interface para gerenciar usuários conectados
- ✅ **Importação automática** - Campanhas sincronizadas automaticamente
- ✅ **Regras aplicadas** aos dados reais do Facebook Ads

### Gestão de Campanhas
- ✅ Criar e editar campanhas manualmente
- ✅ Configurar produto, preço e COGS
- ✅ Definir tipo de mercado (CPC Baixo/Alto)
- ✅ Definir orçamentos iniciais e atuais

### Análise Automática
- ✅ Cálculos automáticos de todas as métricas:
  - ROAS (Return on Ad Spend)
  - BER (Break Even Rate)
  - CPC (Cost per Click)
  - CPA (Cost per Acquisition)
  - CTR (Click Through Rate)
  - Taxa de Conversão
  - Profit Margin (em € e %)

### Decisões Automáticas

#### 🎯 NOVA REGRA PRIORITÁRIA - Análise de Profit Margin
**Aplicada desde o Dia 1:**
- **Profit Margin Negativo** = **KILL** (imediato)
- **Profit Margin > 20%** = **SCALE** (imediato)
- **Profit Margin Positivo (0-20%)** = **MAINTAIN** + aplicar regras abaixo

#### Mercados CPC Baixo (< 0.7€)
**Exemplos:** Espanha, Itália, França, Portugal, Grécia

**Dia 1:**
- 10€ spend + CPC > 1€ + 0 sales + 0 ATC = **KILL**
- 20€ spend + 0 sales + <2 ATC = **KILL**
- 25€ spend + 0 sales = **KILL**
- Se pelo menos 1 venda → deixar rodar o dia todo

**Dia 2:**
- 10€ spend + 0 sales + <2 ATC = **KILL**
- 25€ spend + 0 sales = **KILL**

#### Mercados CPC Alto (> 0.7€)
**Exemplos:** Reino Unido, Alemanha, Suíça, Dinamarca

**Dia 1:**
- 10€ spend + CPC > 1€ + 0 sales + 0 ATC = **KILL**
- 20€ spend + 0 sales + <2 ATC = **KILL**
- 30€ spend + 0 sales = **KILL**
- Se pelo menos 1 venda → deixar rodar o dia todo

**Dia 2:**
- 15€ spend + 0 sales + <2 ATC = **KILL**
- 25€ spend + 0 sales = **KILL**

#### Regras de Scaling/Descaling (48h+)
**Orçamentos de Scaling:** 50€ → 70€ → 100€ → 140€ → 200€ → 300€ → 400€ → +20% a partir daqui

**Scaling (Dia 3+):**
- Profit margin médio > 20% E ambos os dias > 15% = **SCALE**

**Descaling:**
- Profit margin médio ≤ 0% = **DESCALE** para orçamento anterior
- Se já está em 50€ e continua em loss por 48h = **KILL**

## 🛠️ Instalação

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar servidor de desenvolvimento
npm start
```

## 📊 Como Usar

### 🔗 Integração Facebook Ads
1. **Conectar:** Clique em "Conectar Facebook Ads" no dashboard
2. **Configurar:** Insira Access Token e ID da conta (demonstração aceita qualquer valor)
3. **Sincronizar:** Veja suas campanhas sendo importadas automaticamente
4. **Configurar:** Defina preços e COGS para ativar regras automáticas

### 📝 Gestão Manual  
1. **Primeira vez:** Clique em "Carregar Dados de Exemplo" para ver exemplos funcionais
2. **Criar Campanha:** Clique em "Nova Campanha" e preencha os dados
3. **Adicionar Dias:** Clique no botão "+" na tabela para adicionar dados diários
4. **Visualizar Análise:** Clique na linha da campanha para expandir e ver detalhes

## 🎯 Métricas Calculadas Automaticamente

- **Receita:** Vendas × Preço do Produto
- **COGS:** Unidades Vendidas × Custo do Produto
- **Lucro:** Receita - Gasto - COGS
- **Profit Margin:** (Lucro / Receita) × 100
- **ROAS:** Receita / Gasto
- **BER:** (Gasto / Receita) × 100
- **CPC:** Gasto / Cliques
- **CPA:** Gasto / Vendas
- **CTR:** (Cliques / Impressões) × 100
- **Taxa Conversão:** (Vendas / Cliques) × 100

## 🎨 Interface

- **Dashboard:** Visão geral com estatísticas totais
- **Tabela Interativa:** Lista todas as campanhas com métricas
- **Modais:** Para criar/editar campanhas e adicionar dados diários
- **Badges de Status:** Indicam a decisão automática (KILL/SCALE/MAINTAIN/DESCALE)
- **Filtros:** Por tipo de mercado (CPC Baixo/Alto)
- **Dados Expansíveis:** Clique numa campanha para ver dados diários detalhados

## 🔧 Configuração

### Instalação
```bash
cd sheet-tools
npm install
npm start
```

### Facebook OAuth Setup
Para permitir login de múltiplos usuários:

1. **Criar Facebook App:**
   - Vá para [Facebook Developer Console](https://developers.facebook.com/apps/)
   - Crie nova app "Business"
   - Adicione "Marketing API" e "Facebook Login"

2. **Configurar OAuth:**
   - Valid OAuth Redirect URIs: `http://localhost:3000/facebook-callback.html`
   - Deauthorize Callback URL: `http://localhost:3000/api/facebook/deauth`

3. **Configurar variáveis de ambiente:**
   ```bash
   # Copie env.example para .env
   cp env.example .env
   
   # Configure seu Facebook App ID
   REACT_APP_FACEBOOK_APP_ID=seu_app_id_aqui
   ```

4. **Implementar backend:**
   - Veja `FACEBOOK_OAUTH_SETUP.md` para instruções completas
   - Backend necessário para trocar códigos OAuth por tokens

## 🔧 Tecnologias

- **React 19** - Framework principal
- **Facebook OAuth** - Login seguro multi-usuário
- **Facebook Marketing API** - Integração com campanhas reais
- **Lucide React** - Ícones
- **CSS Custom** - Estilização responsiva
- **LocalStorage** - Persistência de dados local

## 📱 Responsivo

A interface adapta-se automaticamente a diferentes tamanhos de ecrã:
- Desktop: Layout completo com todas as colunas
- Tablet: Layout adaptado com colunas reorganizadas
- Mobile: Layout em coluna única com navegação otimizada

## 🚨 Alertas e Decisões

O sistema fornece explicações detalhadas para cada decisão:
- **Razão da Decisão:** Explica porque a ação foi recomendada
- **Novo Orçamento:** Sugere o próximo orçamento quando aplicável
- **Regras Aplicadas:** Mostra quais regras foram ativadas

## 💾 Dados

Os dados são salvos automaticamente no localStorage do navegador. Para limpar todos os dados, use as ferramentas de desenvolvedor do navegador ou crie uma nova campanha e delete as antigas.

## 🎯 Casos de Uso

Ideal para:
- **Media Buyers** que gerem múltiplas campanhas
- **Agências de Marketing Digital**
- **E-commerce** com campanhas Facebook Ads
- **Freelancers** que precisam de análise rápida
- **Equipas** que querem padronizar decisões

---

**Nota:** Esta ferramenta implementa as regras específicas fornecidas e calcula automaticamente todas as métricas necessárias para tomada de decisão em campanhas Facebook Ads.