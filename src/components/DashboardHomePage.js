import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  ArrowRight,
  Award,
  Calendar,
  ShoppingCart,
  Megaphone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import OnboardingTutorial from './OnboardingTutorial';
import PageHeader from './PageHeader';
import authService from '../services/authService';

const DashboardHomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se deve mostrar o onboarding (simulando primeira visita)
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
      
      // Para teste - sempre mostrar o onboarding
      setShowOnboarding(true);

      setStats([
        {
          title: 'ROAS Total',
          value: '3.2x',
          change: '+12.5%',
          icon: TrendingUp,
          color: 'success'
        },
        {
          title: 'Receita Total',
          value: '€45.2k',
          change: '+8.3%',
          icon: DollarSign,
          color: 'primary'
        },
        {
          title: 'Campanhas Ativas',
          value: '12',
          change: '+2',
          icon: Target,
          color: 'warning'
        },
        {
          title: 'Conversões',
          value: '1.2k',
          change: '+15.7%',
          icon: Users,
          color: 'info'
        }
      ]);

      setQuickActions([
        {
          title: 'Campanhas',
          description: 'Gerir campanhas ativas do Facebook Ads',
          icon: Megaphone,
          route: 'campaigns'
        },
        {
          title: 'Produtos',
          description: 'Gerir catálogo de produtos',
          icon: ShoppingCart,
          route: 'quotation'
        },
        {
          title: 'Daily ROAS',
          description: 'Acompanhar retorno diário',
          icon: Calendar,
          route: 'daily-roas'
        },
        {
          title: 'Relatórios',
          description: 'Análises e métricas detalhadas',
          icon: BarChart3,
          route: 'reports'
        }
      ]);

      setRecentActivity([
        {
          type: 'campaign',
          title: 'Campanha "Produto A" atualizada',
          time: '2 horas atrás',
          status: 'success'
        },
        {
          type: 'analysis',
          title: 'Análise de ROAS concluída',
          time: '4 horas atrás',
          status: 'info'
        },
        {
          type: 'product',
          title: 'Novo produto adicionado',
          time: '6 horas atrás',
          status: 'warning'
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        {/* Linhas Animadas de Fundo */}
        <div className="animated-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
          <div className="line line-4"></div>
          <div className="line line-5"></div>
          <div className="line line-6"></div>
        </div>
        
        {/* Círculos Flutuantes */}
        <div className="floating-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
          <div className="circle circle-5"></div>
          <div className="circle circle-6"></div>
          <div className="circle circle-7"></div>
          <div className="circle circle-8"></div>
        </div>

        {/* Container do conteúdo */}
        <div className="loading-content">
          {/* Container da animação do logo */}
          <div className="loading-animation">
            {/* Logo animado */}
            <div className="loading-logo">
              <img 
                src="/logo/sheet-tools-logo-backgroundremover.png" 
                alt="Sheet Tools" 
              />
            </div>
            
            {/* Trilha/linha de fundo */}
            <div className="loading-track"></div>
            
            {/* Linha de progresso */}
            <div className="loading-progress"></div>
          </div>

          {/* Mensagem */}
          <p className="loading-message">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      {/* Header */}
      <PageHeader 
        title="Dashboard"
        subtitle="Gerencie suas campanhas e maximize seus resultados"
        showProfile={true}
      />

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <div className={`stat-icon ${stat.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="stat-change">
                    <span className={`change-text ${stat.change.includes('+') ? 'positive' : 'negative'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2 className="section-title">Ferramentas Rápidas</h2>
          <p className="section-description">Acesse suas ferramentas mais utilizadas</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                className="quick-action-card"
                onClick={() => console.log(`Navegando para: ${action.route}`)}
              >
                <div className="action-icon">
                  <IconComponent size={28} />
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <ArrowRight size={20} className="action-arrow" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="section-header">
          <h2 className="section-title">Atividade Recente</h2>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-status ${activity.status}`}></div>
              <div className="activity-content">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="performance-section">
        <div className="section-header">
          <h2 className="section-title">Visão Geral de Performance</h2>
        </div>
        <div className="performance-card">
          <div className="performance-header">
            <h3>ROAS dos Últimos 7 Dias</h3>
            <div className="performance-badge">
              <Award size={16} />
              <span>Excelente</span>
            </div>
          </div>
          <div className="performance-chart">
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Gráfico de performance será exibido aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;