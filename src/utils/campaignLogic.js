// Lógica de decisão automática para campanhas Facebook Ads

export const calculateMetrics = (days, productPrice, cogs) => {
  if (!days || days.length === 0) return {};

  const totals = days.reduce((acc, day) => ({
    spend: acc.spend + day.spend,
    sales: acc.sales + day.sales,
    atc: acc.atc + day.atc,
    clicks: acc.clicks + day.clicks,
    impressions: acc.impressions + (day.impressions || 0),
    unitsSold: acc.unitsSold + (day.unitsSold || day.sales)
  }), { spend: 0, sales: 0, atc: 0, clicks: 0, impressions: 0, unitsSold: 0 });

  const totalRevenue = totals.sales * productPrice;
  const totalCogs = totals.unitsSold * cogs;
  const totalProfit = totalRevenue - totals.spend - totalCogs;
  
  return {
    totalSpend: totals.spend,
    totalSales: totals.sales,
    totalRevenue,
    totalCogs,
    totalProfit,
    overallProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0,
    averageCPC: totals.clicks > 0 ? (totals.spend / totals.clicks) : 0,
    overallROAS: totals.spend > 0 ? (totalRevenue / totals.spend) : 0,
    overallBER: totals.spend > 0 ? (totals.spend / totalRevenue * 100) : 0,
    averageCPA: totals.sales > 0 ? (totals.spend / totals.sales) : 0,
    overallCTR: totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0,
    overallConversionRate: totals.clicks > 0 ? (totals.sales / totals.clicks * 100) : 0
  };
};

export const calculateDecision = (campaign, days, metrics) => {
  if (!days || days.length === 0) {
    return {
      action: 'MAINTAIN',
      reason: 'Nenhum dado disponível ainda.',
      newBudget: null
    };
  }

  const currentDay = days.length;
  const lastDay = days[days.length - 1];
  const isLowCPCMarket = campaign.marketType === 'low';

  // Regras para o primeiro dia
  if (currentDay === 1) {
    return evaluateDay1Rules(lastDay, campaign, isLowCPCMarket);
  }

  // Regras para o segundo dia
  if (currentDay === 2) {
    return evaluateDay2Rules(lastDay, campaign, isLowCPCMarket);
  }

  // Regras de scaling/descaling para 48h+ (dia 3 em diante)
  if (currentDay >= 3) {
    return evaluateScalingRules(campaign, days, metrics);
  }

  return {
    action: 'MAINTAIN',
    reason: 'Aguardando mais dados para análise.',
    newBudget: null
  };
};

