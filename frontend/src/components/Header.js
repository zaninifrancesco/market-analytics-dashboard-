import React from 'react';
import SearchBar from './SearchBar';
import { BellIcon, UserIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-around">
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>
      
    </header>
  );
};

export default Header;