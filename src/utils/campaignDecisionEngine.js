// Campaign Decision Engine - Automação de decisões para campanhas Facebook Ads
// Lógica PROGRESSIVA DETALHADA conforme especificado pelo utilizador

// Types (JSDoc para compatibilidade)
/**
 * @typedef {Object} Row
 * @property {string} date - YYYY-MM-DD
 * @property {string} [productId]
 * @property {string} productName
 * @property {number} price - €
 * @property {number} cog - €
 * @property {number} unitsSold
 * @property {number} totalSpend - €
 * @property {number} [cpc]
 * @property {number} [atc]
 * @property {number} [purchases]
 * @property {string} [market]
 * @property {number} [budget] - orçamento da campanha do dia
 */

/**
 * @typedef {Object} Metrics
 * @property {number} totalCog
 * @property {number} storeValue
 * @property {number} marginBruta
 * @property {number|null} BER
 * @property {number|null} ROAS
 * @property {number|null} CPA
 * @property {number} marginEur
 * @property {number|null} marginPct
 */

/**
 * @typedef {Object} Decision
 * @property {'MANTER'|'MATAR'|'SCALE'|'DESCALE'} action
 * @property {string} reason
 * @property {number} [targetBudget]
 * @property {string} [marketType]
 * @property {number} [avgMarginPct]
 * @property {Object} [thresholds]
 */

// Constants
export const CPC_THRESHOLDS = {
  SUPER_LOW: 0.65, // Portugal - < 0.65€
  LOW: 0.75,       // ES/IT/FR - < 0.75€
  NORMAL: 1.00     // UK/DE/CH - < 1.00€
};

// Budget ladders por mercado (CORRIGIDOS DEFINITIVAMENTE)
export const BUDGET_LADDERS = {
  SUPER_LOW: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], // Portugal: sempre +10€
  LOW: [30, 50, 70, 100, 140, 200, 300, 400],      // ES/IT/FR: depois de 400 sempre +20%
  NORMAL: [50, 70, 100, 140, 200, 300, 400]        // UK/DE/CH: depois de 400 sempre +20%
};

export const SCALE_THRESHOLD = 0.20; // 20% profit para scale
export const MAINTAIN_THRESHOLD = 0.15; // 15% profit para manter

