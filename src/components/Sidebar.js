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
  Loader,
  BarChart3,
  Search,
  FileText
} from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, onSignOut }) => {
  const { hasActivePlan, hasPageAccess, getPlanInfo, loading } = useUserPlan();
  const planInfo = getPlanInfo();

  // Obter itens básicos que sempre devem aparecer
  const getBasicMenuItems = () => [
    {
      group: 'Principal',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home,
          alwaysVisible: true
        }
      ]
    },
    {
      group: 'Configurações',
      items: [
        { 
          id: 'subscription', 
          label: 'Subscription', 
          icon: Crown,
          alwaysVisible: true,
          badge: 'Upgrade'
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
        }
      ]
    },
    {
      group: 'Sistema',
      items: [
        { 
          id: 'sign-out', 
          label: 'Sign Out', 
          icon: LogOut,
          alwaysVisible: true
        }
      ]
    }
  ];

  // Função para lidar com cliques nos itens do menu
  const handleItemClick = (itemId) => {
    if (itemId === 'sign-out') {
      onSignOut();
    } else {
      onPageChange(itemId);
    }
  };

  // Se está carregando, mostrar sidebar básica com menu funcional
  if (loading) {
    const basicMenuItems = getBasicMenuItems();
    
    return (
      <div className="sidebar">
        <div className="sidebar-content">
          {/* Logo/Header */}
          <div className="sidebar-header">
            <img 
              src="/logo/sheet-tools-logo-backgroundremover.png" 
              alt="Sheet Tools" 
              className="sidebar-logo"
            />
          </div>

          {/* Plan Info - Loading */}
          <div className="plan-info">
            <div className="plan-badge">
              <Crown size={16} />
              <span>Carregando...</span>
            </div>
          </div>

          {/* Menu Básico */}
          <nav className="sidebar-nav">
            {basicMenuItems.map((group, groupIndex) => (
              <div key={groupIndex} className="nav-group">
                <div className="nav-group-title">{group.group}</div>
                <ul className="nav-items">
                  {group.items.map((item) => (
                    <li key={item.id} className="nav-item">
                      <button
                        className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <item.icon size={20} />
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer info */}
          <div className="sidebar-footer">
            <div className="upgrade-prompt">
              <div className="upgrade-card" onClick={() => onPageChange('subscription')}>
                <Crown size={20} />
                <div>
                  <p className="upgrade-title">Upgrade Agora</p>
                  <p className="upgrade-subtitle">Desbloqueia todas as funcionalidades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Definir itens do menu dinamicamente baseado no plano
  const getMenuItems = () => {
    const menuItems = [
      {
        group: 'Principal',
        items: [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: Home,
            alwaysVisible: true
          }
        ]
      }
    ];

    const featureItems = [];

    // Adicionar funcionalidades baseadas no plano
    if (hasPageAccess('daily-roas')) {
      featureItems.push({
        id: 'daily-roas', 
        label: 'Daily ROAS', 
        icon: TrendingUp,
        feature: 'Daily ROAS Profit Sheet'
      });
    }

    if (hasPageAccess('profit-sheet')) {
      featureItems.push({
        id: 'profit-sheet', 
        label: 'Profit Sheet', 
        icon: FileText,
        feature: 'Daily ROAS Profit Sheet'
      });
    }

    if (hasPageAccess('quotation')) {
      featureItems.push({
        id: 'quotation', 
        label: 'Quotation', 
        icon: DollarSign,
        feature: 'Quotation'
      });
    }

    if (hasPageAccess('campaigns')) {
      featureItems.push({
        id: 'campaigns', 
        label: 'Campaigns', 
        icon: Target,
        feature: 'Campaigns'
      });
    }

    if (hasPageAccess('product-research')) {
      featureItems.push({
        id: 'product-research', 
        label: 'Product Research', 
        icon: Search,
        feature: 'Product Research'
      });
    }

    // Adicionar seção de funcionalidades se houver alguma
    if (featureItems.length > 0) {
      menuItems.push({
        group: 'Funcionalidades',
        items: featureItems
      });
    }

    // Adicionar seção de configurações
    menuItems.push({
      group: 'Configurações',
      items: [
        { 
          id: 'subscription', 
          label: 'Subscription', 
          icon: Crown,
          alwaysVisible: true,
          badge: !hasActivePlan ? 'Upgrade' : planInfo.name
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
        }
      ]
    });

    // Adicionar sign out
    menuItems.push({
      group: 'Sistema',
      items: [
        { 
          id: 'sign-out', 
          label: 'Sign Out', 
          icon: LogOut,
          alwaysVisible: true
        }
      ]
    });

    return menuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Logo/Header */}
        <div className="sidebar-header">
          <img 
            src="/logo/sheet-tools-logo-backgroundremover.png" 
            alt="Sheet Tools" 
            className="sidebar-logo"
          />
        </div>

        {/* Plan Info */}
        <div className="plan-info">
          <div className="plan-badge">
            <Crown size={16} />
            <span>{planInfo.name}</span>
          </div>
          {planInfo.status === 'trialing' && planInfo.trialEnd && (
            <div className="trial-info">
              Trial até {new Date(planInfo.trialEnd).toLocaleDateString('pt-PT')}
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="nav-group">
              <div className="nav-group-title">{group.group}</div>
              <ul className="nav-items">
                {group.items.map((item) => (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <item.icon size={20} />
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="sidebar-footer">
          <div className="upgrade-prompt">
            {!hasActivePlan ? (
              <div className="upgrade-card" onClick={() => onPageChange('subscription')}>
                <Crown size={20} />
                <div>
                  <p className="upgrade-title">Upgrade Agora</p>
                  <p className="upgrade-subtitle">Desbloqueia todas as funcionalidades</p>
                </div>
              </div>
            ) : (
              <div className="plan-features">
                <p className="features-title">Funcionalidades ativas:</p>
                <ul className="features-list">
                  {planInfo.features.slice(0, 2).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                  {planInfo.features.length > 2 && (
                    <li>+{planInfo.features.length - 2} mais...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;