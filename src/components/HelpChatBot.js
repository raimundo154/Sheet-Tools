import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  ArrowLeft,
  Mail,
  Check
} from 'lucide-react';
import emailService from '../services/emailService';
import './HelpChatBot.css';

const HelpChatBot = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('faq'); // 'faq' | 'chat'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const messagesEndRef = useRef(null);

  // FAQ data from NewHomePage
  const faqs = [
    {
      id: 1,
      question: "Como funciona o cálculo automático de métricas?",
      answer: "A Sheet Tools conecta-se diretamente às tuas campanhas do Facebook Ads e calcula automaticamente todas as métricas essenciais como ROAS, CPC, CPA, Profit Margin, BER e muito mais. Os dados são atualizados em tempo real."
    },
    {
      id: 2,
      question: "Que tipo de recomendações a plataforma oferece?",
      answer: "Baseada em regras avançadas de performance, a plataforma sugere automaticamente se deves MATAR uma campanha com baixo desempenho, ESCALAR uma campanha lucrativa, MANTER uma campanha estável ou DESESCALAR quando necessário."
    },
    {
      id: 3,
      question: "Preciso de conhecimento técnico para usar?",
      answer: "Não! A Sheet Tools foi desenvolvida para ser intuitiva. Basta conectares as tuas campanhas e a plataforma faz todo o trabalho pesado de análise e recomendações automaticamente."
    },
    {
      id: 4,
      question: "Como funciona o período gratuito?",
      answer: "Oferecemos 15 dias completamente grátis com acesso total a todas as funcionalidades. Não é necessário cartão de crédito para começares."
    },
    {
      id: 5,
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Não há fidelidade. Podes cancelar a tua subscrição a qualquer momento e continuar a usar até ao fim do período pago."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFAQClick = (faq) => {
    setCurrentView('chat');
    setMessages([
      {
        type: 'user',
        content: faq.question,
        timestamp: new Date()
      },
      {
        type: 'bot',
        content: faq.answer,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      setIsTyping(false);
      
      // Send email to info@sheet-tools.com
      try {
        await sendEmailToSupport(inputMessage);
        
        const botResponse = {
          type: 'bot',
          content: "Obrigado pela tua mensagem! Encaminhámos a tua questão para a nossa equipa de suporte. Receberás uma resposta no email associado à tua conta em breve.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setEmailSent(true);
        
        setTimeout(() => setEmailSent(false), 3000);
      } catch (error) {
        const errorResponse = {
          type: 'bot',
          content: "Ups! Ocorreu um erro ao enviar a tua mensagem. Por favor, tenta novamente ou contacta-nos diretamente em info@sheet-tools.com",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    }, 1000);
  };

  const sendEmailToSupport = async (message) => {
    try {
      console.log('🔄 Enviando mensagem para suporte...');
      const result = await emailService.sendSupportEmail(message);
      
      if (result.success) {
        console.log('✅ Email enviado com sucesso:', result);
        return result;
      } else {
        console.error('❌ Falha no envio:', result);
        throw new Error(result.message || 'Falha ao enviar email');
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      throw error;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentView('faq');
    setEmailSent(false);
  };

  if (!isOpen) return null;

  return (
    <div className="help-chatbot-overlay">
      <div className="help-chatbot">
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-content">
            {currentView === 'chat' && (
              <button 
                className="back-btn"
                onClick={() => setCurrentView('faq')}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="header-info">
              <div className="header-icon">
                {currentView === 'faq' ? <HelpCircle size={20} /> : <MessageCircle size={20} />}
              </div>
              <div>
                <h3>{currentView === 'faq' ? 'Como podemos ajudar?' : 'Suporte'}</h3>
                <p>{currentView === 'faq' ? 'Perguntas frequentes' : 'Fala connosco'}</p>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="chatbot-content">
          {currentView === 'faq' ? (
            <div className="faq-section">
              <div className="faq-intro">
                <p>Seleciona uma pergunta frequente ou fala diretamente connosco:</p>
              </div>
              
              <div className="faq-list">
                {faqs.map((faq) => (
                  <button
                    key={faq.id}
                    className="faq-item"
                    onClick={() => handleFAQClick(faq)}
                  >
                    <HelpCircle size={16} />
                    <span>{faq.question}</span>
                  </button>
                ))}
              </div>

              <div className="chat-option">
                <button 
                  className="start-chat-btn"
                  onClick={() => {
                    setCurrentView('chat');
                    setMessages([{
                      type: 'bot',
                      content: 'Olá! 👋 Como posso ajudar-te hoje? Escreve a tua questão e a nossa equipa de suporte responder-te-á em breve.',
                      timestamp: new Date()
                    }]);
                  }}
                >
                  <MessageCircle size={16} />
                  Falar com um humano
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-section">
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-avatar">
                      {message.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message bot typing">
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escreve a tua mensagem..."
                    className="chat-input"
                    rows="1"
                    disabled={isTyping}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="input-footer">
                  <Mail size={12} />
                  <span>Mensagem enviada para info@sheet-tools.com</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success notification */}
        {emailSent && (
          <div className="success-notification">
            <Check size={16} />
            <span>Mensagem enviada com sucesso!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpChatBot;