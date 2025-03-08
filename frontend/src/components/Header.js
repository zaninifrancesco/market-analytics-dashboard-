import React from 'react';
import { BellIcon, UserIcon } from 'lucide-react';
import SearchBar from './SearchBar';

const Header = () => {
  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-center"> {/* Modificato qui per centrare */}
          <div className="w-full max-w-2xl"> {/* Aggiunto div con larghezza specifica */}
            <SearchBar />
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;