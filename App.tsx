
import React, { useState, useContext } from 'react';
import { DataProvider, DataContext } from './context/DataContext';
import Sidebar from './components/layout/Sidebar';
import CattleView from './components/cattle/CattleView';
import InfirmaryView from './components/infirmary/InfirmaryView';
import LocationsView from './components/locations/LocationsView';
import SalesHistoryView from './components/sales/SalesHistoryView';
import { NavSection } from './types';
import Header from './components/layout/Header';
import DeathHistoryView from './components/history/DeathHistoryView';
import TrashView from './components/trash/TrashView';
import { Icons } from './components/shared/Icons';
import PWAInstallPrompt from './components/shared/PWAInstallPrompt';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('Boví');
  const [searchTerm, setSearchTerm] = useState('');
  const context = useContext(DataContext);

  if (context?.isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Icons.Cow className="w-24 h-24 text-green-600 animate-pulse" />
        <h2 className="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-300">Carregant Dades...</h2>
        <p className="text-gray-500">Un moment, si us plau.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Boví':
        return <CattleView searchTerm={searchTerm} />;
      case 'Infermeria':
        return <InfirmaryView searchTerm={searchTerm} />;
      case 'Ubicacions':
        return <LocationsView searchTerm={searchTerm} />;
      case 'Historial de Vendes':
        return <SalesHistoryView />;
      case 'Historial de Morts':
        return <DeathHistoryView />;
      case 'Paperera':
        return <TrashView searchTerm={searchTerm} />;
      default:
        return <CattleView searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex text-gray-800 dark:text-gray-200">
      <PWAInstallPrompt />
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 flex flex-col transition-all duration-300">
        <Header title={activeSection} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
