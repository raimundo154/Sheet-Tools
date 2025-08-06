import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
        <p className="text-gray-600 mb-4">
          This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services. By accessing or using our website/application, you agree to the terms outlined in this policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Information We Collect</h2>
        <p className="text-gray-600 mb-2">We may collect the following types of information:</p>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li><strong>Information you provide:</strong> name, email, phone number, etc.</li>
          <li><strong>Usage data:</strong> pages visited, time spent on the site, clicks, etc.</li>
          <li><strong>Device information:</strong> browser type, operating system, IP address, etc.</li>
          <li><strong>Cookies and similar technologies:</strong> used to enhance your browsing experience.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Information</h2>
        <p className="text-gray-600 mb-2">We use your information to:</p>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Provide and improve our services.</li>
          <li>Communicate with you about updates, offers, or support.</li>
          <li>Personalize your experience.</li>
          <li>Comply with legal and regulatory obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Data Sharing</h2>
        <p className="text-gray-600 mb-2">
          We do not sell, rent, or share your personal data with third parties, except in the following cases:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>When required to deliver our services.</li>
          <li>When required by law or a legal process.</li>
          <li>With your explicit consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Data Storage and Security</h2>
        <p className="text-gray-600 mb-4">
          Your data is stored securely and protected against unauthorized access, alteration, disclosure, or destruction. We use appropriate technical and organizational measures to safeguard your information.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Your Rights</h2>
        <p className="text-gray-600 mb-2">You have the right to:</p>
        <ul className="list-disc pl-6 text-gray-600 mb-4">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw your consent at any time.</li>
          <li>Request data portability.</li>
        </ul>
        <p className="text-gray-600 mb-4">
          To exercise your rights, please contact us at: <a href="mailto:eatomasss@gmail.com" className="text-blue-600 underline">eatomasss@gmail.com</a>
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Cookies</h2>
        <p className="text-gray-600 mb-4">
          We use cookies to improve your experience, understand your usage of the website, and deliver personalized content. You can disable cookies through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Changes to This Policy</h2>
        <p className="text-gray-600 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any significant changes via our website or email.
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Last updated:</strong> August 6, 2025
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Contact Us</h2>
        <p className="text-gray-600 mb-2">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul className="list-none text-gray-600 mb-4">
          <li><strong>Company name:</strong> Sheet Tools</li>
          <li><strong>Email:</strong> <a href="mailto:eatomasss@gmail.com" className="text-blue-600 underline">eatomasss@gmail.com</a></li>
        </ul>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          © 2025 Sheet Tools. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;