// Helper functions
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round4(n) {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

/**
 * Calculate all metrics for a row
 * @param {Row} row 
 * @returns {Metrics}
 */
export function calculateMetrics(row) {
  const price = Number(row.price || 0);
  const cog = Number(row.cog || 0);
  const units = Math.max(0, Math.floor(Number(row.unitsSold || 0)));
  const totalSpend = Number(row.totalSpend || 0);
  const purchases = Math.max(0, Math.floor(Number(row.purchases || 0)));

  const totalCog = round2(cog * units);
  const storeValue = round2(price * units);
  const marginBruta = round2(price - cog);
  const BER = marginBruta > 0 ? round4(price / marginBruta) : null;
  const ROAS = totalSpend > 0 ? round4(storeValue / totalSpend) : null;
  const CPA = purchases > 0 ? round2(totalSpend / purchases) : null;
  const marginEur = round2(storeValue - totalCog - totalSpend);
  const marginPct = storeValue > 0 ? round4(marginEur / storeValue) : null;

  return {
    totalCog,
    storeValue,
    marginBruta,
    BER,
    ROAS,
    CPA,
    marginEur,
    marginPct
  };
}

/**
 * Calculate average market CPC from historical data
 * @param {Row[]} historicalData 
 * @returns {number}
 */
export function calculateMarketCPC(historicalData) {
  if (!historicalData || historicalData.length === 0) return 1.0;
  
  const validCPCs = historicalData
    .map(row => Number(row.cpc || 0))
    .filter(cpc => cpc > 0);
    
  if (validCPCs.length === 0) return 1.0;
  
  return round4(validCPCs.reduce((sum, cpc) => sum + cpc, 0) / validCPCs.length);
}

/**
 * Get market type based on average CPC
 * @param {number} avgMarketCPC 
 * @returns {'SUPER_LOW'|'LOW'|'NORMAL'}
 */
export function getMarketType(avgMarketCPC) {
  if (avgMarketCPC <= CPC_THRESHOLDS.SUPER_LOW) return "SUPER_LOW";
  if (avgMarketCPC <= CPC_THRESHOLDS.LOW) return "LOW";
  return "NORMAL";
}

/**
 * Decision engine COMPLETO - Seguindo lógica progressiva detalhada
 * @param {Row[]} lastDays - Array of rows for last N days (oldest first)
 * @param {number} avgMarketCPC - Average market CPC
 * @param {boolean} isDayComplete - Se true, considera que o dia terminou
 * @returns {Decision}
 */
export function decisionEngine(lastDays, avgMarketCPC, isDayComplete = true) {
  // Validation
  if (!lastDays || lastDays.length === 0) {
    return { 
      action: "MANTER", 
      reason: "Sem dados para análise",
      marketType: "UNKNOWN"
    };
  }

  const marketType = getMarketType(avgMarketCPC);
  const days = lastDays.map(r => ({ r, m: calculateMetrics(r) }));
  const today = days[days.length - 1];
  const dayIndex = days.length; // 1, 2, 3...

  // Helper functions to safely get values
  const getSpend = (r) => Number(r.totalSpend || 0);
  const getATC = (r) => Number(r.atc || 0);
  const getSales = (r) => Math.max(0, Math.floor(Number(r.purchases || 0)));
  const getCPC = (r) => Number(r.cpc || 0);

  // === DIA 1 LOGIC - LÓGICA PROGRESSIVA DETALHADA ===
  if (dayIndex === 1) {
    const tSpend = getSpend(today.r);
    const cpc = getCPC(today.r);
    const tATC = getATC(today.r);
    const tSales = getSales(today.r);

    const thresholds = {
      marketType,
      spend: tSpend,
      cpc,
      atc: tATC,
      sales: tSales
    };

    // REGRA GLOBAL PRIORITÁRIA: Se teve venda → MANTER
    if (tSales >= 1) {
      return { 
        action: "MANTER", 
        reason: "Dia 1: Teve venda - deixar rodar mais 24h",
        marketType,
        thresholds
      };
    }

    // === PORTUGAL (CPC SUPER BAIXO) - RODAR 10€ ===
    if (marketType === "SUPER_LOW") {
      // Kill antecipado se CPC >= 0.65€
      if (cpc >= 0.65) {
        return { 
          action: "MATAR", 
          reason: "Dia 1: CPC ≥€0.65 - kill antecipado",
          marketType,
          thresholds
        };
      }
      
      // Aos 10€: se tiver 3 ATC e 1 checkout → RODAR (mas já verificamos venda acima)
      // Se aos 10€ sem venda → MATAR
      if (tSpend >= 10) {
        if (tSales === 0) {
          return { 
            action: "MATAR", 
            reason: "Dia 1: €10 gastos sem venda",
            marketType,
            thresholds
          };
        }
      }
      
      return { 
        action: "MANTER", 
        reason: "Dia 1: Continuar até €10",
        marketType,
        thresholds
      };
    }

    // === ESPANHA/ITÁLIA/FRANÇA (CPC BAIXO) - RODAR 30€ ===
    if (marketType === "LOW") {
      // Checkpoint aos 10€: se não tiver venda OU CPC > 0.75€ → KILL
      if (tSpend >= 10 && (tSales === 0 || cpc > 0.75)) {
        return { 
          action: "MATAR", 
          reason: tSales === 0 
            ? "Dia 1: €10 sem venda" 
            : "Dia 1: €10 + CPC >€0.75",
          marketType,
          thresholds
        };
      }
      
      // Se passou dos 10€ sem venda mas CPC < 0.75€ → continua até 15€
      if (tSpend >= 15 && tSales === 0 && tATC < 2) {
        return { 
          action: "MATAR", 
          reason: "Dia 1: €15 sem venda e ATC <2",
          marketType,
          thresholds
        };
      }
      
      // Aos 20/25€ dependendo de CPC, CTR, ATC (se ATC ≥ 2)
      const finalLimit = (cpc < 0.7 && tATC >= 3) ? 25 : 20;
      if (tSpend >= finalLimit && tSales === 0) {
        return { 
          action: "MATAR", 
          reason: `Dia 1: €${finalLimit} sem venda`,
          marketType,
          thresholds
        };
      }
      
      // Se gastou 30€ (limite absoluto) sem venda
      if (tSpend >= 30 && tSales === 0) {
        return { 
          action: "MATAR", 
          reason: "Dia 1: €30 gastos sem venda",
          marketType,
          thresholds
        };
      }
      
      return { 
        action: "MANTER", 
        reason: "Dia 1: Continuar progressão",
        marketType,
        thresholds
      };
    }

    // === UK/ALEMANHA/SUÍÇA (CPC NORMAL) - RODAR 50€ ===
    if (marketType === "NORMAL") {
      // Checkpoint aos 10€: se não tiver venda OU CPC > 1€ → KILL
      if (tSpend >= 10 && (tSales === 0 || cpc > 1.0)) {
        return { 
          action: "MATAR", 
          reason: tSales === 0 
            ? "Dia 1: €10 sem venda" 
            : "Dia 1: €10 + CPC >€1",
          marketType,
          thresholds
        };
      }
      
      // Se passou dos 10€ sem venda mas CPC < 1€ → continua até 20€
      if (tSpend >= 20 && tSales === 0 && tATC < 2) {
        return { 
          action: "MATAR", 
          reason: "Dia 1: €20 sem venda e ATC <2",
          marketType,
          thresholds
        };
      }
      
      // Aos 25/30€ dependendo de CPC, CTR, ATC (se ATC ≥ 2)
      const finalLimit = (cpc < 0.9 && tATC >= 3) ? 30 : 25;
      if (tSpend >= finalLimit && tSales === 0) {
        return { 
          action: "MATAR", 
          reason: `Dia 1: €${finalLimit} sem venda`,
          marketType,
          thresholds
        };
      }
      
      // Se gastou 50€ (limite absoluto) sem venda
      if (tSpend >= 50 && tSales === 0) {
        return { 
          action: "MATAR", 
          reason: "Dia 1: €50 gastos sem venda",
          marketType,
          thresholds
        };
      }
      
      return { 
        action: "MANTER", 
        reason: "Dia 1: Continuar progressão",
        marketType,
        thresholds
      };
    }
  }

  // === DIA 2+ LOGIC ===
  if (dayIndex >= 2) {
    const todaySpend = getSpend(today.r);
    const todayATC = getATC(today.r);
    const todaySales = getSales(today.r);
    const todayCPC = getCPC(today.r);

    const thresholds = {
      marketType,
      spend: todaySpend,
      cpc: todayCPC,
      atc: todayATC,
      sales: todaySales
    };

    // Se chegou ao dia 2, é porque sobreviveu ao dia 1 (teve venda)
    // "deixar rodar sempre até ao fim do dia, mas se CPC, CTR, ATC tiverem uma merda → kill"
    
    const cpcThreshold = marketType === "SUPER_LOW" ? 0.65 : 
                        marketType === "LOW" ? 0.75 : 1.0;
    
    if (todayCPC > (cpcThreshold * 1.5) && todayATC < 2) {
      return { 
        action: "MATAR", 
        reason: `Dia ${dayIndex}: Métricas ruins - CPC €${todayCPC.toFixed(2)} + ATC ${todayATC}`,
        marketType,
        thresholds
      };
    }

    // No fim do dia: analisar profit médio dos últimos 2 dias
    if (isDayComplete) {
      const last2Days = days.slice(-2);
      const margins = last2Days.map(d => d.m.marginPct || 0);
      const avgMarginPct = round4(margins.reduce((a, b) => a + b, 0) / margins.length);

      // Usar budget ladders globais
      const ladder = BUDGET_LADDERS[marketType];
      const currentBudget = Number(today.r.budget || ladder[0]);
      
      // Encontrar posição atual no ladder
      let currentIdx = ladder.indexOf(currentBudget);
      if (currentIdx === -1) {
        // Se não está no ladder padrão, calcular posição para valores acima de 400€
        currentIdx = ladder.length - 1;
      }

      // Profit > 20% → SCALE
      if (avgMarginPct > 0.20) {
        let nextBudget;
        
        if (currentIdx < ladder.length - 1) {
          // Ainda dentro do ladder padrão
          nextBudget = ladder[currentIdx + 1];
        } else {
          // Acima do ladder padrão
          if (marketType === "SUPER_LOW") {
            // Portugal: sempre +10€
            nextBudget = currentBudget + 10;
          } else {
            // ES/IT/FR e UK/DE/CH: +20% acima de 400€
            nextBudget = Math.round(currentBudget * 1.2);
          }
        }
        
        return { 
          action: "SCALE", 
          reason: `Dia ${dayIndex}: Profit ${Math.round(avgMarginPct * 100)}% >20% → scale`,
          targetBudget: nextBudget,
          marketType,
          thresholds,
          avgMarginPct
        };
      }
      
      // Profit < 0% → KILL ou DESCALE
      if (avgMarginPct <= 0) {
        if (currentIdx === 0) {
          return { 
            action: "MATAR", 
            reason: `Dia ${dayIndex}: Profit negativo no orçamento mínimo`,
            marketType,
            thresholds,
            avgMarginPct
          };
        } else {
          let targetBudget;
          
          if (currentIdx > 0 && currentIdx < ladder.length) {
            // Dentro do ladder padrão
            targetBudget = ladder[currentIdx - 1];
          } else {
            // Acima do ladder padrão - voltar para o último valor do ladder
            targetBudget = ladder[ladder.length - 1];
          }
          
          return { 
            action: "DESCALE", 
            reason: `Dia ${dayIndex}: Profit negativo → descaling`,
            targetBudget,
            marketType,
            thresholds,
            avgMarginPct
          };
        }
      }
      
      // Profit 0-20% → MANTER
      return { 
        action: "MANTER", 
        reason: `Dia ${dayIndex}: Profit ${Math.round(avgMarginPct * 100)}% (0-20%) → manter`,
        marketType,
        thresholds,
        avgMarginPct
      };
    }

    // Se dia ainda não terminou → MANTER
    return { 
      action: "MANTER", 
      reason: `Dia ${dayIndex}: Deixar rodar até fim do dia`,
      marketType,
      thresholds
    };
  }

  // Fallback
  return { 
    action: "MANTER", 
    reason: "Análise não conclusiva",
    marketType
  };
}

/**
 * Get campaign history for a specific product
 * @param {Row[]} allRows - All product data
 * @param {string} productName - Product to filter
 * @param {number} maxDays - Maximum days to include
 * @returns {Row[]}
 */
export function getCampaignHistory(allRows, productName, maxDays = 7) {
  return allRows
    .filter(row => row.productName === productName)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-maxDays);
}

