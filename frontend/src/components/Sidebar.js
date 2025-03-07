import React, { useState } from "react";
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
  Bell
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 h-screen bg-white border-r border-gray-200 text-gray-800 shadow-sm flex flex-col justify-between p-4 relative`}
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
            icon={<SettingsIcon className="w-5 h-5" />} 
            text="Settings" 
            to="/settings" 
            collapsed={collapsed}
            active={location.pathname === '/settings'}
          />
          <SidebarItem 
            icon={<HelpCircleIcon className="w-5 h-5" />} 
            text="Help" 
            to="/help" 
            collapsed={collapsed}
            active={location.pathname === '/help'}
          />
          <li>
            <button className={`w-full flex items-center p-3 ${collapsed ? 'justify-center' : 'justify-start'} rounded-lg hover:bg-red-50 transition-all duration-200`}>
              <span className="text-red-500">
                <LogOutIcon className="w-5 h-5" />
              </span>
              {!collapsed && <span className="font-medium ml-3 text-red-500">Logout</span>}
            </button>
          </li>
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