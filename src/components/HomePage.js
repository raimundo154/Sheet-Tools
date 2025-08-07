import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  ArrowRight,
  Play,
  BookOpen,
  Award,
  Search
} from 'lucide-react';

const HomePage = () => {
  const stats = [
    {
      title: 'ROAS Total',
      value: '3.2x',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.2k',
      change: '+8.3%',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      title: 'Campanhas Ativas',
      value: '12',
      change: '+2',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'Conversões',
      value: '1.2k',
      change: '+15.7%',
      icon: Users,
      color: 'text-orange-500'
    }
  ];

  const quickActions = [
    {
      title: 'Nova Campanha',
      description: 'Criar uma nova campanha do zero',
      icon: Play,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      action: () => console.log('Nova campanha')
    },
    {
      title: 'Análise de Produtos',
      description: 'Pesquisar e analisar produtos',
      icon: Search,
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
      action: () => console.log('Análise de produtos')
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios detalhados',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      action: () => console.log('Relatórios')
    },
    {
      title: 'Tutoriais',
      description: 'Aprender com nossos guias',
      icon: BookOpen,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      action: () => console.log('Tutoriais')
    }
  ];

  const recentActivity = [
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
  ];

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div>
          <h1 className="home-title">Bem-vindo de volta!</h1>
          <p className="home-subtitle">
            Gerencie suas campanhas e maximize seus resultados
          </p>
        </div>
        <div className="user-profile">
          <div className="profile-avatar">
            <span>t</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
                  <span className="change-text">{stat.change}</span>
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

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                className="quick-action-card"
                onClick={action.action}
              >
                <div className={`action-icon ${action.color}`}>
                  <IconComponent size={24} />
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
        <h2 className="section-title">Atividade Recente</h2>
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
        <h2 className="section-title">Visão Geral de Performance</h2>
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

export default HomePage;