/**
 * Simulate scaling impact
 * @param {Row} product - Current product data
 * @param {number} targetBudget - New budget
 * @param {Metrics} currentMetrics - Current calculated metrics
 * @returns {Object}
 */
export function simulateScaling(product, targetBudget, currentMetrics) {
  const currentBudget = Number(product.budget || 50);
  const scaleFactor = targetBudget / currentBudget;
  
  return {
    newBudget: targetBudget,
    scaleFactor: round2(scaleFactor),
    projectedSpend: round2(Number(product.totalSpend || 0) * scaleFactor),
    projectedRevenue: round2(currentMetrics.storeValue * scaleFactor),
    projectedMargin: round2(currentMetrics.marginEur * scaleFactor)
  };
}

/**
 * Validate decision before applying
 * @param {Decision} decision - Decision to validate
 * @param {Row} product - Product data
 * @returns {boolean}
 */
export function validateDecision(decision, product) {
  if (!decision || !product) return false;
  
  if (decision.action === 'SCALE' && !decision.targetBudget) return false;
  if (decision.action === 'DESCALE' && !decision.targetBudget) return false;
  
  return true;
}

/**
 * Get styling for decision badges
 * @param {'MANTER'|'MATAR'|'SCALE'|'DESCALE'} action
 * @returns {Object}
 */
export function getDecisionBadgeStyle(action) {
  const styles = {
    MANTER: { 
      color: '#10b981', 
      bgColor: '#d1fae5', 
      icon: '✅',
      label: 'MANTER' 
    },
    MATAR: { 
      color: '#ef4444', 
      bgColor: '#fee2e2', 
      icon: '❌',
      label: 'MATAR' 
    },
    SCALE: { 
      color: '#3b82f6', 
      bgColor: '#dbeafe', 
      icon: '📈',
      label: 'SCALE' 
    },
    DESCALE: { 
      color: '#f59e0b', 
      bgColor: '#fef3c7', 
      icon: '📉',
      label: 'DESCALE' 
    }
  };
  
  return styles[action] || styles.MANTER;
}

/**
 * Format decision for display
 * @param {Decision} decision 
 * @returns {string}
 */
export function formatDecisionDisplay(decision) {
  const style = getDecisionBadgeStyle(decision.action);
  let display = `${style.icon} ${style.label}`;
  
  if (decision.targetBudget) {
    display += ` → €${decision.targetBudget}`;
  }
  
  return display;
}

// Export all constants for external use
export const DECISION_CONFIG = {
  CPC_THRESHOLDS,
  BUDGET_LADDERS,
  SCALE_THRESHOLD,
  MAINTAIN_THRESHOLD
};