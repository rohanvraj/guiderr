import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero / main content */}
      <main className="flex-grow">
        <Hero />
      </main>

      {/* Footer with policy links */}
      <Footer />
    </div>
  );
};

export default HomePage;
