import React from "react";

const CancellationsRefunds: React.FC = () => {
  return (
    <div className="page-container p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Cancellations & Refunds</h1>
      <p className="mb-2">
        Since all products are digital, we do not offer cancellations or refunds once the product is delivered.
      </p>
      <p>
        If you face any issues accessing your downloads, please contact us at 
        <span className="text-blue-600 font-medium"> rohanrworld@gmail.com</span>.
      </p>
    </div>
  );
};

export default CancellationsRefunds;
