import React from 'react';
import { useUserPlan } from '../hooks/useUserPlan';
import { 
  Home, 
  DollarSign, 
  Settings, 
  LogOut, 
  Crown,
  Target,
  TrendingUp,
  BarChart3,
  Search,
  FileText
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentPage, onPageChange, onSignOut }) => {
  const { hasActivePlan, hasPageAccess, getPlanInfo, loading } = useUserPlan();
  const planInfo = getPlanInfo();
  
  console.log('🔍 New Sidebar - Current page:', currentPage);
  console.log('🔍 New Sidebar - Has active plan:', hasActivePlan);
  console.log('🔍 New Sidebar - Plan info:', planInfo);
  console.log('🔍 New Sidebar - Loading:', loading);

  // Definir todos os itens do menu com suas condições
  const menuItems = [
    // SEMPRE VISÍVEIS (todos os users)
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      alwaysVisible: true
    },
    {
      id: 'subscription', 
      label: 'Subscription',
      icon: Crown,
      badge: hasActivePlan ? planInfo.name : 'Upgrade',
      alwaysVisible: true
    },
    {
      id: 'rank-up',
      label: 'Rank Up', 
      icon: BarChart3,
      alwaysVisible: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      alwaysVisible: true
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      icon: LogOut,
      alwaysVisible: true
    },
    
    // PLANO BEGINNER+ (Beginner - Daily ROAS básico)
    {
      id: 'daily-roas',
      label: 'Daily ROAS',
      icon: TrendingUp,
      requiredFeature: 'Daily ROAS básico'
    },
    
    // PLANO BASIC+ (Basic - Daily ROAS Profit Sheet)
    {
      id: 'profit-sheet',
      label: 'Profit Sheet', 
      icon: FileText,
      requiredFeature: 'Daily ROAS Profit Sheet'
    },
    
    // PLANO STANDARD+ (Standard - adiciona Quotation)
    {
      id: 'quotation',
      label: 'Quotation',
      icon: DollarSign,
      requiredFeature: 'Quotation'
    },
    
    // PLANO STANDARD+ (Standard, Expert)
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Target,
      requiredFeature: 'Campaigns'
    },
    
    // PLANO EXPERT (Expert apenas)
    {
      id: 'product-research',
      label: 'Product Research',
      icon: Search,
      requiredFeature: 'Product Research'
    }
  ];

  // Filtrar itens baseado no plano
  const getVisibleItems = () => {
    if (loading) {
      // Durante loading, mostrar apenas itens sempre visíveis
      return menuItems.filter(item => item.alwaysVisible);
    }

    return menuItems.filter(item => {
      // Sempre mostrar itens básicos
      if (item.alwaysVisible) return true;
      
      // Se não tem plano ativo, não mostrar features
      if (!hasActivePlan) return false;
      
      // Verificar se tem a feature necessária
      if (item.requiredFeature) {
        return hasPageAccess(item.id);
      }
      
      return true;
    });
  };

  const visibleItems = getVisibleItems();

  const handleItemClick = (itemId) => {
    if (itemId === 'sign-out') {
      onSignOut();
    } else {
      onPageChange(itemId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h1>Sheet Tools</h1>
          </div>
        </div>

        {/* Plan Status */}
        <div className="plan-status">
          <div className="plan-badge">
            <Crown size={16} />
            <span>{loading ? 'Carregando...' : planInfo.name}</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {visibleItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <item.icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Info */}
        {!hasActivePlan && !loading && (
          <div className="sidebar-footer">
            <div className="upgrade-prompt" onClick={() => onPageChange('subscription')}>
              <Crown size={20} />
              <div>
                <p className="upgrade-title">Upgrade Agora</p>
                <p className="upgrade-subtitle">Desbloqueia todas as funcionalidades</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
