import React from 'react';
import { BellIcon, UserIcon } from 'lucide-react';
import SearchBar from './SearchBar';

const Header = () => {
  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="text-gray-600" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <UserIcon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;