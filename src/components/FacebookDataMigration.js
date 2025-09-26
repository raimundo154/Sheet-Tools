import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Database, Upload } from 'lucide-react';
import facebookCampaignsService from '../services/facebookCampaignsService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const FacebookDataMigration = ({ onMigrationComplete }) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [localStorageData, setLocalStorageData] = useState(null);

  // Verificar dados no localStorage
  const checkLocalStorageData = () => {
    const campaigns = userService.getUserData('campaigns') || [];
    const connectionData = userService.getUserData('connection_data');
    
    setLocalStorageData({
      campaigns: campaigns.length,
      hasConnection: !!connectionData,
      campaignsList: campaigns
    });
  };

  // Executar migração
  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationStatus('migrating');
      
      toast.loading('Migrando dados do Facebook...', { id: 'migration' });
      
      const migratedCount = await facebookCampaignsService.migrateFromLocalStorage();
      
      if (migratedCount > 0) {
        setMigrationStatus('success');
        toast.success(`${migratedCount} campanhas migradas com sucesso!`, { id: 'migration' });
        
        if (onMigrationComplete) {
          onMigrationComplete(migratedCount);
        }
      } else {
        setMigrationStatus('no-data');
        toast('Nenhuma campanha encontrada para migrar', { id: 'migration' });
      }
      
    } catch (error) {
      console.error('Erro na migração:', error);
      setMigrationStatus('error');
      toast.error('Erro ao migrar dados: ' + error.message, { id: 'migration' });
    } finally {
      setIsMigrating(false);
    }
  };

  // Verificar dados automaticamente ao carregar
  React.useEffect(() => {
    checkLocalStorageData();
  }, []);

  return (
    <motion.div 
      className="migration-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="migration-header">
        <Database size={24} />
        <h3>Migração de Dados do Facebook</h3>
      </div>

      <div className="migration-content">
        <div className="migration-info">
          <p>
            Os dados das suas campanhas do Facebook estão atualmente armazenados no navegador. 
            Para melhorar a sincronização e permitir acesso de múltiplos dispositivos, 
            vamos migrar estes dados para a base de dados.
          </p>
        </div>

        {localStorageData && (
          <div className="data-status">
            <div className="status-item">
              <span className="label">Campanhas no navegador:</span>
              <span className="value">{localStorageData.campaigns}</span>
            </div>
            <div className="status-item">
              <span className="label">Conexão Facebook:</span>
              <span className={`value ${localStorageData.hasConnection ? 'connected' : 'disconnected'}`}>
                {localStorageData.hasConnection ? 'Conectada' : 'Não conectada'}
              </span>
            </div>
          </div>
        )}

        {localStorageData?.campaigns > 0 && (
          <div className="campaigns-preview">
            <h4>Campanhas encontradas:</h4>
            <div className="campaigns-list">
              {localStorageData.campaignsList.slice(0, 5).map((campaign, index) => (
                <div key={index} className="campaign-item">
                  <span className="campaign-name">{campaign.name}</span>
                  <span className="campaign-days">{campaign.days?.length || 0} dias</span>
                </div>
              ))}
              {localStorageData.campaignsList.length > 5 && (
                <div className="more-campaigns">
                  +{localStorageData.campaignsList.length - 5} mais campanhas
                </div>
              )}
            </div>
          </div>
        )}

        <div className="migration-actions">
          {migrationStatus === 'success' ? (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>Migração concluída com sucesso!</span>
            </div>
          ) : migrationStatus === 'error' ? (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>Erro na migração. Tente novamente.</span>
            </div>
          ) : migrationStatus === 'no-data' ? (
            <div className="info-message">
              <AlertCircle size={20} />
              <span>Nenhuma campanha encontrada para migrar.</span>
            </div>
          ) : (
            <button 
              onClick={handleMigration}
              disabled={isMigrating || !localStorageData?.campaigns}
              className="btn btn-primary migration-btn"
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="spinning" size={20} />
                  Migrando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Migrar Dados
                </>
              )}
            </button>
          )}
        </div>

        <div className="migration-benefits">
          <h4>Benefícios da migração:</h4>
          <ul>
            <li>✅ Sincronização automática com dados de vendas</li>
            <li>✅ Acesso de múltiplos dispositivos</li>
            <li>✅ Backup automático dos dados</li>
            <li>✅ Melhor performance na análise</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default FacebookDataMigration;

