
import React from 'react';
import { Icons } from '../shared/Icons';

interface HeaderProps {
  title: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, searchTerm, setSearchTerm }) => {
  return (
    <header className="flex items-center justify-between h-20 px-4 md:px-8 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca ràpida..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icons.Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
