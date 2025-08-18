import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, Phone, Globe } from 'lucide-react';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      {/* Hero Section */}
      <div className="legal-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Shield size={48} />
          </div>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Your privacy matters to us. Learn how we protect and handle your data.
          </p>
          <div className="hero-badge">
            <span>Last updated: August 14, 2025</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="legal-content">
        <div className="legal-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>1. Introduction</h2>
          </div>
          <p>
            This Privacy Policy explains how Sheet Tools ("we," "our," or "us") collects, uses, stores, and protects your personal information when you use our services. By accessing or using our platform, you agree to the terms outlined in this policy.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Eye size={24} />
            <h2>2. Information We Collect</h2>
          </div>
          <p>We may collect the following types of information:</p>
          <div className="info-grid">
            <div className="info-card">
              <h4>Account Information</h4>
              <p>Name, email address, profile picture, and authentication data from social logins (Google, Facebook).</p>
            </div>
            <div className="info-card">
              <h4>Usage Data</h4>
              <p>Pages visited, features used, time spent on platform, click patterns, and interaction data.</p>
            </div>
            <div className="info-card">
              <h4>Device Information</h4>
              <p>Browser type, operating system, IP address, device identifiers, and technical specifications.</p>
            </div>
            <div className="info-card">
              <h4>Business Data</h4>
              <p>Shopify store information, Facebook ad account data, campaign metrics, and performance analytics.</p>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Globe size={24} />
            <h2>3. How We Use Your Information</h2>
          </div>
          <p>We use your information to:</p>
          <ul className="feature-list">
            <li>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Provide Services:</strong> Deliver our platform features, analytics, and campaign management tools.
                </div>
              </div>
            </li>
            <li>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Improve Platform:</strong> Analyze usage patterns to enhance functionality and user experience.
                </div>
              </div>
            </li>
            <li>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Communication:</strong> Send updates, notifications, support responses, and important announcements.
                </div>
              </div>
            </li>
            <li>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Personalization:</strong> Customize your dashboard, recommendations, and platform experience.
                </div>
              </div>
            </li>
            <li>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Compliance:</strong> Meet legal obligations and maintain platform security and integrity.
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Lock size={24} />
            <h2>4. Data Security & Storage</h2>
          </div>
          <p>
            Your data is protected with enterprise-grade security measures including encryption at rest and in transit, 
            secure authentication protocols, regular security audits, and access controls. We use industry-standard 
            practices to safeguard your information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <div className="security-features">
            <div className="security-item">
              <div className="security-icon">🔐</div>
              <div>
                <h4>End-to-End Encryption</h4>
                <p>All data transmitted between your device and our servers is encrypted using TLS 1.3.</p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon">🛡️</div>
              <div>
                <h4>Secure Infrastructure</h4>
                <p>Data stored on SOC 2 compliant cloud infrastructure with regular security assessments.</p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon">🔑</div>
              <div>
                <h4>Access Controls</h4>
                <p>Strict access controls ensure only authorized personnel can access your data when necessary.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>5. Data Sharing</h2>
          </div>
          <p>
            We do not sell, rent, or share your personal data with third parties for marketing purposes. 
            We may share data only in these limited circumstances:
          </p>
          <ul className="sharing-list">
            <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform (hosting, analytics, support).</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
            <li><strong>Your Consent:</strong> When you explicitly authorize us to share specific information.</li>
          </ul>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Eye size={24} />
            <h2>6. Your Rights</h2>
          </div>
          <p>You have comprehensive rights regarding your personal data:</p>
          <div className="rights-grid">
            <div className="right-card">
              <h4>Access</h4>
              <p>Request a copy of all personal data we hold about you.</p>
            </div>
            <div className="right-card">
              <h4>Correction</h4>
              <p>Update or correct any inaccurate personal information.</p>
            </div>
            <div className="right-card">
              <h4>Deletion</h4>
              <p>Request deletion of your personal data (subject to legal requirements).</p>
            </div>
            <div className="right-card">
              <h4>Portability</h4>
              <p>Export your data in a structured, machine-readable format.</p>
            </div>
            <div className="right-card">
              <h4>Restriction</h4>
              <p>Limit how we process your personal information.</p>
            </div>
            <div className="right-card">
              <h4>Objection</h4>
              <p>Object to certain types of data processing.</p>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Globe size={24} />
            <h2>7. Cookies & Tracking</h2>
          </div>
          <p>
            We use cookies and similar technologies to enhance your experience, understand usage patterns, 
            and deliver personalized content. You can control cookies through your browser settings, though 
            some features may not function properly if cookies are disabled.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>8. Changes to This Policy</h2>
          </div>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
            We'll notify you of significant changes via email or platform notifications and update the "Last updated" 
            date at the top of this policy.
          </p>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy or want to exercise your rights:</p>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={20} />
              <div>
                <strong>Email:</strong>
                <a href="mailto:info@sheet-tools.com">info@sheet-tools.com</a>
              </div>
            </div>
            <div className="contact-item">
              <Globe size={20} />
              <div>
                <strong>Company:</strong>
                <span>Sheet Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="legal-footer">
        <p>© 2025 Sheet Tools. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;