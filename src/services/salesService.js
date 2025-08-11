import { supabase } from '../config/supabase';

class SalesService {
  
  /**
   * Buscar todas as vendas ordenadas por data mais recente
   * @param {number} limit - Limite de resultados (padrão: 50)
   * @param {number} offset - Offset para paginação (padrão: 0)
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVendas(limit = 50, offset = 0) {
    try {
      console.log(`📊 Buscando vendas (limit: ${limit}, offset: ${offset})`);
      
      const { data, error, count } = await supabase
        .from('vendas')
        .select(`
          *,
          created_at,
          updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Erro ao buscar vendas:', error);
        return { data: [], error, count: 0 };
      }

      console.log(`✅ ${data?.length || 0} vendas encontradas`);
      return { data: data || [], error: null, count: count || 0 };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar vendas:', error);
      return { data: [], error, count: 0 };
    }
  }

  /**
   * Buscar vendas por período específico
   * @param {string} startDate - Data início (formato ISO)
   * @param {string} endDate - Data fim (formato ISO) 
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVendasPorPeriodo(startDate, endDate) {
    try {
      console.log(`📅 Buscando vendas entre ${startDate} e ${endDate}`);
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar vendas por período:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar vendas por período:', error);
      return { data: [], error };
    }
  }

  /**
   * Buscar vendas de hoje
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVendasHoje() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    return this.getVendasPorPeriodo(
      hoje.toISOString(),
      amanha.toISOString()
    );
  }

  /**
   * Calcular estatísticas das vendas
   * @param {Array} vendas - Array de vendas
   * @returns {Object} Estatísticas calculadas
   */
  calcularEstatisticas(vendas = []) {
    if (!vendas.length) {
      return {
        totalVendas: 0,
        totalFaturamento: 0,
        totalItens: 0,
        precoMedio: 0,
        vendaPorHora: 0,
        produtoMaisVendido: null
      };
    }

    const totalVendas = vendas.length;
    const totalFaturamento = vendas.reduce((sum, venda) => sum + (venda.total || 0), 0);
    const totalItens = vendas.reduce((sum, venda) => sum + (venda.quantidade || 0), 0);
    const precoMedio = totalFaturamento / totalItens || 0;

    // Calcular vendas por hora (últimas 24h)
    const agora = new Date();
    const ha24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    const vendasUltimas24h = vendas.filter(venda => 
      new Date(venda.created_at) >= ha24h
    );
    const vendaPorHora = vendasUltimas24h.length / 24;

    // Produto mais vendido
    const produtoContagem = {};
    vendas.forEach(venda => {
      produtoContagem[venda.produto] = (produtoContagem[venda.produto] || 0) + venda.quantidade;
    });

    const produtoMaisVendido = Object.keys(produtoContagem).reduce((a, b) =>
      produtoContagem[a] > produtoContagem[b] ? a : b, null
    );

    return {
      totalVendas,
      totalFaturamento: parseFloat(totalFaturamento.toFixed(2)),
      totalItens,
      precoMedio: parseFloat(precoMedio.toFixed(2)),
      vendaPorHora: parseFloat(vendaPorHora.toFixed(1)),
      produtoMaisVendido,
      produtoContagem
    };
  }

  /**
   * Subscrever a mudanças em tempo real na tabela vendas
   * @param {Function} callback - Função a ser chamada quando houver mudanças
   * @returns {Object} Subscription object para cleanup
   */
  subscribeToVendas(callback) {
    console.log('🔔 Iniciando subscription para vendas em tempo real');
    
    const subscription = supabase
      .channel('vendas_realtime')
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'vendas'
      }, (payload) => {
        console.log('🔄 Mudança detectada na tabela vendas:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status);
      });

    return subscription;
  }

  /**
   * Cancelar subscription de tempo real
   * @param {Object} subscription - Objeto de subscription retornado por subscribeToVendas
   */
  unsubscribeFromVendas(subscription) {
    if (subscription) {
      console.log('🔇 Cancelando subscription de vendas');
      supabase.removeChannel(subscription);
    }
  }

  /**
   * Buscar vendas por status financeiro
   * @param {string} status - Status financeiro (paid, pending, etc.)
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVendasPorStatus(status) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('financial_status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Erro ao buscar vendas com status ${status}:`, error);
        return { data: [], error };
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar vendas por status:', error);
      return { data: [], error };
    }
  }

  /**
   * Buscar vendas por cliente
   * @param {string} email - Email do cliente
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVendasPorCliente(email) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Erro ao buscar vendas para cliente ${email}:`, error);
        return { data: [], error };
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar vendas por cliente:', error);
      return { data: [], error };
    }
  }

  /**
   * Formatar moeda
   * @param {number} valor - Valor a ser formatado
   * @param {string} currency - Moeda (padrão: EUR)
   * @returns {string} Valor formatado
   */
  formatarMoeda(valor, currency = 'EUR') {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency
    }).format(valor);
  }

  /**
   * Formatar data
   * @param {string} data - Data no formato ISO
   * @returns {string} Data formatada
   */
  formatarData(data) {
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(data));
  }
}

// Exportar instância singleton
const salesService = new SalesService();
export default salesService;
