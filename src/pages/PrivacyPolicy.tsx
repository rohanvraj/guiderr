import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="page-container p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="mb-4">
        At <strong>Guiderr</strong>, we value your privacy and are committed to protecting your personal information.
        This Privacy Policy explains how we collect, use, and safeguard your data when you access or purchase
        digital products from our website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-2">We may collect the following information:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>Name and email address when you purchase a product.</li>
        <li>Payment information processed securely by Razorpay.</li>
        <li>Basic usage data such as device type and browser (for analytics).</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To deliver your digital products.</li>
        <li>To send purchase confirmations or product access emails.</li>
        <li>To improve our website and user experience.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Payment & Security</h2>
      <p className="mb-4">
        We do not store your credit/debit card details. All payments are processed securely
        through <strong>Razorpay</strong> using industry-standard encryption and PCI-DSS compliance.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Sharing of Information</h2>
      <p className="mb-4">
        We do <strong>not sell or share</strong> your personal information with third parties, except service
        providers like Razorpay that assist in payment processing.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Cookies &amp; Analytics</h2>
      <p className="mb-4">
        We use <strong>Google Analytics</strong> to monitor site traffic and improve user experience.
        Google Analytics uses cookies to collect standard log information and visitor behaviour in an
        anonymous form. No personally identifiable information is sent to Google Analytics. You can
        opt out at any time via{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">
          Google's opt-out browser add-on
        </a>.
      </p>
      <p className="mb-4">
        We may use basic session cookies to enhance your browsing experience. You can choose to
        disable cookies in your browser settings.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Advertisements</h2>
      <p className="mb-4">
        We may display third-party advertisements (such as <strong>Google AdSense</strong>) in the
        future. These advertising providers may use cookies and similar tracking technologies to serve
        ads based on a user's prior visits to our website or other websites. You may opt out of
        personalised advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">
          Google Ads Settings
        </a>.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Email Communications</h2>
      <p className="mb-4">
        We may contact you for order updates or support. We do not send promotional spam.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Your Rights</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Request deletion of your data.</li>
        <li>Request correction of information.</li>
        <li>Request details on what data we hold.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">9. Limitation of Liability</h2>
      <p className="mb-4">
        Guiderr is an educational platform. All content is provided for informational purposes only
        and does not constitute professional advice (financial, legal, medical, or otherwise). Any
        action you take based on the information on this website is strictly at your own risk.
        Guiderr and its authors will not be liable for any losses or damages in connection with the
        use of our website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact Us</h2>
      <p className="mb-4">
        For any privacy-related questions, please email us at{" "}
        <a href="mailto:rohanrworld@gmail.com" className="text-blue-600 font-medium">
          rohanrworld@gmail.com
        </a>.
      </p>

      <p className="text-sm text-slate-500 mt-6">
        Last updated: {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
