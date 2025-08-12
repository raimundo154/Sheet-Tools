import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import dailyRoasService from '../services/dailyRoasService';
import { 
  Calendar, 
  Plus, 
  Download, 
  Upload, 
  Save, 
  Edit3, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  FileSpreadsheet,
  Eye,
  Check,
  X
} from 'lucide-react';
import './DailyRoasPage.css';

const DailyRoasPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [summary, setSummary] = useState({
    totalSpend: '0.00',
    totalRevenue: '0.00',
    totalMarginEur: '0.00',
    weightedRoas: '0.0000'
  });

  // Calculation functions
  const calculateRow = (row) => {
    const price = Number(row.price) || 0;
    const cog = Number(row.cog) || 0;
    const unitsSold = Number(row.unitsSold) || 0;
    const totalSpend = Number(row.totalSpend) || 0;
    const purchases = Number(row.purchases) || 0;

    const totalCog = +(cog * unitsSold).toFixed(2);
    const storeValue = +(price * unitsSold).toFixed(2);
    const marginBruta = +(price - cog).toFixed(2);
    const ber = marginBruta > 0 ? +(price / marginBruta).toFixed(4) : null;

    const roas = totalSpend > 0 ? +(storeValue / totalSpend).toFixed(4) : null;
    const cpa = purchases > 0 ? +(totalSpend / purchases).toFixed(2) : null;

    const marginEur = +(storeValue - totalCog - totalSpend).toFixed(2);
    const marginPct = storeValue > 0 ? +(marginEur / storeValue).toFixed(4) : null;

    return {
      ...row,
      totalCog,
      storeValue,
      marginBruta,
      ber,
      roas,
      cpa,
      marginEur,
      marginPct
    };
  };

  // Load summary from Supabase
  const loadSummary = async (date) => {
    try {
      const summaryData = await dailyRoasService.getDailySummary(date);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      // Usar resumo padrão em caso de erro
      setSummary({
        totalSpend: '0.00',
        totalRevenue: '0.00',
        totalMarginEur: '0.00',
        weightedRoas: '0.0000'
      });
    }
  };

  // Load data for selected date from Supabase
  const loadDataForDate = async (date) => {
    setIsLoading(true);
    try {
      // Verificar se está autenticado
      const isAuth = await dailyRoasService.isAuthenticated();
      if (!isAuth) {
        toast.error('Utilizador não autenticado');
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Carregar produtos da base de dados
      const productsData = await dailyRoasService.getProductsByDate(date);
      setProducts(productsData);
      
      // Carregar resumo
      await loadSummary(date);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da base de dados');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save data for current date to Supabase
  const saveDataForDate = async () => {
    setIsSaving(true);
    try {
      // Verificar se está autenticado
      const isAuth = await dailyRoasService.isAuthenticated();
      if (!isAuth) {
        toast.error('Utilizador não autenticado');
        setIsSaving(false);
        return;
      }

      if (products.length === 0) {
        toast.warning('Nenhum produto para salvar');
        setIsSaving(false);
        return;
      }

      // Salvar todos os produtos em batch
      const savedCount = await dailyRoasService.saveProductsBatch(products, selectedDate);
      
      // Recarregar resumo
      await loadSummary(selectedDate);
      
      toast.success(`${savedCount} produtos salvos na base de dados!`);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados na base de dados');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new product row
  const addNewProduct = () => {
    const newProduct = {
      id: Date.now(),
      date: selectedDate,
      productId: '',
      productName: '',
      price: 0,
      cog: 0,
      unitsSold: 0,
      totalSpend: 0,
      cpc: 0,
      atc: 0,
      purchases: 0,
      source: 'manual'
    };
    setProducts([...products, calculateRow(newProduct)]);
  };

  // Update product field and auto-save
  const updateProduct = async (id, field, value) => {
    // Atualizar estado local primeiro
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value, source: 'manual' };
        return calculateRow(updatedProduct);
      }
      return product;
    });
    setProducts(updatedProducts);

    // Auto-save na base de dados
    try {
      const productToSave = updatedProducts.find(p => p.id === id);
      if (productToSave) {
        await dailyRoasService.saveProduct(productToSave);
        // Recarregar resumo
        await loadSummary(selectedDate);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar alteração');
    }
  };

  // Delete product from Supabase
  const deleteProduct = async (id) => {
    try {
      // Remover da base de dados
      await dailyRoasService.deleteProduct(id);
      
      // Atualizar estado local
      setProducts(products.filter(product => product.id !== id));
      
      // Recarregar resumo
      await loadSummary(selectedDate);
      
      toast.success('Produto eliminado com sucesso');
    } catch (error) {
      console.error('Erro ao eliminar produto:', error);
      toast.error('Erro ao eliminar produto');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Product Name', 'Price', 'COG', 'Units Sold', 'Total Spend', 'CPC', 'ATC', 'Purchases',
      'Store Value', 'Total COG', 'ROAS', 'CPA', 'Margin EUR', 'Margin %', 'BER'
    ];

    const csvData = products.map(p => [
      p.productName,
      p.price,
      p.cog,
      p.unitsSold,
      p.totalSpend,
      p.cpc,
      p.atc,
      p.purchases,
      p.storeValue,
      p.totalCog,
      p.roas || '',
      p.cpa || '',
      p.marginEur,
      p.marginPct || '',
      p.ber || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-roas-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import from CSV
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const importedProducts = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          return {
            id: Date.now() + index,
            date: selectedDate,
            productName: values[0] || '',
            price: Number(values[1]) || 0,
            cog: Number(values[2]) || 0,
            unitsSold: Number(values[3]) || 0,
            totalSpend: Number(values[4]) || 0,
            cpc: Number(values[5]) || 0,
            atc: Number(values[6]) || 0,
            purchases: Number(values[7]) || 0,
            source: 'imported'
          };
        })
        .map(calculateRow);

      setProducts(importedProducts);
    };
    reader.readAsText(file);
  };

  // Column mapping from Excel headers to our data model
  const excelColumnMapping = {
    'Product Name': 'productName',
    'Total Spend': 'totalSpend',
    'CPC': 'cpc',
    'ATC': 'atc',
    'PUR': 'purchases',
    'PRICE': 'price',
    'COG': 'cog',
    'UNITS SOLD': 'unitsSold',
    'Margin': 'marginBruta', // Will be recalculated
    'TOTAL COG': 'totalCog', // Will be recalculated
    'Store Value': 'storeValue', // Will be recalculated
    'MARGIN EUR': 'marginEur', // Will be recalculated
    'MARGIN PROFIT': 'marginPct', // Will be recalculated
    'BER': 'ber', // Will be recalculated
    'ROAS': 'roas', // Will be recalculated
    'CPA': 'cpa' // Will be recalculated
  };

  // Import from Excel
  const importFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: null });

        if (data.length === 0) {
          toast.error('Ficheiro Excel vazio ou sem dados válidos');
          return;
        }

        // Validate required columns
        const firstRow = data[0];
        const requiredColumns = ['Product Name', 'PRICE', 'COG', 'UNITS SOLD', 'Total Spend'];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          toast.error(`Colunas obrigatórias em falta: ${missingColumns.join(', ')}`);
          return;
        }

        // Map and validate data
        let validCount = 0;
        let invalidCount = 0;

        const mappedData = data.map((row, index) => {
          try {
            // Extract base fields (only the ones we can import)
            const baseRow = {
              id: Date.now() + index,
              date: selectedDate,
              productName: String(row['Product Name'] || '').trim(),
              price: Number(row['PRICE']) || 0,
              cog: Number(row['COG']) || 0,
              unitsSold: Number(row['UNITS SOLD']) || 0,
              totalSpend: Number(row['Total Spend']) || 0,
              cpc: Number(row['CPC']) || 0,
              atc: Number(row['ATC']) || 0,
              purchases: Number(row['PUR']) || 0,
              source: 'excel-import'
            };

            // Validate required fields
            if (!baseRow.productName || baseRow.price <= 0) {
              invalidCount++;
              return null;
            }

            validCount++;
            // Calculate all derived fields
            return calculateRow(baseRow);
          } catch (error) {
            console.error('Erro ao processar linha:', error);
            invalidCount++;
            return null;
          }
        }).filter(Boolean); // Remove null entries

        if (mappedData.length === 0) {
          toast.error('Nenhuma linha válida encontrada no ficheiro');
          return;
        }

        // Set preview data and show modal
        setPreviewData(mappedData);
        setImportStats({
          total: data.length,
          valid: validCount,
          invalid: invalidCount
        });
        setShowPreviewModal(true);

        toast.success(`Ficheiro processado: ${validCount} linhas válidas de ${data.length} total`);

      } catch (error) {
        console.error('Erro ao ler ficheiro Excel:', error);
        toast.error('Erro ao processar ficheiro Excel. Verifique o formato.');
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Confirm import and save to Supabase
  const confirmImport = async () => {
    setShowPreviewModal(false);
    setIsSaving(true);
    
    try {
      // Verificar se está autenticado
      const isAuth = await dailyRoasService.isAuthenticated();
      if (!isAuth) {
        toast.error('Utilizador não autenticado');
        setPreviewData([]);
        setIsSaving(false);
        return;
      }

      // Salvar na base de dados
      const savedCount = await dailyRoasService.saveProductsBatch(previewData, selectedDate);
      
      // Atualizar estado local
      setProducts(previewData);
      
      // Recarregar resumo
      await loadSummary(selectedDate);
      
      toast.success(`${savedCount} produtos importados e salvos na base de dados!`);
    } catch (error) {
      console.error('Erro ao salvar importação:', error);
      toast.error('Erro ao salvar dados importados');
    } finally {
      setPreviewData([]);
      setIsSaving(false);
    }
  };

  // Cancel import
  const cancelImport = () => {
    setShowPreviewModal(false);
    setPreviewData([]);
    toast.info('Importação cancelada');
  };

  // Load data when date changes
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="daily-roas-page">
      <div className="container">
        {/* Header */}
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Daily ROAS Analysis</h1>
          <p>Gerir métricas diárias por produto e calcular ROAS, CPA e margens automaticamente</p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="controls-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="date-picker-container">
            <Calendar size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>

          <div className="action-buttons">
            <button onClick={addNewProduct} className="btn btn-primary">
              <Plus size={16} />
              Adicionar Produto
            </button>
            <button 
              onClick={saveDataForDate} 
              className="btn btn-success"
              disabled={isSaving || isLoading}
            >
              <Save size={16} />
              {isSaving ? 'A Salvar...' : 'Salvar Dia'}
            </button>
            <button onClick={exportToCSV} className="btn btn-secondary">
              <Download size={16} />
              Export CSV
            </button>
            <label className="btn btn-secondary">
              <Upload size={16} />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                style={{ display: 'none' }}
              />
            </label>
            <label className="btn btn-excel">
              <FileSpreadsheet size={16} />
              Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          className="summary-cards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="summary-card">
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <h3>Total Spend</h3>
              <p>€{summary.totalSpend}</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <p>€{summary.totalRevenue}</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <Target size={24} />
            </div>
            <div className="card-content">
              <h3>ROAS Médio</h3>
              <p>{summary.weightedRoas}</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <BarChart3 size={24} />
            </div>
            <div className="card-content">
              <h3>Margin Total</h3>
              <p>€{summary.totalMarginEur}</p>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div 
          className="table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price (€)</th>
                  <th>COG (€)</th>
                  <th>Units Sold</th>
                  <th>Store Value (€)</th>
                  <th>Total Spend (€)</th>
                  <th>CPC (€)</th>
                  <th>ATC</th>
                  <th>Purchases</th>
                  <th>ROAS</th>
                  <th>CPA (€)</th>
                  <th>Margin (€)</th>
                  <th>Margin (%)</th>
                  <th>BER</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) => updateProduct(product.id, 'productName', e.target.value)}
                        className="table-input"
                        placeholder="Nome do produto"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={product.cog}
                        onChange={(e) => updateProduct(product.id, 'cog', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.unitsSold}
                        onChange={(e) => updateProduct(product.id, 'unitsSold', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td className="calculated-field">€{product.storeValue}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={product.totalSpend}
                        onChange={(e) => updateProduct(product.id, 'totalSpend', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={product.cpc}
                        onChange={(e) => updateProduct(product.id, 'cpc', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.atc}
                        onChange={(e) => updateProduct(product.id, 'atc', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.purchases}
                        onChange={(e) => updateProduct(product.id, 'purchases', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td className={`calculated-field ${product.roas && product.roas > 2.5 ? 'positive' : product.roas && product.roas < 1 ? 'negative' : ''}`}>
                      {product.roas || 'N/A'}
                    </td>
                    <td className="calculated-field">€{product.cpa || 'N/A'}</td>
                    <td className={`calculated-field ${product.marginEur > 0 ? 'positive' : 'negative'}`}>
                      €{product.marginEur}
                    </td>
                    <td className="calculated-field">
                      {product.marginPct ? (product.marginPct * 100).toFixed(2) + '%' : 'N/A'}
                    </td>
                    <td className="calculated-field">{product.ber || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="btn-delete"
                        title="Eliminar produto"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <p>Nenhum produto adicionado para {selectedDate}</p>
              <button onClick={addNewProduct} className="btn btn-primary">
                <Plus size={16} />
                Adicionar Primeiro Produto
              </button>
            </div>
          )}
        </motion.div>

        {/* Validation Warnings */}
        {products.some(p => p.marginEur < 0 || (p.cog > p.price)) && (
          <motion.div 
            className="warnings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="warning-card">
              <AlertTriangle size={20} />
              <div>
                <h4>Avisos de Validação</h4>
                <ul>
                  {products.filter(p => p.marginEur < 0).map(p => (
                    <li key={p.id}>
                      {p.productName || 'Produto sem nome'}: Margem negativa (€{p.marginEur})
                    </li>
                  ))}
                  {products.filter(p => p.cog > p.price).map(p => (
                    <li key={p.id}>
                      {p.productName || 'Produto sem nome'}: COG superior ao preço de venda
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Excel Import Preview Modal */}
        {showPreviewModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <h3>
                  <Eye size={20} />
                  Preview da Importação Excel
                </h3>
                <div className="import-stats">
                  <span className="stat-item">
                    <strong>Total:</strong> {importStats.total}
                  </span>
                  <span className="stat-item valid">
                    <strong>Válidas:</strong> {importStats.valid}
                  </span>
                  {importStats.invalid > 0 && (
                    <span className="stat-item invalid">
                      <strong>Inválidas:</strong> {importStats.invalid}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-body">
                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Price (€)</th>
                        <th>COG (€)</th>
                        <th>Units Sold</th>
                        <th>Total Spend (€)</th>
                        <th>ROAS</th>
                        <th>Margin (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((product, index) => (
                        <tr key={index}>
                          <td>{product.productName}</td>
                          <td>€{product.price}</td>
                          <td>€{product.cog}</td>
                          <td>{product.unitsSold}</td>
                          <td>€{product.totalSpend}</td>
                          <td className={product.roas && product.roas > 2.5 ? 'positive' : product.roas && product.roas < 1 ? 'negative' : ''}>
                            {product.roas || 'N/A'}
                          </td>
                          <td className={product.marginEur > 0 ? 'positive' : 'negative'}>
                            €{product.marginEur}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 10 && (
                    <p className="preview-note">
                      Mostrando as primeiras 10 linhas de {previewData.length} total.
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  onClick={cancelImport}
                  className="btn btn-secondary"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button 
                  onClick={confirmImport}
                  className="btn btn-success"
                >
                  <Check size={16} />
                  Confirmar Importação
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(9, 22, 24, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default DailyRoasPage;
