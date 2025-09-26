import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import dailyRoasService from '../services/dailyRoasService';
import dailyRoasIntegrationService from '../services/dailyRoasIntegrationService';

import { 
  decisionEngine, 
  calculateMarketCPC, 
  getCampaignHistory, 
  getDecisionBadgeStyle, 
  formatDecisionDisplay,
  simulateScaling,
  validateDecision,
  DECISION_CONFIG
} from '../utils/campaignDecisionEngine';
import { 
  Calendar, 
  Plus, 
  Download, 
  Upload, 
  Save, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  FileSpreadsheet,
  Eye,
  Check,
  X,
  Settings,
  TrendingDown,
  Zap,
  PlayCircle,
  PauseCircle,
  Info,
  Edit3,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './DailyRoasPageNew.css';

const DailyRoasPageNew = () => {
  // Estados principais
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados dos modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Estados de dados
  const [previewData, setPreviewData] = useState([]);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [summary, setSummary] = useState({
    totalSpend: '0.00',
    totalRevenue: '0.00',
    totalMarginEur: '0.00',
    weightedRoas: '0.0000'
  });
  const [campaignDecisions, setCampaignDecisions] = useState({});
  const [allProductsHistory, setAllProductsHistory] = useState([]);
  const [marketCPC, setMarketCPC] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoadingConsolidated, setIsLoadingConsolidated] = useState(false);
  
  // Estados de interface
  const [expandedCards, setExpandedCards] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Novo produto template
  const [newProduct, setNewProduct] = useState({
    productName: '',
    price: 0,
    cog: 0,
    unitsSold: 0,
    totalSpend: 0,
    cpc: 0,
    atc: 0,
    purchases: 0,
    budget: 50
  });

  // Função de cálculo (mantida da versão anterior)
  const calculateRow = (row) => {
    const price = Number(row.price) || 0;
    const cog = Number(row.cog) || 0;
    const unitsSold = Number(row.unitsSold) || 0;
    const totalSpend = Number(row.totalSpend) || 0;
    const purchases = Number(row.purchases) || 0;

    const totalCog = cog * unitsSold;
    const storeValue = price * unitsSold;
    const marginBruta = price - cog;
    const ber = marginBruta > 0 ? (price / marginBruta).toFixed(4) : null;
    const roas = totalSpend > 0 ? (storeValue / totalSpend).toFixed(4) : null;
    const cpa = purchases > 0 ? (totalSpend / purchases).toFixed(2) : null;
    const marginEur = storeValue - totalCog - totalSpend;
    const marginPct = storeValue > 0 ? marginEur / storeValue : null;

    return {
      totalCog: totalCog.toFixed(2),
      storeValue: storeValue.toFixed(2),
      marginBruta: marginBruta.toFixed(2),
      ber,
      roas,
      cpa,
      marginEur: marginEur.toFixed(2),
      marginPct
    };
  };

  // Carregar dados do Supabase
  const loadDataForDate = async (date) => {
    setIsLoading(true);
    try {
      const isAuth = await dailyRoasService.isAuthenticated();
      if (!isAuth) {
        toast.error('Utilizador não autenticado');
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const productsData = await dailyRoasService.getProductsByDate(date);
      setProducts(productsData);
      
      await loadSummary(date);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da base de dados');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar resumo
  const loadSummary = async (date) => {
    try {
      const summaryData = await dailyRoasService.getDailySummary(date);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      setSummary({
        totalSpend: '0.00',
        totalRevenue: '0.00',
        totalMarginEur: '0.00',
        weightedRoas: '0.0000'
      });
    }
  };

  // Calcular decisões de campanha
  const calculateCampaignDecisions = async () => {
    try {
      setIsRecalculating(true);
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - DECISION_CONFIG.MAX_HISTORY_DAYS);
      
      const historicalData = [];
      for (let i = 0; i <= DECISION_CONFIG.MAX_HISTORY_DAYS; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        try {
          const dayData = await dailyRoasService.getProductsByDate(dateStr);
          historicalData.push(...dayData.map(item => ({ ...item, date: dateStr })));
        } catch (error) {
          continue;
        }
      }

      setAllProductsHistory(historicalData);
      const avgMarketCPC = calculateMarketCPC(historicalData);
      setMarketCPC(avgMarketCPC);

      const decisions = {};
      products.forEach(product => {
        const productHistory = getCampaignHistory(
          historicalData, 
          product.productName, 
          DECISION_CONFIG.MAX_HISTORY_DAYS
        );

        const currentDayInHistory = productHistory.find(h => h.date === selectedDate);
        if (!currentDayInHistory) {
          productHistory.push({ ...product, date: selectedDate });
        }

        if (productHistory.length > 0) {
          const decision = decisionEngine(productHistory, avgMarketCPC, true);
          decisions[product.id] = decision;
        }
      });

      setCampaignDecisions(decisions);
    } catch (error) {
      console.error('Erro ao calcular decisões:', error);
      toast.error('Erro ao calcular decisões automáticas');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Adicionar novo produto
  const addProduct = async () => {
    try {
      if (!newProduct.productName.trim()) {
        toast.error('Nome do produto é obrigatório');
        return;
      }

      const isAuth = await dailyRoasService.isAuthenticated();
      if (!isAuth) {
        toast.error('Utilizador não autenticado');
        return;
      }

      const productWithId = {
        ...newProduct,
        id: `${Date.now()}-${Math.random()}`,
        date: selectedDate,
        ...calculateRow(newProduct)
      };

      await dailyRoasService.saveProduct(productWithId);
      setProducts([...products, productWithId]);
      setShowAddModal(false);
      setNewProduct({
        productName: '',
        price: 0,
        cog: 0,
        unitsSold: 0,
        totalSpend: 0,
        cpc: 0,
        atc: 0,
        purchases: 0,
        budget: 50
      });

      // Trigger recálculo de decisões
      triggerDecisionRecalculation();
      
      toast.success('Produto adicionado! Decisões calculadas.');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  };

  // Carregar dados consolidados de Campaigns e Quotation
  const loadConsolidatedData = async () => {
    try {
      setIsLoadingConsolidated(true);
      toast.loading('Carregando dados consolidados...', { id: 'consolidated' });

      const result = await dailyRoasIntegrationService.getConsolidatedDailyRoas(selectedDate);
      
      if (result.success && result.data.length > 0) {
        // Converter dados consolidados para o formato esperado pelo componente
        const convertedProducts = result.data.map(item => ({
          id: `${item.productName}-${selectedDate}`,
          productName: item.productName,
          price: item.price,
          cog: item.cogs,
          unitsSold: item.unitsSold,
          totalSpend: item.totalSpend,
          cpc: item.cpc,
          atc: item.clicks,
          purchases: item.numberOfSales,
          totalCog: item.totalCog,
          storeValue: item.storeValue,
          marginBruta: item.marginBruta,
          marginEur: item.marginEur,
          marginPct: item.marginPct,
          roas: item.roas,
          cpa: item.cpa,
          ber: item.ber,
          date: selectedDate,
          source: 'integrated',
          // Dados adicionais da integração
          hasCampaignData: item.hasCampaignData,
          hasQuotationData: item.hasQuotationData,
          dataCompleteness: item.dataCompleteness,
          productLink: item.productLink,
          marketType: item.marketType
        }));

        setProducts(convertedProducts);
        
        // Atualizar resumo
        if (result.summary) {
          setSummary({
            totalSpend: result.summary.totalSpend.toFixed(2),
            totalRevenue: result.summary.totalRevenue.toFixed(2),
            totalMarginEur: result.summary.totalMargin.toFixed(2),
            weightedRoas: result.summary.weightedRoas.toFixed(4)
          });
        }

        toast.success(`Dados consolidados carregados: ${result.data.length} produtos`, { id: 'consolidated' });
        
        // Recalcular decisões com os novos dados
        await recalculateDecisions();
        
      } else {
        toast.error('Nenhum dado consolidado encontrado para esta data', { id: 'consolidated' });
      }

    } catch (error) {
      console.error('Erro ao carregar dados consolidados:', error);
      toast.error('Erro ao carregar dados consolidados', { id: 'consolidated' });
    } finally {
      setIsLoadingConsolidated(false);
    }
  };

  // Carregar automaticamente produtos da Quotation sheet
  const loadQuotationProductsAutomatically = async () => {
    try {
      console.log('🔄 Carregando produtos da Quotation sheet automaticamente...');
      
      const quotationProducts = await dailyRoasIntegrationService.getQuotationProductsForDailyRoas(selectedDate);
      
      if (quotationProducts.length > 0) {
        console.log(`📊 ${quotationProducts.length} produtos encontrados na Quotation sheet`);
        
        // Verificar quais produtos já existem no Daily ROAS
        const existingProductNames = products.map(p => p.productName.toLowerCase());
        const newProducts = quotationProducts.filter(qp => 
          !existingProductNames.includes(qp.productName.toLowerCase())
        );

        console.log(`📊 ${newProducts.length} produtos novos para adicionar`);
        console.log(`📊 ${quotationProducts.length - newProducts.length} produtos já existem no Daily ROAS`);

        if (newProducts.length > 0) {
          console.log(`✅ Adicionando ${newProducts.length} novos produtos da Quotation sheet`);
          
          // Adicionar novos produtos ao estado
          setProducts(prevProducts => [...prevProducts, ...newProducts]);
          
          // Salvar automaticamente na base de dados
          let savedCount = 0;
          for (const product of newProducts) {
            try {
              await dailyRoasService.saveProduct(product);
              savedCount++;
            } catch (error) {
              console.error('Erro ao salvar produto automaticamente:', error);
            }
          }
          
          // Mostrar toast com informações detalhadas
          const productsWithSales = newProducts.filter(p => p.hasSalesOnDate).length;
          const productsWithoutSales = newProducts.filter(p => !p.hasSalesOnDate).length;
          
          let message = `${newProducts.length} produtos da Quotation sheet adicionados automaticamente!`;
          if (productsWithSales > 0) {
            message += ` (${productsWithSales} com vendas, ${productsWithoutSales} sem vendas)`;
          }
          
          toast.success(message);
          
          // Recalcular decisões com os novos produtos
          await recalculateDecisions();
        } else {
          console.log('ℹ️ Todos os produtos da Quotation sheet já estão no Daily ROAS');
        }
      } else {
        console.log('ℹ️ Nenhum produto encontrado na Quotation sheet');
        toast('Nenhum produto encontrado na Quotation sheet para esta data', { icon: 'ℹ️' });
      }

    } catch (error) {
      console.error('❌ Erro ao carregar produtos da Quotation sheet automaticamente:', error);
      toast.error('Erro ao carregar produtos da Quotation sheet');
    }
  };

  // Atualizar produto
  const updateProduct = async (productId, field, value) => {
    try {
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          const updatedProduct = { ...product, [field]: value };
          return { ...updatedProduct, ...calculateRow(updatedProduct) };
        }
        return product;
      });

      setProducts(updatedProducts);

      const productToSave = updatedProducts.find(p => p.id === productId);
      if (productToSave) {
        await dailyRoasService.saveProduct(productToSave);
      }

      // Trigger recálculo de decisões imediatamente
      triggerDecisionRecalculation();
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao salvar alteração');
    }
  };

  // Eliminar produto
  const deleteProduct = async (productId) => {
    try {
      await dailyRoasService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      
      // Trigger recálculo de decisões
      triggerDecisionRecalculation();
      
      toast.success('Produto eliminado');
    } catch (error) {
      console.error('Erro ao eliminar produto:', error);
      toast.error('Erro ao eliminar produto');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (products.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const exportData = products.map(product => ({
        'Product Name': product.productName,
        'Price (€)': product.price,
        'COG (€)': product.cog,
        'Units Sold': product.unitsSold,
        'Store Value (€)': product.storeValue,
        'Total Spend (€)': product.totalSpend,
        'CPC (€)': product.cpc || 0,
        'ATC': product.atc || 0,
        'Purchases': product.purchases || 0,
        'ROAS': product.roas || 'N/A',
        'CPA (€)': product.cpa || 'N/A',
        'Margin (€)': product.marginEur,
        'Margin (%)': product.marginPct ? (product.marginPct * 100).toFixed(2) + '%' : 'N/A',
        'BER': product.ber || 'N/A',
        'Budget (€)': product.budget || 50,
        'Decision': campaignDecisions[product.id] ? campaignDecisions[product.id].action : 'N/A',
        'Decision Reason': campaignDecisions[product.id] ? campaignDecisions[product.id].reason : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daily ROAS Data');

      // Auto-resize columns
      const maxWidth = 20;
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.min(Math.max(key.length, 10), maxWidth)
      }));
      ws['!cols'] = colWidths;

      const fileName = `Daily_ROAS_${selectedDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Dados exportados para ${fileName}`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  // Import from Excel
  const importFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          toast.error('Ficheiro Excel vazio');
          return;
        }

        // Map Excel columns to our data structure
        const mappedData = jsonData.map((row, index) => {
          const product = {
            id: `imported-${Date.now()}-${index}`,
            productName: row['Product Name'] || `Produto ${index + 1}`,
            price: Number(row['Price (€)'] || row['PRICE'] || 0),
            cog: Number(row['COG (€)'] || row['COG'] || 0),
            unitsSold: Number(row['Units Sold'] || row['UNITS SOLD'] || 0),
            totalSpend: Number(row['Total Spend (€)'] || row['Total Spend'] || 0),
            cpc: Number(row['CPC (€)'] || row['CPC'] || 0),
            atc: Number(row['ATC'] || 0),
            purchases: Number(row['Purchases'] || row['PUR'] || 0),
            budget: Number(row['Budget (€)'] || row['Budget'] || 50),
            date: selectedDate
          };

          return {
            ...product,
            ...calculateRow(product)
          };
        });

        setPreviewData(mappedData);
        setImportStats({
          total: mappedData.length,
          valid: mappedData.filter(p => p.productName && p.price > 0).length,
          invalid: mappedData.filter(p => !p.productName || p.price <= 0).length
        });
        setShowPreviewModal(true);

        toast.success(`${mappedData.length} produtos carregados para preview`);
      } catch (error) {
        console.error('Erro ao processar Excel:', error);
        toast.error('Erro ao processar ficheiro Excel');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
  };

  // Confirm import
  const confirmImport = async () => {
    try {
      if (!dailyRoasService.isAuthenticated()) {
        toast.error('Utilizador não autenticado');
        return;
      }

      await dailyRoasService.saveProductsBatch(previewData, selectedDate);
      setProducts([...products, ...previewData]);
      setShowPreviewModal(false);
      setPreviewData([]);

      // Trigger recálculo de decisões
      triggerDecisionRecalculation();
      
      toast.success(`${previewData.length} produtos importados! Decisões calculadas.`);
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      toast.error('Erro ao importar produtos');
    }
  };

  // Cancel import
  const cancelImport = () => {
    setShowPreviewModal(false);
    setPreviewData([]);
    toast.info('Importação cancelada');
  };

  // Aplicar decisão
  const applyDecision = async (action, targetBudget = null) => {
    try {
      if (!selectedProduct || !selectedDecision) return;

      const validation = validateDecision(selectedDecision, selectedProduct);
      if (!validation.valid) {
        toast.error(`Não é possível aplicar: ${validation.error}`);
        return;
      }

      let updatedProduct = { ...selectedProduct };
      
      if (action === 'SCALE' || action === 'DESCALE') {
        updatedProduct.budget = targetBudget;
      }

      if (action === 'MATAR') {
        updatedProduct.status = 'KILLED';
        updatedProduct.budget = 0;
      }

      await dailyRoasService.saveProduct(updatedProduct);
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      ));

      setShowDecisionModal(false);
      setSelectedProduct(null);
      setSelectedDecision(null);

      await calculateCampaignDecisions();
      toast.success(`Ação ${action} aplicada com sucesso!`);
    } catch (error) {
      console.error('Erro ao aplicar decisão:', error);
      toast.error('Erro ao aplicar decisão');
    }
  };

  // Modal de decisão
  const openDecisionModal = (product) => {
    const decision = campaignDecisions[product.id];
    if (decision) {
      setSelectedProduct(product);
      setSelectedDecision(decision);
      setShowDecisionModal(true);
    }
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const decision = campaignDecisions[product.id];
    const matchesFilter = filterStatus === 'all' || 
                         (decision && decision.action.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Toggle card expansion
  const toggleCardExpansion = (productId) => {
    setExpandedCards(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // UseEffects
  useEffect(() => {
    loadDataForDate(selectedDate);
    // Carregar automaticamente produtos da Quotation sheet
    loadQuotationProductsAutomatically();
  }, [selectedDate]);

  useEffect(() => {
    if (products.length > 0) {
      calculateCampaignDecisions();
    }
  }, [products, selectedDate]);

  // Auto-refresh para análise em tempo real (a cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (products.length > 0) {
        console.log('🔄 Auto-refresh: Recalculando decisões...');
        calculateCampaignDecisions();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [products, selectedDate]);

  // Recalcular decisões sempre que dados são alterados
  const triggerDecisionRecalculation = useCallback(() => {
    if (products.length > 0) {
      console.log('⚡ Trigger: Recalculando decisões instantaneamente...');
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => calculateCampaignDecisions(), 100);
    }
  }, [products, calculateCampaignDecisions]);

  // Função para recalcular decisões (usada em callbacks)
  const recalculateDecisions = useCallback(async () => {
    if (products.length > 0) {
      console.log('🔄 Recalculando decisões...');
      await calculateCampaignDecisions();
    }
  }, [products, calculateCampaignDecisions]);

  // Get decision stats for summary
  const decisionStats = Object.values(campaignDecisions).reduce((acc, decision) => {
    acc[decision.action] = (acc[decision.action] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="daily-roas-new">
      <Toaster position="top-right" />
      
      {/* Header moderno */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-left">
            <div className="page-title">
              <Sparkles className="title-icon" />
              <h1>Daily ROAS Analysis</h1>
              <span className="subtitle">Automação inteligente de campanhas</span>
            </div>
            <div className="date-selector">
              <Calendar size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
          
          <div className="header-actions">
            {/* Ações principais - Excel e Adicionar Produto */}
            <div className="header-actions-main">
              {/* Excel Actions */}
              <div className="excel-actions">
                <label className="btn btn-excel-import">
                  <Upload size={20} />
                  Importar Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={importFromExcel}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button 
                  onClick={exportToExcel}
                  className="btn btn-excel-export"
                  disabled={products.length === 0}
                >
                  <Download size={20} />
                  Exportar Excel
                  {products.length > 0 && (
                    <span className="count-badge">{products.length}</span>
                  )}
                </button>
              </div>

              <div className="divider"></div>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>

              <div className="divider"></div>

              <button 
                onClick={loadConsolidatedData}
                className="btn btn-secondary"
                disabled={isLoadingConsolidated}
              >
                <RefreshCw size={20} className={isLoadingConsolidated ? 'spinning' : ''} />
                {isLoadingConsolidated ? 'Carregando...' : 'Dados Consolidados'}
              </button>

              <button 
                onClick={loadQuotationProductsAutomatically}
                className="btn btn-tertiary"
                disabled={isLoadingConsolidated}
              >
                <FileSpreadsheet size={20} />
                Sincronizar Quotation
              </button>
            </div>

            {/* Ações secundárias - View Toggle e Status */}
            <div className="header-actions-secondary">
              {/* Indicador de sincronização automática */}
              <div className="auto-sync-indicator">
                <div className="sync-status">
                  <div className="sync-dot active"></div>
                  <span>Auto-sync ativo</span>
                </div>
              </div>

              {isRecalculating && (
                <div className="recalculating-indicator">
                  <div className="spinner"></div>
                  <span>Recalculando decisões...</span>
                </div>
              )}
              
              <div className="view-toggle">
                <button 
                  onClick={() => setViewMode('cards')}
                  className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  title="Vista em Cards"
                >
                  <BarChart3 size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  title="Vista em Tabela"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Stats */}
      <motion.div 
        className="dashboard-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">
              <DollarSign />
            </div>
            <div className="stat-content">
              <h3>€{summary.totalRevenue}</h3>
              <p>Receita Total</p>
            </div>
          </div>
          
          <div className="stat-card spend">
            <div className="stat-icon">
              <TrendingDown />
            </div>
            <div className="stat-content">
              <h3>€{summary.totalSpend}</h3>
              <p>Total Spend</p>
            </div>
          </div>
          
          <div className="stat-card roas">
            <div className="stat-icon">
              <Target />
            </div>
            <div className="stat-content">
              <h3>{summary.weightedRoas}</h3>
              <p>ROAS Médio</p>
            </div>
          </div>
          
          <div className="stat-card margin">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <h3>€{summary.totalMarginEur}</h3>
              <p>Margem Total</p>
            </div>
          </div>
        </div>

        {/* Decision Summary */}
        {Object.keys(decisionStats).length > 0 && (
          <div className="decision-summary">
            <h4>
              <Activity size={16} />
              Decisões Automáticas
            </h4>
            <div className="decision-stats">
              {Object.entries(decisionStats).map(([action, count]) => (
                <div key={action} className={`decision-stat ${action.toLowerCase()}`}>
                  <span className="decision-badge">
                    {getDecisionBadgeStyle(action).icon}
                  </span>
                  <span>{action}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Market Info */}
      {marketCPC > 0 && (
        <motion.div 
          className="market-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="market-info">
            <Settings size={18} />
            <div className="market-details">
              <span>Mercado: <strong>
                {marketCPC <= 0.65 ? 'CPC SUPER BAIXO (Portugal)' : 
                 marketCPC <= 0.75 ? 'CPC BAIXO (ES/IT/FR)' : 
                 'CPC NORMAL (UK/DE/CH)'}
              </strong></span>
              <span className="market-cpc">CPC Médio: €{marketCPC.toFixed(3)}</span>
              <span className="budget-info">
                Ladder: [{
                  marketCPC <= 0.65 ? '20, 30, 50, 70, 100, 200, 400' : 
                  marketCPC <= 0.75 ? '30, 50, 70, 100, 200' : 
                  '50, 70, 100, 200, 400'
                }]€
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div 
        className="controls-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Procurar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-tabs">
          {['all', 'matar', 'scale', 'descale', 'manter'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            >
              {status === 'all' ? 'Todos' : status.toUpperCase()}
              {status !== 'all' && decisionStats[status.toUpperCase()] && (
                <span className="count">{decisionStats[status.toUpperCase()]}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="content-area">
        {isLoading ? (
          <motion.div 
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <RefreshCw className="spinning" size={32} />
            <p>Carregando dados...</p>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BarChart3 size={64} />
            <h3>Nenhum produto encontrado</h3>
            <p>Adicione produtos para começar a análise ou importe dados do Excel</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Adicionar Primeiro Produto
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {viewMode === 'cards' ? (
              <motion.div 
                className="products-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    decision={campaignDecisions[product.id]}
                    isExpanded={expandedCards[product.id]}
                    onToggleExpand={() => toggleCardExpansion(product.id)}
                    onUpdate={updateProduct}
                    onDelete={deleteProduct}
                    onOpenDecision={() => openDecisionModal(product)}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <ProductTable 
                products={filteredProducts}
                decisions={campaignDecisions}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
                onOpenDecision={openDecisionModal}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        onAdd={addProduct}
      />

      {/* Decision Modal */}
      <DecisionModal 
        show={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        decision={selectedDecision}
        product={selectedProduct}
        marketCPC={marketCPC}
        onApply={applyDecision}
      />

      {/* Excel Import Preview Modal */}
      <ExcelPreviewModal 
        show={showPreviewModal}
        onClose={cancelImport}
        data={previewData}
        stats={importStats}
        onConfirm={confirmImport}
      />
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, decision, isExpanded, onToggleExpand, onUpdate, onDelete, onOpenDecision, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  const handleEdit = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Object.entries(editValues).forEach(([field, value]) => {
      onUpdate(product.id, field, value);
    });
    setEditValues({});
    setIsEditing(false);
  };

  const getStatusColor = () => {
    if (!decision) return 'default';
    switch(decision.action) {
      case 'KILL': return 'danger';
      case 'SCALE': return 'success';
      case 'DESCALING': return 'warning';
      case 'RUN': return 'success';
      default: return 'default';
    }
  };

  return (
    <motion.div 
      className={`product-card ${getStatusColor()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      layout
    >
      <div className="card-header">
        <div className="product-info">
          <div className="product-title-row">
            <h3>{product.productName}</h3>
            {/* Indicadores de fonte de dados */}
            {product.source === 'integrated' && (
              <div className="data-source-indicators">
                {product.hasCampaignData && (
                  <span className="source-badge campaigns" title="Dados de Campaigns">
                    <Target size={12} />
                    Campaigns
                  </span>
                )}
                {product.hasQuotationData && (
                  <span className="source-badge quotation" title="Dados de Quotation">
                    <FileSpreadsheet size={12} />
                    Quotation
                  </span>
                )}
                {product.dataCompleteness && (
                  <span className={`completeness-badge ${product.dataCompleteness.isComplete ? 'complete' : 'incomplete'}`}>
                    {product.dataCompleteness.percentage}%
                  </span>
                )}
                {product.source === 'quotation-auto' && (
                  <span className="source-badge auto-sync" title="Sincronizado automaticamente da Quotation sheet">
                    <RefreshCw size={12} />
                    Auto
                  </span>
                )}
                {product.source === 'quotation-auto' && product.hasSalesOnDate === false && (
                  <span className="source-badge no-sales" title="Produto sem vendas nesta data">
                    <AlertTriangle size={12} />
                    Sem vendas
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="product-metrics">
            <span className="metric">
              <DollarSign size={14} />
              €{product.price}
            </span>
            <span className="metric">
              <Target size={14} />
              {product.roas || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="card-actions">
          {decision && (
            <button 
              className="decision-badge-btn"
              onClick={onOpenDecision}
              style={{
                color: getDecisionBadgeStyle(decision.action).color,
                backgroundColor: getDecisionBadgeStyle(decision.action).bgColor
              }}
            >
              {getDecisionBadgeStyle(decision.action).icon}
              {decision.action}
            </button>
          )}
          
          <button 
            className="expand-btn"
            onClick={onToggleExpand}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="card-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="detailed-metrics">
              {/* Seção 1: Básicos */}
              <div className="metrics-section">
                <h5>📊 Métricas Básicas</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>Product Name</label>
                    <span>{product.productName}</span>
                  </div>
                  <div className="metric-item">
                    <label>Price (€)</label>
                    <span>€{product.price}</span>
                  </div>
                  <div className="metric-item">
                    <label>COG (€)</label>
                    <span>€{product.cog}</span>
                  </div>
                  <div className="metric-item">
                    <label>Units Sold</label>
                    <span>{product.unitsSold}</span>
                  </div>
                </div>
              </div>

              {/* Seção 2: Spend e Traffic */}
              <div className="metrics-section">
                <h5>💰 Spend & Traffic</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>Total Spend (€)</label>
                    <span>€{product.totalSpend}</span>
                  </div>
                  <div className="metric-item">
                    <label>CPC (€)</label>
                    <span>€{product.cpc || 'N/A'}</span>
                  </div>
                  <div className="metric-item">
                    <label>ATC</label>
                    <span>{product.atc || 'N/A'}</span>
                  </div>
                  <div className="metric-item">
                    <label>Purchases (PUR)</label>
                    <span>{product.purchases || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Seção 3: Performance */}
              <div className="metrics-section">
                <h5>📈 Performance</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>ROAS</label>
                    <span className={product.roas > 2 ? 'positive' : product.roas < 1 ? 'negative' : ''}>
                      {product.roas || 'N/A'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <label>CPA (€)</label>
                    <span>€{product.cpa || 'N/A'}</span>
                  </div>
                  <div className="metric-item">
                    <label>BER</label>
                    <span>{product.ber || 'N/A'}</span>
                  </div>
                  <div className="metric-item">
                    <label>Budget (€)</label>
                    <span>€{product.budget || 50}</span>
                  </div>
                </div>
              </div>

              {/* Seção 4: Valores e Margens */}
              <div className="metrics-section">
                <h5>💎 Valores & Margens</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <label>Store Value (€)</label>
                    <span>€{product.storeValue}</span>
                  </div>
                  <div className="metric-item">
                    <label>Total COG (€)</label>
                    <span>€{product.totalCog}</span>
                  </div>
                  <div className="metric-item">
                    <label>Margin EUR (€)</label>
                    <span className={product.marginEur > 0 ? 'positive' : 'negative'}>
                      €{product.marginEur}
                    </span>
                  </div>
                  <div className="metric-item">
                    <label>Margin %</label>
                    <span className={product.marginPct > 0 ? 'positive' : 'negative'}>
                      {product.marginPct ? (product.marginPct * 100).toFixed(2) + '%' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção 5: Decisão */}
              {decision && (
                <div className="metrics-section decision-section">
                  <h5>🤖 Decisão Automática</h5>
                  <div className="decision-details-expanded">
                    <div className="decision-badge-expanded"
                         style={{
                           color: getDecisionBadgeStyle(decision.action).color,
                           backgroundColor: getDecisionBadgeStyle(decision.action).bgColor
                         }}>
                      {getDecisionBadgeStyle(decision.action).icon} {decision.action}
                      {decision.targetBudget && (
                        <span className="target-budget">→ €{decision.targetBudget}</span>
                      )}
                    </div>
                    <p className="decision-reason">{decision.reason}</p>
                    {decision.avgMarginPct !== undefined && (
                      <p className="decision-metrics">
                        Profit Médio: <span className={decision.avgMarginPct > 0 ? 'positive' : 'negative'}>
                          {decision.avgMarginPct}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="card-footer">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 size={14} />
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
              
              {isEditing && (
                <button 
                  className="btn btn-sm btn-success"
                  onClick={handleSave}
                >
                  <Check size={14} />
                  Guardar
                </button>
              )}
              
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Product Table Component (simplified for now)
const ProductTable = ({ products, decisions, onUpdate, onDelete, onOpenDecision }) => {
  return (
    <motion.div 
      className="products-table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Spend</th>
              <th>ROAS</th>
              <th>Margem</th>
              <th>Decisão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.productName}</td>
                <td>€{product.price}</td>
                <td>€{product.totalSpend}</td>
                <td>{product.roas || 'N/A'}</td>
                <td className={product.marginEur > 0 ? 'positive' : 'negative'}>
                  €{product.marginEur}
                </td>
                <td>
                  {decisions[product.id] && (
                    <button 
                      className="decision-badge-small"
                      onClick={() => onOpenDecision(product)}
                      style={{
                        color: getDecisionBadgeStyle(decisions[product.id].action).color,
                        backgroundColor: getDecisionBadgeStyle(decisions[product.id].action).bgColor
                      }}
                    >
                      {getDecisionBadgeStyle(decisions[product.id].action).icon}
                      {decisions[product.id].action}
                    </button>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Add Product Modal Component
const AddProductModal = ({ show, onClose, newProduct, setNewProduct, onAdd }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content add-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h3>
            <Plus size={20} />
            Adicionar Novo Produto
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nome do Produto</label>
              <input
                type="text"
                value={newProduct.productName}
                onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})}
                placeholder="Nome do produto"
              />
            </div>
            
            <div className="form-group">
              <label>Preço (€)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>COG (€)</label>
              <input
                type="number"
                value={newProduct.cog}
                onChange={(e) => setNewProduct({...newProduct, cog: Number(e.target.value)})}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Total Spend (€)</label>
              <input
                type="number"
                value={newProduct.totalSpend}
                onChange={(e) => setNewProduct({...newProduct, totalSpend: Number(e.target.value)})}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Orçamento (€)</label>
              <input
                type="number"
                value={newProduct.budget}
                onChange={(e) => setNewProduct({...newProduct, budget: Number(e.target.value)})}
                step="1"
              />
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button onClick={onAdd} className="btn btn-primary">
            <Plus size={16} />
            Adicionar Produto
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Decision Modal Component
const DecisionModal = ({ show, onClose, decision, product, marketCPC, onApply }) => {
  if (!show || !decision || !product) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content decision-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h3>
            <Settings size={20} />
            Decisão: {product.productName}
          </h3>
          <div className="decision-badge-large">
            <span 
              className="badge"
              style={{
                color: getDecisionBadgeStyle(decision.action).color,
                backgroundColor: getDecisionBadgeStyle(decision.action).bgColor
              }}
            >
              {getDecisionBadgeStyle(decision.action).icon} {decision.action}
              {decision.targetBudget && ` → €${decision.targetBudget}`}
            </span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="decision-content">
            <div className="section">
              <h4>📋 Análise</h4>
              <p className="reason">{decision.reason}</p>
              <p className="market-info">
                Mercado: <strong>{decision.marketType}</strong> (CPC: €{marketCPC.toFixed(3)})
              </p>
            </div>
            
            <div className="section">
              <h4>📊 Métricas</h4>
              <div className="metrics-display">
                <div className="metric">
                  <span>Spend:</span>
                  <span>€{product.totalSpend}</span>
                </div>
                <div className="metric">
                  <span>ROAS:</span>
                  <span>{product.roas || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span>Margem:</span>
                  <span className={product.marginEur > 0 ? 'positive' : 'negative'}>
                    €{product.marginEur}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            <X size={16} />
            Fechar
          </button>
          
          {decision.action !== 'MANTER' && (
            <button 
              onClick={() => onApply(decision.action, decision.targetBudget)}
              className={`btn ${decision.action === 'MATAR' ? 'btn-danger' : 'btn-success'}`}
            >
              {decision.action === 'MATAR' && <PauseCircle size={16} />}
              {decision.action === 'SCALE' && <TrendingUp size={16} />}
              {decision.action === 'DESCALE' && <TrendingDown size={16} />}
              {decision.action === 'MANTER' && <PlayCircle size={16} />}
              Aplicar {decision.action}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Excel Preview Modal Component
const ExcelPreviewModal = ({ show, onClose, data, stats, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content excel-preview-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h3>
            <FileSpreadsheet size={20} />
            Preview da Importação Excel
          </h3>
          <div className="import-stats">
            <div className="stat-item total">
              <span>Total: {stats.total}</span>
            </div>
            <div className="stat-item valid">
              <span>Válidas: {stats.valid}</span>
            </div>
            <div className="stat-item invalid">
              <span>Inválidas: {stats.invalid}</span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="excel-preview">
            {data.length > 0 ? (
              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th>COG</th>
                      <th>Unidades</th>
                      <th>Spend</th>
                      <th>ROAS</th>
                      <th>Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((product, index) => (
                      <tr key={index} className={!product.productName || product.price <= 0 ? 'invalid' : 'valid'}>
                        <td>{product.productName}</td>
                        <td>€{product.price}</td>
                        <td>€{product.cog}</td>
                        <td>{product.unitsSold}</td>
                        <td>€{product.totalSpend}</td>
                        <td>{product.roas || 'N/A'}</td>
                        <td className={product.marginEur > 0 ? 'positive' : 'negative'}>
                          €{product.marginEur}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <p className="preview-note">
                    Mostrando as primeiras 10 linhas de {data.length} total.
                  </p>
                )}
              </div>
            ) : (
              <div className="no-data">
                <p>Nenhum dado válido encontrado no ficheiro Excel.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            <X size={16} />
            Cancelar
          </button>
          
          {data.length > 0 && stats.valid > 0 && (
            <button onClick={onConfirm} className="btn btn-success">
              <Check size={16} />
              Confirmar Importação ({stats.valid} produtos)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DailyRoasPageNew;
