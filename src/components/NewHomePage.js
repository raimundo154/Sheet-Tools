import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { navigation } from '../utils/navigation';
import subscriptionService from '../services/subscriptionService';
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
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Carousel slides
  const slides = [
    {
      title: "Calcula métricas automaticamente",
      description: "CPC, ROAS, CPA, Profit Margin calculados em tempo real",
      icon: BarChart3
    },
    {
      title: "Sugere ações para otimizares",
      description: "Recomendações inteligentes: Matar, Escalar ou Manter",
      icon: Brain
    },
    {
      title: "Facilita decisões de escala",
      description: "Decisões baseadas em dados, não em intuição",
      icon: TrendingUp
    },
    {
      title: "Automatiza o teu workflow",
      description: "Poupa horas de análise manual diária",
      icon: Clock
    }
  ];

  // Load real plans from Supabase
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const plansData = await subscriptionService.getAvailablePlans();
        console.log('📦 Homepage - Plans loaded:', plansData);
        setPlans(plansData);
      } catch (error) {
        console.error('❌ Homepage - Error loading plans:', error);
        // Keep empty array if error
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

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
  const faqs = [
    {
      question: "Como funciona o cálculo automático de métricas?",
      answer: "A Sheet Tools conecta-se diretamente às tuas campanhas do Facebook Ads e calcula automaticamente todas as métricas essenciais como ROAS, CPC, CPA, Profit Margin, BER e muito mais. Os dados são atualizados em tempo real."
    },
    {
      question: "Que tipo de recomendações a plataforma oferece?",
      answer: "Baseada em regras avançadas de performance, a plataforma sugere automaticamente se deves MATAR uma campanha com baixo desempenho, ESCALAR uma campanha lucrativa, MANTER uma campanha estável ou DESESCALAR quando necessário."
    },
    {
      question: "Preciso de conhecimento técnico para usar?",
      answer: "Não! A Sheet Tools foi desenvolvida para ser intuitiva. Basta conectares as tuas campanhas e a plataforma faz todo o trabalho pesado de análise e recomendações automaticamente."
    },
    {
      question: "Como funciona o período gratuito?",
      answer: "Oferecemos 15 dias completamente grátis com acesso total a todas as funcionalidades. Não é necessário cartão de crédito para começares."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Não há fidelidade. Podes cancelar a tua subscrição a qualquer momento e continuar a usar até ao fim do período pago."
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      } 
    }
  };

  const handleCTAClick = () => {
    navigation.toLogin();
  };

  // Organize plans by type and billing period
  const getOrganizedPlans = () => {
    if (!plans || plans.length === 0) return { trial: null, monthly: [], yearly: [] };

    const trial = plans.find(plan => plan.billing_period === 'trial');
    const monthly = plans.filter(plan => plan.billing_period === 'monthly').sort((a, b) => a.price_amount - b.price_amount);
    const yearly = plans.filter(plan => plan.billing_period === 'yearly').sort((a, b) => a.price_amount - b.price_amount);

    return { trial, monthly, yearly };
  };

  // Format price for display
  const formatPrice = (amount, period) => {
    const price = (amount / 100).toFixed(2);
    return {
      currency: '€',
      amount: price,
      period: period === 'monthly' ? '/mês' : '/ano'
    };
  };

  // Calculate savings for yearly plans
  const calculateYearlySavings = (yearlyPlan, monthlyPlans) => {
    if (!yearlyPlan || !monthlyPlans || monthlyPlans.length === 0) return null;
    
    // Find corresponding monthly plan by name similarity
    const planType = yearlyPlan.name.toLowerCase();
    const monthlyPlan = monthlyPlans.find(plan => 
      plan.name.toLowerCase().includes('basic') && planType.includes('basic') ||
      plan.name.toLowerCase().includes('standard') && planType.includes('standard') ||
      plan.name.toLowerCase().includes('expert') && planType.includes('expert')
    );
    
    if (!monthlyPlan) return null;
    
    const yearlyPrice = yearlyPlan.price_amount / 100;
    const monthlyPrice = (monthlyPlan.price_amount / 100) * 12;
    const savings = monthlyPrice - yearlyPrice;
    const savingsPercent = Math.round((savings / monthlyPrice) * 100);
    
    return { savings: savings.toFixed(2), percent: savingsPercent };
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      // Scroll suave e devagar (2 segundos)
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Para dispositivos que não suportam scroll suave nativo, usar animação customizada
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 2000; // 2 segundos
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressPercentage = Math.min(progress / duration, 1);
        
        // Easing function para scroll mais suave
        const easeInOutCubic = progressPercentage < 0.5 
          ? 4 * progressPercentage * progressPercentage * progressPercentage
          : 1 - Math.pow(-2 * progressPercentage + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic);
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      }
      
      // Fallback para scroll customizado se necessário
      if (!CSS.supports('scroll-behavior', 'smooth')) {
        window.requestAnimationFrame(step);
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="new-homepage">
      {/* Header */}
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img 
                src="/logo/sheet-tools-logo-backgroundremover.png" 
                alt="Sheet Tools" 
                className="logo-image"
              />
            </div>
            
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <a href="#about" onClick={() => scrollToSection('about')}>O que é</a>
              <a href="#features" onClick={() => scrollToSection('features')}>Funcionalidades</a>
              <a href="#pricing" onClick={() => scrollToSection('pricing')}>Planos</a>
              <a href="#faq" onClick={() => scrollToSection('faq')}>FAQ</a>
              <motion.button 
                className="mobile-cta-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Começar Agora
              </motion.button>
            </nav>

            <div className="header-actions">
              <motion.button 
                className="cta-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Começar Agora
              </motion.button>
              
              <button 
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <motion.div 
              className="hero-text"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="hero-title"
                variants={fadeInUp}
              >
                Automatiza as Tuas 
                <span className="highlight"> Campanhas Facebook</span>
              </motion.h1>
              
              <motion.p 
                className="hero-subtitle"
                variants={fadeInUp}
              >
                A tua plataforma inteligente para cálculo automático de métricas e recomendações de ação. 
                Para de perder tempo a analisar dados manualmente.
              </motion.p>
              
              <motion.div 
                className="hero-cta"
                variants={fadeInUp}
              >
                <motion.button 
                  className="cta-button-large"
                  onClick={handleCTAClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Começar Grátis por 15 Dias
                  <ArrowRight size={20} />
                </motion.button>
                <p className="cta-note">
                  Sem cartão de crédito • Acesso completo
                </p>
              </motion.div>
            </motion.div>

            {/* Carousel */}
            <motion.div 
              className="hero-carousel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="carousel-container">
                <div className="carousel-header">
                  <h3>O que a Sheet Tools faz por ti</h3>
                  <div className="carousel-controls">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="control-button"
                    >
                      {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="carousel-content">
                  <motion.div
                    key={currentSlide}
                    className="slide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="slide-icon">
                      {React.createElement(slides[currentSlide].icon, { size: 48 })}
                    </div>
                    <h4>{slides[currentSlide].title}</h4>
                    <p>{slides[currentSlide].description}</p>
                  </motion.div>
                </div>
                
                <div className="carousel-indicators">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <motion.div 
            className="about-content"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeInUp}>
              Análise Inteligente de Campanhas
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="about-description">
              A Sheet Tools revoluciona a forma como geres as tuas campanhas do Facebook Ads. 
              A nossa plataforma analisa automaticamente as tuas métricas e oferece recomendações precisas 
              para maximizares os teus resultados.
            </motion.p>

            <div className="features-grid">
              <motion.div 
                className="feature-card"
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="feature-icon">
                  <BarChart3 size={32} />
                </div>
                <h3>Análise Inteligente</h3>
                <p>
                  Calcula automaticamente CPC, ROAS, COGS, CPA, Profit Margin e outras métricas essenciais. 
                  Integração direta com Facebook Ads para dados em tempo real.
                </p>
              </motion.div>

              <motion.div 
                className="feature-card"
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="feature-icon">
                  <Brain size={32} />
                </div>
                <h3>Automação de Decisões</h3>
                <p>
                  Recomendações automáticas baseadas em regras avançadas: matar campanhas ruins, 
                  escalar as lucrativas, manter as estáveis ou desescalar quando necessário.
                </p>
              </motion.div>
            </div>
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
            <h2>Funcionalidades que fazem a diferença</h2>
            <p>Tudo o que precisas para otimizar as tuas campanhas numa só plataforma</p>
          </motion.div>

          <div className="features-list">
            {[
              {
                icon: Target,
                title: "Integração Facebook Ads",
                description: "Conecta-te diretamente às tuas campanhas para análise em tempo real"
              },
              {
                icon: TrendingUp,
                title: "Métricas Automáticas",
                description: "ROAS, CPC, CPA, CTR, Conversion Rate calculados automaticamente"
              },
              {
                icon: Brain,
                title: "IA para Decisões",
                description: "Algoritmos inteligentes sugerem as melhores ações para cada campanha"
              },
              {
                icon: Zap,
                title: "Automação Completa",
                description: "Poupa horas de análise manual com automação inteligente"
              },
              {
                icon: DollarSign,
                title: "Análise de Lucro",
                description: "Cálculo preciso de COGS, Profit Margin e ROI real"
              },
              {
                icon: Shield,
                title: "Dados Seguros",
                description: "Conexão segura via OAuth, os teus dados sempre protegidos"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
            <h2>Planos simples e transparentes</h2>
            <p>Começa grátis e escala conforme o teu negócio cresce</p>
          </motion.div>

          <div className="pricing-grid">
            <motion.div 
              className="pricing-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div className="plan-header">
                <h3>{plansLoading ? 'Carregando...' : 'Beginner'}</h3>
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">{plansLoading ? '--' : '4.99'}</span>
                  <span className="period">/mês</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Daily ROAS sem automatização</li>
                <li><Check size={16} /> Análise básica de campanhas</li>
                <li><Check size={16} /> Dashboard simples</li>
                <li><Check size={16} /> Suporte por email</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Começar Agora
              </motion.button>
            </motion.div>

            <motion.div 
              className="pricing-card popular"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div className="popular-badge">Mais Popular</div>
              <div className="plan-header">
                <h3>{plansLoading ? 'Carregando...' : 'Standard'}</h3>
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">{plansLoading ? '--' : '34.99'}</span>
                  <span className="period">/mês</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Daily ROAS Profit Sheet completo</li>
                <li><Check size={16} /> Gestão de Campanhas</li>
                <li><Check size={16} /> Quotation em tempo real</li>
                <li><Check size={16} /> 2 lojas, 40 campanhas</li>
                <li><Check size={16} /> Suporte prioritário</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Escolher Plano
              </motion.button>
            </motion.div>

            <motion.div 
              className="pricing-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div className="plan-header">
                <h3>{plansLoading ? 'Carregando...' : 'Expert Anual'}</h3>
                <div className="price">
                  {!plansLoading && (
                    <div className="original-price" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem' }}>
                        €599.88
                      </span>
                    </div>
                  )}
                  <span className="currency">€</span>
                  <span className="amount">{plansLoading ? '--' : '449.91'}</span>
                  <span className="period">/ano</span>
                </div>
                {!plansLoading && <div className="savings">Poupa €149.97 (3 meses grátis)</div>}
              </div>
              <ul className="plan-features">
                <li><Check size={16} /> Tudo do Standard</li>
                <li><Check size={16} /> Product Research avançado</li>
                <li><Check size={16} /> 4 lojas, campanhas ilimitadas</li>
                <li><Check size={16} /> Análise de tendências</li>
                <li><Check size={16} /> Suporte VIP</li>
              </ul>
              <motion.button 
                className="plan-button"
                onClick={handleCTAClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Escolher Plano
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <motion.div 
            className="faq-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Perguntas Frequentes</h2>
            <p>Tira as tuas dúvidas sobre a Sheet Tools</p>
          </motion.div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className={`faq-question ${openFAQ === index ? 'active' : ''}`}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`chevron ${openFAQ === index ? 'rotated' : ''}`}
                  />
                </button>
                <motion.div
                  className="faq-answer"
                  initial={false}
                  animate={{
                    height: openFAQ === index ? 'auto' : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="faq-answer-content">
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
            <div className="footer-left">
              <div className="footer-logo">
                <img 
                  src="/logo/sheet-tools-logo-backgroundremover.png" 
                  alt="Sheet Tools" 
                  className="footer-logo-image"
                />
              </div>
              <p>Automatiza as tuas campanhas e maximiza os teus resultados</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Links Rápidos</h4>
                <a href="#about" onClick={() => scrollToSection('about')}>Home</a>
                <a href="#features" onClick={() => scrollToSection('features')}>Funcionalidades</a>
                <a href="#pricing" onClick={() => scrollToSection('pricing')}>Planos</a>
                <a href="#faq" onClick={() => scrollToSection('faq')}>FAQ</a>
              </div>
              
              <div className="link-group">
                <h4>Contato</h4>
                <a href="mailto:info@sheet-tools.com">info@sheet-tools.com</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 Sheet Tools. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;
