import React from "react";
import Sidebar from "../components/Sidebar";
import StocksList from "../components/StocksList";
import CryptosList from "../components/CryptosList";
import NewsWidget from "../components/NewsWidget";
import Header from "../components/Header";

const HomePage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-auto">
          <section>
            <StocksList />
            <CryptosList />
          </section>
          <aside>
            <NewsWidget />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default HomePage;