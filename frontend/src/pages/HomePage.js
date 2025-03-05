import React from "react";
import Sidebar from "../components/Sidebar";
import StocksList from "../components/StocksList";
import CryptosList from "../components/CryptosList";
import NewsWidget from "../components/NewsWidget";

const HomePage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 grid grid-cols-2 gap-4 p-4">
        <section>
          <StocksList />
          <CryptosList />
        </section>
        <aside>
          <NewsWidget />
        </aside>
      </main>
    </div>
  );
};

export default HomePage;
