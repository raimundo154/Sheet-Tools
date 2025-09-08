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
    // Simulate data loading
    const loadDashboardData = async () => {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if onboarding should be shown (simulating first visit)
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
      
      // For testing - always show onboarding
      setShowOnboarding(true);

      setStats([
        {
          title: 'Total ROAS',
          value: '3.2x',
          change: '+12.5%',
          icon: TrendingUp,
          color: 'success'
        },
        {
          title: 'Total Revenue',
          value: '€45.2k',
          change: '+8.3%',
          icon: DollarSign,
          color: 'primary'
        },
        {
          title: 'Active Campaigns',
          value: '12',
          change: '+2',
          icon: Target,
          color: 'warning'
        },
        {
          title: 'Conversions',
          value: '1.2k',
          change: '+15.7%',
          icon: Users,
          color: 'info'
        }
      ]);

      setQuickActions([
        {
          title: 'Campaigns',
          description: 'Manage active Facebook Ads campaigns',
          icon: Megaphone,
          route: 'campaigns'
        },
        {
          title: 'Products',
          description: 'Manage product catalog',
          icon: ShoppingCart,
          route: 'quotation'
        },
        {
          title: 'Daily ROAS',
          description: 'Track daily returns',
          icon: Calendar,
          route: 'daily-roas'
        },
        {
          title: 'Reports',
          description: 'Detailed analytics and metrics',
          icon: BarChart3,
          route: 'reports'
        }
      ]);

      setRecentActivity([
        {
          type: 'campaign',
          title: 'Campaign "Product A" updated',
          time: '2 hours ago',
          status: 'success'
        },
        {
          type: 'analysis',
          title: 'ROAS analysis completed',
          time: '4 hours ago',
          status: 'info'
        },
        {
          type: 'product',
          title: 'New product added',
          time: '6 hours ago',
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
        {/* Animated Background Lines */}
        <div className="animated-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
          <div className="line line-4"></div>
          <div className="line line-5"></div>
          <div className="line line-6"></div>
        </div>
        
        {/* Floating Circles */}
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

        {/* Content Container */}
        <div className="loading-content">
          {/* Logo Animation Container */}
          <div className="loading-animation">
            {/* Animated Logo */}
            <div className="loading-logo">
              <img 
                src="/logo/sheet-tools-logo-backgroundremover.png" 
                alt="Sheet Tools" 
              />
            </div>
            
            {/* Background Track/Line */}
            <div className="loading-track"></div>
            
            {/* Progress Line */}
            <div className="loading-progress"></div>
          </div>

          {/* Message */}
          <p className="loading-message">
            Loading your dashboard...
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
        subtitle="Manage your campaigns and maximize your results"
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
          <h2 className="section-title">Quick Tools</h2>
          <p className="section-description">Access your most used tools</p>
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
          <h2 className="section-title">Recent Activity</h2>
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
          <h2 className="section-title">Performance Overview</h2>
        </div>
        <div className="performance-card">
          <div className="performance-header">
            <h3>Last 7 Days ROAS</h3>
            <div className="performance-badge">
              <Award size={16} />
              <span>Excellent</span>
            </div>
          </div>
          <div className="performance-chart">
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Performance chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;