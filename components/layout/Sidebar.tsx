
import React from 'react';
import { NavSection } from '../../types';
import { Icons } from '../shared/Icons';

interface SidebarProps {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navItems: { name: NavSection; icon: React.ElementType }[] = [
    { name: 'Boví', icon: Icons.Cow },
    { name: 'Infermeria', icon: Icons.Infirmary },
    { name: 'Ubicacions', icon: Icons.Location },
    { name: 'Historial de Vendes', icon: Icons.Sales },
    { name: 'Historial de Morts', icon: Icons.Skull },
    { name: 'Paperera', icon: Icons.Trash },
  ];

  return (
    <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
      <div className="flex items-center justify-center md:justify-start md:pl-6 h-20 border-b dark:border-gray-700">
        <Icons.Cow className="h-8 w-8 text-green-600" />
        <h1 className="hidden md:block ml-3 text-xl font-bold text-gray-800 dark:text-white">GestioRamadera</h1>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveSection(item.name)}
            className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
              activeSection === item.name
                ? 'bg-green-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="hidden md:block ml-4 font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
