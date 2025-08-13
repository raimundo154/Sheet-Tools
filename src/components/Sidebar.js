import React from 'react';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Search, 
  Megaphone, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  LogOut, 
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange, onSignOut }) => {
  const menuItems = [
    {
      group: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'daily-roas', label: 'Daily Roas', icon: Calendar },
        { id: 'profit-sheet', label: 'Profit Sheet', icon: DollarSign },
        { id: 'quotation', label: 'Quotation', icon: ShoppingCart }
      ]
    },
    {
      group: 'Ferramentas',
      items: [
        { id: 'product-research', label: 'Product Research', icon: Search },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'sales', label: 'Vendas', icon: ShoppingCart }
      ]
    },
    {
      group: 'Gestão',
      items: [
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'rank-up', label: 'Rank Up', icon: TrendingUp }
      ]
    },
    {
      group: 'Sistema',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'sign-out', label: 'Sign Out', icon: LogOut }
      ]
    }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'sign-out') {
      onSignOut();
    } else {
      onPageChange(itemId);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>SHEET TOOLS</h1>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex} className="menu-group">
            {groupIndex > 0 && <div className="menu-divider"></div>}
            {group.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <div className="menu-divider"></div>
        <button className="menu-item">
          <HelpCircle size={20} />
          <span>Get Help</span>
        </button>
        <div className="bottom-links">
          <button 
            className="bottom-link"
            onClick={() => onPageChange('privacy')}
          >
            Privacy Policy
          </button>
          <button 
            className="bottom-link"
            onClick={() => onPageChange('terms')}
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
