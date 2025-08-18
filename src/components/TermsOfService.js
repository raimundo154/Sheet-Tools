import React from 'react';
import { FileText, Users, Shield, Globe, Zap, AlertTriangle, Scale, Mail } from 'lucide-react';
import './LegalPages.css';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      {/* Hero Section */}
      <div className="legal-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FileText size={48} />
          </div>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">
            Please read these terms carefully before using Sheet Tools.
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
            <h2>1. Acceptance of Terms</h2>
          </div>
          <p>
            By accessing and using Sheet Tools ("the Service," "we," "us," or "our"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Globe size={24} />
            <h2>2. Description of Service</h2>
          </div>
          <p>
            Sheet Tools is a comprehensive e-commerce analytics and campaign management platform designed to help online businesses optimize their marketing performance. Our service includes:
          </p>
          <div className="service-features">
            <div className="service-item">
              <div className="service-icon">📊</div>
              <div>
                <h4>Analytics Dashboard</h4>
                <p>Real-time performance metrics, ROI tracking, and comprehensive reporting tools.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">🛍️</div>
              <div>
                <h4>E-commerce Integration</h4>
                <p>Seamless connection with Shopify stores for sales data and inventory management.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">📱</div>
              <div>
                <h4>Social Media Management</h4>
                <p>Facebook Ads integration, campaign optimization, and audience insights.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">⚡</div>
              <div>
                <h4>Automation Tools</h4>
                <p>Automated reporting, alert systems, and performance optimization recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Users size={24} />
            <h2>3. User Account and Registration</h2>
          </div>
          <div className="account-requirements">
            <div className="requirement-item">
              <span className="requirement-dot"></span>
              <div>
                <strong>Accurate Information:</strong> You must provide truthful and complete registration information.
              </div>
            </div>
            <div className="requirement-item">
              <span className="requirement-dot"></span>
              <div>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your credentials.
              </div>
            </div>
            <div className="requirement-item">
              <span className="requirement-dot"></span>
              <div>
                <strong>Account Activity:</strong> You are responsible for all activities that occur under your account.
              </div>
            </div>
            <div className="requirement-item">
              <span className="requirement-dot"></span>
              <div>
                <strong>Unauthorized Access:</strong> You must notify us immediately of any unauthorized use.
              </div>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Shield size={24} />
            <h2>4. Acceptable Use Policy</h2>
          </div>
          <p>You agree not to use the Service to:</p>
          <div className="prohibited-grid">
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Violate any local, state, national, or international law or regulation</span>
            </div>
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Transmit unauthorized advertising or promotional material</span>
            </div>
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Impersonate our company, employees, or other users</span>
            </div>
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Engage in conduct that restricts others' use of the Service</span>
            </div>
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Attempt to disable, damage, or impair the platform</span>
            </div>
            <div className="prohibited-item">
              <AlertTriangle size={16} />
              <span>Use automated systems to access the Service without permission</span>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Zap size={24} />
            <h2>5. Third-Party Integrations</h2>
          </div>
          <p>
            Our Service integrates with third-party platforms including Facebook's Marketing API and Shopify's API. 
            By using our Service, you also agree to comply with the respective platform terms and policies:
          </p>
          <div className="integration-cards">
            <div className="integration-card">
              <h4>Facebook Integration</h4>
              <p>Subject to Facebook's Platform Terms and Advertising Policies. We are not responsible for changes to Facebook's API that may affect functionality.</p>
            </div>
            <div className="integration-card">
              <h4>Shopify Integration</h4>
              <p>Subject to Shopify's Terms of Service and API License. Store data access requires proper authentication and permissions.</p>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Shield size={24} />
            <h2>6. Data and Privacy</h2>
          </div>
          <p>
            Your privacy is important to us. Please refer to our Privacy Policy for detailed information on how we collect, 
            use, and protect your data. By using our Service, you consent to the data practices described in our Privacy Policy.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Scale size={24} />
            <h2>7. Intellectual Property Rights</h2>
          </div>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property 
            of Sheet Tools and its licensors. The Service is protected by copyright, trademark, and other intellectual 
            property laws. Our trademarks and trade dress may not be used without our prior written consent.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>8. User Content and Data</h2>
          </div>
          <p>
            You retain ownership of any content or data you submit, post, or display through the Service. By submitting 
            content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and 
            distribute such content solely for the purpose of providing and improving the Service.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Zap size={24} />
            <h2>9. Service Availability</h2>
          </div>
          <p>
            We strive to maintain high service availability, but we cannot guarantee 100% uptime. The Service may be 
            unavailable from time to time due to maintenance, updates, or technical issues. We reserve the right to 
            modify or discontinue the Service at any time with reasonable notice.
          </p>
          <div className="availability-stats">
            <div className="stat-item">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Target Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">&lt;1min</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <AlertTriangle size={24} />
            <h2>10. Limitation of Liability</h2>
          </div>
          <p>
            In no event shall Sheet Tools, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Shield size={24} />
            <h2>11. Disclaimer of Warranties</h2>
          </div>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Sheet Tools makes no representations or 
            warranties of any kind, express or implied, as to the operation of the Service or the information, content, 
            materials, or products included therein.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Users size={24} />
            <h2>12. Account Termination</h2>
          </div>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or 
            liability, under our sole discretion, for any reason including but not limited to a breach of these Terms. 
            You may also terminate your account at any time through your account settings.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <Scale size={24} />
            <h2>13. Governing Law</h2>
          </div>
          <p>
            These Terms shall be interpreted and governed in accordance with the laws of the jurisdiction in which 
            Sheet Tools operates, without regard to its conflict of law provisions. Any disputes arising from these 
            Terms will be resolved in the appropriate courts of that jurisdiction.
          </p>
        </div>

        <div className="legal-section">
          <div className="section-header">
            <FileText size={24} />
            <h2>14. Changes to Terms</h2>
          </div>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
            is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes 
            a material change will be determined at our sole discretion.
          </p>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2>Contact Information</h2>
          <p>If you have any questions about these Terms of Service:</p>
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

export default TermsOfService;