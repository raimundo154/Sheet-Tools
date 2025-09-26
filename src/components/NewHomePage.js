import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { navigation } from '../utils/navigation';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap, 
  Shield, 
  Menu, 
  X,
  ChevronDown,
  Check,
  Play,
  Pause,
  ArrowRight,
  Brain,
  Clock,
  DollarSign
} from 'lucide-react';
import './NewHomePage.css';

const NewHomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel slides
  const slides = [
    {
      title: "Calculates metrics automatically",
      description: "CPC, ROAS, CPA, Profit Margin calculated in real-time",
      icon: BarChart3
    },
    {
      title: "Suggests optimization actions",
      description: "Smart recommendations: Kill, Scale or Maintain",
      icon: Brain
    },
    {
      title: "Facilitates scaling decisions",
      description: "Data-driven decisions, not intuition",
      icon: TrendingUp
    },
    {
      title: "Automates your workflow",
      description: "Saves hours of daily manual analysis",
      icon: Clock
    }
  ];

  // Plans loading removed since not currently used

  // Auto-play carousel
  React.useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, slides.length]);

  // FAQ data
  // Nova estrutura de FAQs com melhor organização
  const faqData = [
    {
      id: 1,
      question: "How does automatic metrics calculation work?",
      answer: "Sheet Tools connects directly to your Facebook Ads campaigns and automatically calculates all essential metrics like ROAS, CPC, CPA, Profit Margin, BER and much more. Data is updated in real-time."
    },
    {
      id: 2,
      question: "What type of recommendations does the platform offer?",
      answer: "Based on advanced performance rules, the platform automatically suggests whether you should KILL a low-performing campaign, SCALE a profitable campaign, MAINTAIN a stable campaign or DE-SCALE when necessary."
    },
    {
      id: 3,
      question: "Do I need technical knowledge to use it?",
      answer: "No! Sheet Tools was designed to be intuitive. Just connect your campaigns and the platform does all the heavy lifting of analysis and recommendations automatically."
    },
    {
      id: 4,
      question: "How does the free trial work?",
      answer: "We offer 15 days completely free with full access to all features. No credit card required to get started."
    },
    {
      id: 5,
      question: "Can I cancel at any time?",
      answer: "Yes! There's no commitment. You can cancel your subscription at any time and continue using until the end of the paid period."
    }
  ];

  // Enhanced Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  // Removed unused animation variants

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Removed unused scaleIn animation

  const slideInScale = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const handleCTAClick = () => {
    navigation.toLogin();
  };

  // Removed unused helper functions to clean up warnings

  const scrollToSection = (sectionId) => {
    console.log('🔍 Scrolling to section:', sectionId);
    
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('✅ Element found:', element);
      
      const headerHeight = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      console.log('📍 Scrolling to position:', offsetPosition);
      
      // Scroll suave simples e direto
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Ajustar para compensar o header fixo
      setTimeout(() => {
        window.scrollBy({
          top: -headerHeight,
          behavior: 'smooth'
        });
      }, 100);
      
    } else {
      console.log('❌ Element not found with ID:', sectionId);
    }
    
    setIsMenuOpen(false);
  };

  return (
    <div className="new-homepage">
      {/* Header */}
      <motion.header 
        className={`header ${scrolled ? 'header-scrolled' : ''}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <img 
                src="/logo/sheet-tools-logo-backgroundremover.png" 
                alt="Sheet Tools" 
                className="logo-image"
              />
            </div>
            
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>What is it</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
              <motion.button 
                className="mobile-cta-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </nav>
          </div>

          <div className="header-actions">
              <motion.button 
                className="cta-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
              
              <button 
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
        </div>
      </motion.header>

      {/* Hero Section - Rebuilt */}
      <section className="hero-new">
        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-text-area">
              <motion.h1 
                className="hero-main-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Automate Your <span className="title-highlight">Facebook Campaigns</span>
              </motion.h1>
              
              <motion.p 
                className="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Your smart platform for automatic metrics calculation and action recommendations.
              </motion.p>

              {/* Benefits */}
              <motion.div 
                className="hero-benefits-list"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>Calculates metrics automatically</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>CPC, ROAS, CPA, Profit Margin in real-time</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-check">✓</span>
                  <span>Smart recommendations: Kill, Scale, Maintain</span>
                </div>
              </motion.div>
              
              {/* CTAs */}
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button 
                  className="primary-cta"
                  onClick={handleCTAClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free for 15 Days
                  <ArrowRight size={20} />
                </motion.button>
                
                <motion.a 
                  href="#about"
                  className="secondary-cta"
                  onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                >
                  What Sheet Tools does for you
                </motion.a>
              </motion.div>
            </div>

            {/* Right Carousel */}
            <div className="hero-carousel-area">
              <motion.div 
                className="carousel-widget"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="carousel-box">
                  <div className="carousel-top">
                    <h3>What Sheet Tools does for you</h3>
                    <motion.button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="play-pause-btn"
                      whileHover={{ scale: 1.1 }}
                    >
                      {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
                    </motion.button>
                  </div>
                  
                  <div className="carousel-body">
                    <motion.div
                      key={currentSlide}
                      className="carousel-slide"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="slide-icon-wrapper">
                        {React.createElement(slides[currentSlide].icon, { size: 48 })}
                      </div>
                      <h4>{slides[currentSlide].title}</h4>
                      <p>{slides[currentSlide].description}</p>
                    </motion.div>
                  </div>
                  
                  <div className="carousel-dots">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Campaign Analysis Section - Recriada */}
      <section id="about" className="smart-analysis">
        <div className="container">
          <motion.div 
            className="smart-analysis-content"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="smart-analysis-title"
              variants={fadeInUp}
            >
              Smart Campaign Analysis
            </motion.h2>
            
            <motion.p 
              className="smart-analysis-subtitle"
              variants={fadeInUp}
            >
              Sheet Tools revolutionizes how you manage your Facebook Ads campaigns. Our 
              platform automatically analyzes your metrics and offers precise recommendations to 
              maximize your results.
            </motion.p>

            <motion.div 
              className="features-grid"
              variants={staggerContainer}
            >
              <motion.div 
                className="feature-card"
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(29, 209, 161, 0.1)" }}
              >
                <div className="feature-icon-circle">
                  <BarChart3 size={32} />
                </div>
                <h3>Smart Analysis</h3>
                <p>Automatically calculates CPC, ROAS, COGS, CPA, Profit Margin and other essential metrics.</p>
              </motion.div>

              <motion.div 
                className="feature-card"
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(29, 209, 161, 0.1)" }}
              >
                <div className="feature-icon-circle">
                  <Brain size={32} />
                </div>
                <h3>Decision Automation</h3>
                <p>Automatic recommendations: kill bad campaigns, scale profitable ones, maintain stable ones.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <motion.div 
            className="features-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Features that make the difference</h2>
            <p>Everything you need to optimize your campaigns in one platform</p>
          </motion.div>

          <motion.div 
            className="features-grid-modern"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: Target,
                title: "Facebook Ads Integration",
                description: "Connect directly to your campaigns for real-time analysis"
              },
              {
                icon: TrendingUp,
                title: "Automatic Metrics",
                description: "ROAS, CPC, CPA, CTR, Conversion Rate calculated automatically"
              },
              {
                icon: Brain,
                title: "AI for Decisions",
                description: "Smart algorithms suggest the best actions for each campaign"
              },
              {
                icon: Zap,
                title: "Complete Automation",
                description: "Save hours of manual analysis with smart automation"
              },
              {
                icon: DollarSign,
                title: "Profit Analysis",
                description: "Accurate calculation of COGS, Profit Margin and real ROI"
              },
              {
                icon: Shield,
                title: "Secure Data",
                description: "Secure connection via OAuth, your data always protected"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card-modern"
                variants={slideInScale}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="feature-icon-modern">
                  <feature.icon size={24} />
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <motion.div 
            className="pricing-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Simple and transparent plans</h2>
            <p>Start free and scale as your business grows</p>
          </motion.div>

          <motion.div 
            className="pricing-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              className="pricing-card"
              variants={slideInScale}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="plan-header">
                <h3>Beginner</h3>
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">4.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Daily ROAS without automation</li>
                <li><Check size={16} /> Basic campaign analysis</li>
                <li><Check size={16} /> Simple dashboard</li>
                <li><Check size={16} /> Email support</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </motion.div>

            <motion.div 
              className="pricing-card"
              variants={slideInScale}
              whileHover={{ 
                y: -15,
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
            >
              <div className="plan-header">
                <h3>Standard</h3>
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">34.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Complete Daily ROAS Profit Sheet</li>
                <li><Check size={16} /> Campaign Management</li>
                <li><Check size={16} /> 2 stores, 40 campaigns</li>
                <li><Check size={16} /> Priority support</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Plan
              </motion.button>
            </motion.div>

            <motion.div 
              className="pricing-card"
              variants={slideInScale}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="plan-header">
                <h3>Expert</h3>
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">49.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Everything from Standard</li>
                <li><Check size={16} /> Advanced Product Research</li>
                <li><Check size={16} /> 4 stores, unlimited campaigns</li>
                <li><Check size={16} /> VIP support</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Plan
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Nova Seção FAQ - Completamente Recriada */}
      <section id="faq" className="faq-new">
        <div className="faq-container">
          <motion.div 
            className="faq-header-new"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">Clear your doubts about Sheet Tools</p>
          </motion.div>

          <div className="faq-list-new">
            {faqData.map((faq) => (
              <motion.div
                key={faq.id}
                className="faq-item-new"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: faq.id * 0.1 }}
              >
                <div
                  className={`faq-question-new ${openFAQ === faq.id ? 'active' : ''}`}
                  onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                >
                  <h3 className="faq-question-text">{faq.question}</h3>
                  <div className="faq-icon-wrapper">
                    <ChevronDown 
                      size={24} 
                      className={`faq-chevron ${openFAQ === faq.id ? 'rotated' : ''}`}
                    />
                  </div>
                </div>
                
                <motion.div
                  className="faq-answer-new"
                  initial={false}
                  animate={{
                    height: openFAQ === faq.id ? 'auto' : 0,
                    opacity: openFAQ === faq.id ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div className="faq-answer-content-new">
                    <p>{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <img 
                  src="/logo/sheet-tools-logo-backgroundremover.png" 
                  alt="Sheet Tools" 
                  className="footer-logo-image"
                />
              </div>
              <p className="footer-tagline">Automate your campaigns and maximize your results</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Quick Links</h4>
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Home</a>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
              </div>
              
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#terms">Terms of Service</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
              
              <div className="link-group">
                <h4>Contact</h4>
                <a href="mailto:info@sheet-tools.com">info@sheet-tools.com</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 Sheet Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;
