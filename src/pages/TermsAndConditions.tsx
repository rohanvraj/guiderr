import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>
      <div className="max-w-3xl mx-auto text-gray-700 space-y-4">
        <p>Welcome to Guiderr. By purchasing or using our digital guides and ebooks, you agree to the following terms:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All content is for personal educational purposes only.</li>
          <li>Sharing or redistributing purchased content without permission is strictly prohibited.</li>
          <li>Guiderr is not responsible for any outcomes based on the use of digital products.</li>
          <li>All prices and product details are subject to change without notice.</li>
        </ul>
        <p>By using our services, you acknowledge that you have read and agreed to these terms.</p>
      </div>
    </div>
  );
}