const evaluateDay1Rules = (day, campaign, isLowCPCMarket) => {
  const cpc = day.clicks > 0 ? (day.spend / day.clicks) : 0;
  
  // Calcular profit margin do dia 1
  const revenue = day.sales * campaign.productPrice;
  const cogs = (day.unitsSold || day.sales) * campaign.cogs;
  const profit = revenue - day.spend - cogs;
  const profitMargin = revenue > 0 ? (profit / revenue * 100) : (profit < 0 ? -100 : 0);
  
  // NOVA REGRA: Se profit margin do dia 1 for negativa = KILL
  if (profitMargin < 0) {
    return {
      action: 'KILL',
      reason: `Dia 1: Profit margin negativa (${profitMargin.toFixed(2)}%). Campanha inviável desde o primeiro dia.`,
      newBudget: null
    };
  }
  
  // NOVA REGRA: Se profit margin do dia 1 for > 20% = SCALE imediatamente
  if (profitMargin > 20) {
    const currentBudget = campaign.currentBudget || campaign.initialBudget;
    const scalingBudgets = [50, 70, 100, 140, 200, 300, 400];
    const currentIndex = scalingBudgets.findIndex(budget => budget >= currentBudget);
    
    if (currentIndex < scalingBudgets.length - 1) {
      const newBudget = scalingBudgets[currentIndex + 1];
      return {
        action: 'SCALE',
        reason: `Dia 1: Profit margin excelente (${profitMargin.toFixed(2)}% > 20%). Scaling imediato de €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    } else {
      const newBudget = Math.round(currentBudget * 1.2);
      return {
        action: 'SCALE',
        reason: `Dia 1: Profit margin excelente (${profitMargin.toFixed(2)}% > 20%). Scaling 20%: €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    }
  }
  
  // Regra universal: 10€ spend + CPC > 1€ + 0 sales + 0 ATC = KILL
  if (day.spend >= 10 && cpc > 1 && day.sales === 0 && day.atc === 0) {
    return {
      action: 'KILL',
      reason: `Dia 1: Gasto €${day.spend.toFixed(2)}, CPC €${cpc.toFixed(2)} (>€1), 0 vendas, 0 ATC. Campanha não viável.`,
      newBudget: null
    };
  }

  if (isLowCPCMarket) {
    // Mercado CPC Baixo
    if (day.spend >= 20 && day.sales === 0 && day.atc < 2) {
      return {
        action: 'KILL',
        reason: `Dia 1: Gasto €${day.spend.toFixed(2)}, 0 vendas, ${day.atc} ATC (<2). Performance insuficiente para mercado de CPC baixo.`,
        newBudget: null
      };
    }

    if (day.spend >= 25 && day.sales === 0) {
      return {
        action: 'KILL',
        reason: `Dia 1: Gasto €${day.spend.toFixed(2)}, 0 vendas. Limite atingido para mercado de CPC baixo.`,
        newBudget: null
      };
    }
  } else {
    // Mercado CPC Alto
    if (day.spend >= 20 && day.sales === 0 && day.atc < 2) {
      return {
        action: 'KILL',
        reason: `Dia 1: Gasto €${day.spend.toFixed(2)}, 0 vendas, ${day.atc} ATC (<2). Performance insuficiente para mercado de CPC alto.`,
        newBudget: null
      };
    }

    if (day.spend >= 30 && day.sales === 0) {
      return {
        action: 'KILL',
        reason: `Dia 1: Gasto €${day.spend.toFixed(2)}, 0 vendas. Limite atingido para mercado de CPC alto.`,
        newBudget: null
      };
    }
  }

  // Se teve pelo menos 1 venda no primeiro dia, deixar rodar
  if (day.sales >= 1) {
    return {
      action: 'MAINTAIN',
      reason: `Dia 1: ${day.sales} venda(s) obtida(s). Deixando rodar o dia todo conforme regra.`,
      newBudget: null
    };
  }

  return {
    action: 'MAINTAIN',
    reason: `Dia 1: Ainda dentro dos limites aceitáveis. Continuando teste.`,
    newBudget: null
  };
};

const evaluateDay2Rules = (day, campaign, isLowCPCMarket) => {
  // Calcular profit margin do dia 2
  const revenue = day.sales * campaign.productPrice;
  const cogs = (day.unitsSold || day.sales) * campaign.cogs;
  const profit = revenue - day.spend - cogs;
  const profitMargin = revenue > 0 ? (profit / revenue * 100) : (profit < 0 ? -100 : 0);
  
  // NOVA REGRA: Se profit margin do dia 2 for negativa = KILL
  if (profitMargin < 0) {
    return {
      action: 'KILL',
      reason: `Dia 2: Profit margin negativa (${profitMargin.toFixed(2)}%). Campanha inviável no segundo dia.`,
      newBudget: null
    };
  }
  
  // NOVA REGRA: Se profit margin do dia 2 for > 20% = SCALE imediatamente
  if (profitMargin > 20) {
    const currentBudget = campaign.currentBudget || campaign.initialBudget;
    const scalingBudgets = [50, 70, 100, 140, 200, 300, 400];
    const currentIndex = scalingBudgets.findIndex(budget => budget >= currentBudget);
    
    if (currentIndex < scalingBudgets.length - 1) {
      const newBudget = scalingBudgets[currentIndex + 1];
      return {
        action: 'SCALE',
        reason: `Dia 2: Profit margin excelente (${profitMargin.toFixed(2)}% > 20%). Scaling imediato de €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    } else {
      const newBudget = Math.round(currentBudget * 1.2);
      return {
        action: 'SCALE',
        reason: `Dia 2: Profit margin excelente (${profitMargin.toFixed(2)}% > 20%). Scaling 20%: €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    }
  }

  if (isLowCPCMarket) {
    // Mercado CPC Baixo - Dia 2
    if (day.spend >= 10 && day.sales === 0 && day.atc < 2) {
      return {
        action: 'KILL',
        reason: `Dia 2: Gasto €${day.spend.toFixed(2)}, 0 vendas, ${day.atc} ATC (<2). Performance insuficiente no segundo dia.`,
        newBudget: null
      };
    }

    if (day.spend >= 25 && day.sales === 0) {
      return {
        action: 'KILL',
        reason: `Dia 2: Gasto €${day.spend.toFixed(2)}, 0 vendas. Limite atingido no segundo dia.`,
        newBudget: null
      };
    }
  } else {
    // Mercado CPC Alto - Dia 2
    if (day.spend >= 15 && day.sales === 0 && day.atc < 2) {
      return {
        action: 'KILL',
        reason: `Dia 2: Gasto €${day.spend.toFixed(2)}, 0 vendas, ${day.atc} ATC (<2). Performance insuficiente no segundo dia.`,
        newBudget: null
      };
    }

    if (day.spend >= 25 && day.sales === 0) {
      return {
        action: 'KILL',
        reason: `Dia 2: Gasto €${day.spend.toFixed(2)}, 0 vendas. Limite atingido no segundo dia.`,
        newBudget: null
      };
    }
  }

  return {
    action: 'MAINTAIN',
    reason: `Dia 2: Performance dentro dos parâmetros aceitáveis. Preparando para análise de scaling.`,
    newBudget: null
  };
};

const evaluateScalingRules = (campaign, days, metrics) => {
  // Calcular profit margin médio dos últimos 2 dias (48h)
  const last48Hours = days.slice(-2);
  const profitMargins = last48Hours.map(day => {
    const revenue = day.sales * campaign.productPrice;
    const cogs = (day.unitsSold || day.sales) * campaign.cogs;
    const profit = revenue - day.spend - cogs;
    return revenue > 0 ? (profit / revenue * 100) : -100;
  });

  const averageProfitMargin = profitMargins.reduce((sum, margin) => sum + margin, 0) / profitMargins.length;
  const currentBudget = campaign.currentBudget || campaign.initialBudget;

  // Orçamentos de scaling: 50€-70€-100€-140€-200€-300€-400€ - 20% a partir daqui
  const scalingBudgets = [50, 70, 100, 140, 200, 300, 400];
  
  // Regra de descaling: Se profit margin médio é negativo ou 0%
  if (averageProfitMargin <= 0) {
    const currentIndex = scalingBudgets.findIndex(budget => budget >= currentBudget);
    
    if (currentIndex > 0) {
      const newBudget = scalingBudgets[currentIndex - 1];
      
      // Se desceu para o orçamento inicial (50€) e continua em loss durante 48h -> Kill
      if (newBudget === 50 && currentBudget === 50) {
        return {
          action: 'KILL',
          reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}%. Já no orçamento inicial e ainda em loss. Matando campanha.`,
          newBudget: null
        };
      }
      
      return {
        action: 'DESCALE',
        reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}% (negativo/zero). Descaling orçamento de €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    } else {
      return {
        action: 'KILL',
        reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}%. Já no menor orçamento possível. Matando campanha.`,
        newBudget: null
      };
    }
  }

  // Regra de scaling: Se profit margin médio > 20% e ambos os dias > 15%
  // Correção: No exemplo foi "A média do profit margin é >20% e ambos os dias foram superiores a 15%"
  const allDaysAbove15 = profitMargins.every(margin => margin > 15);
  
  if (averageProfitMargin > 20 && allDaysAbove15) {
    const currentIndex = scalingBudgets.findIndex(budget => budget >= currentBudget);
    
    if (currentIndex < scalingBudgets.length - 1) {
      const newBudget = scalingBudgets[currentIndex + 1];
      return {
        action: 'SCALE',
        reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}% (>20%) e ambos os dias >15%. Scaling orçamento de €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    } else {
      // Scaling 20% a partir de 400€
      const newBudget = Math.round(currentBudget * 1.2);
      return {
        action: 'SCALE',
        reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}% (>20%) e ambos os dias >15%. Scaling 20%: €${currentBudget} para €${newBudget}.`,
        newBudget: newBudget
      };
    }
  }

  return {
    action: 'MAINTAIN',
    reason: `Profit margin médio em 48h: ${averageProfitMargin.toFixed(2)}%. Performance estável, mantendo orçamento atual de €${currentBudget}.`,
    newBudget: null
  };
};

// Função auxiliar para formatar valores monetários
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

// Função auxiliar para formatar percentagens
export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

// Função para calcular métricas de um dia específico
export const calculateDayMetrics = (day, productPrice, cogs) => {
  const revenue = day.sales * productPrice;
  const dayCogs = (day.unitsSold || day.sales) * cogs;
  const profit = revenue - day.spend - dayCogs;
  
  return {
    revenue,
    cogs: dayCogs,
    profit,
    profitMargin: revenue > 0 ? (profit / revenue * 100) : 0,
    roas: day.spend > 0 ? (revenue / day.spend) : 0,
    ber: day.spend > 0 ? (day.spend / revenue * 100) : 0,
    cpc: day.clicks > 0 ? (day.spend / day.clicks) : 0,
    cpa: day.sales > 0 ? (day.spend / day.sales) : 0,
    ctr: day.impressions > 0 ? (day.clicks / day.impressions * 100) : 0,
    conversionRate: day.clicks > 0 ? (day.sales / day.clicks * 100) : 0
  };
};