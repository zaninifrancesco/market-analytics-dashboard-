import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  NewspaperIcon, 
  BarChart3Icon, 
  TrendingUpIcon, 
  BitcoinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  Star,
  InfoIcon,
  Bell,
  Icon
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Aggiungi listener per il resize
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside 
      className={`
        ${collapsed ? 'w-20' : 'w-72'}
        transition-all duration-300 bg-white border-r border-gray-200 
        text-gray-800 shadow-sm flex-shrink-0 
        md:h-screen h-auto z-10
      `}
    >
      {/* Toggle button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
      >
        {collapsed ? 
          <ChevronRightIcon className="w-4 h-4 text-gray-600" /> : 
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        }
      </button>

      <div>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} mb-10 pb-6 border-b border-gray-200`}>
          <div className="bg-blue-500 rounded-xl p-2 shadow-sm">
            <TrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <h2 className="text-xl font-bold ml-3 text-gray-700">
              Market Analytics
            </h2>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-3">
            <SidebarItem 
              icon={<HomeIcon className="w-5 h-5" />} 
              text="Dashboard" 
              to="/" 
              collapsed={collapsed}
              active={location.pathname === '/'}
            />
            <SidebarItem 
              icon={<TrendingUpIcon className="w-5 h-5" />} 
              text="Stocks" 
              to="/stocks" 
              collapsed={collapsed}
              active={location.pathname.includes('/stock')}
            />
            <SidebarItem 
              icon={<BitcoinIcon className="w-5 h-5" />} 
              text="Crypto" 
              to="/crypto" 
              collapsed={collapsed}
              active={location.pathname.includes('/crypto')}
            />
            <SidebarItem 
              icon={<Star className="w-5 h-5" />} 
              text="Watchlist" 
              to="/watchlist" 
              collapsed={collapsed}
              active={location.pathname === '/watchlist'}
            />
            <SidebarItem 
              icon={<NewspaperIcon className="w-5 h-5" />} 
              text="News" 
              to="/news" 
              collapsed={collapsed}
              active={location.pathname === '/news'}
            />
            <SidebarItem 
              icon={<Bell className="w-5 h-5" />} 
              text="Alerts" 
              to="/alerts" 
              collapsed={collapsed}
              active={location.pathname === '/analytics'}
            />
          </ul>
        </nav>
      </div>

      {/* Bottom section */}
      <div className={`mt-auto ${collapsed ? 'border-t border-gray-200 pt-4' : 'border-t border-gray-200 pt-4'}`}>
        <ul className="space-y-3">
          <SidebarItem 
            icon={<InfoIcon className="w-5 h-5" />} 
            text="About" 
            to="/about" 
            collapsed={collapsed}
            active={location.pathname === '/about'}
          />
        </ul>
      </div>
    </aside>
  );
};

// Componente helper per gli item della sidebar
const SidebarItem = ({ icon, text, to, collapsed, active }) => {
  return (
    <li>
      <Link 
        to={to} 
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg
          ${active 
            ? 'bg-blue-50 shadow-sm border border-gray-100'
            : 'hover:bg-gray-50'
          } transition-all duration-200`}
      >
        <span className={`${active ? 'text-blue-600' : 'text-gray-500'}`}>
          {icon}
        </span>
        {!collapsed && (
          <span className={`font-medium ml-3 ${active ? 'text-blue-600' : 'text-gray-700'}`}>
            {text}
          </span>
        )}
        {active && !collapsed && (
          <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>
        )}
      </Link>
    </li>
  );
};

export default Sidebar;