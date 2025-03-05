import React from "react";
import { Link } from "react-router-dom";
import { 
  HomeIcon, 
  NewspaperIcon, 
  TrendingUpIcon, 
  CandlestickChartIcon, 
  BitcoinIcon 
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 shadow-xl">
      <div className="flex items-center mb-8 border-b border-gray-700 pb-4">
        <div className="bg-blue-500 rounded-full p-2 mr-3">
          <TrendingUpIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Market Analytics</h2>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <SidebarItem 
            icon={<HomeIcon className="w-5 h-5" />} 
            text="Home" 
            to="/" 
          />
          <SidebarItem 
            icon={<NewspaperIcon className="w-5 h-5" />} 
            text="News" 
            to="/news" 
          />
          <SidebarItem 
            icon={<CandlestickChartIcon className="w-5 h-5" />} 
            text="Stocks" 
            to="/stocks" 
          />
          <SidebarItem 
            icon={<BitcoinIcon className="w-5 h-5" />} 
            text="Crypto" 
            to="/crypto" 
          />
        </ul>
      </nav>


    </aside>
  );
};

// Componente helper per gli item della sidebar
const SidebarItem = ({ icon, text, to }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
      >
        <span className="mr-3 text-gray-400 group-hover:text-white">
          {icon}
        </span>
        <span className="font-medium group-hover:text-white">{text}</span>
      </Link>
    </li>
  );
};


export default Sidebar;