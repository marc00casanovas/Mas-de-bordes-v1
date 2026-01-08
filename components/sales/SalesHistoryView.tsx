
import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { Calf, CalfStatus, Sex, UID } from '../../types';
import { Icons } from '../shared/Icons';
import ConfirmationModal from '../shared/ConfirmationModal';

interface GroupedSales {
  [year: string]: Calf[];
}

const SalesHistoryView: React.FC = () => {
  const { calves, cows, deleteCalf } = useData();
  const [selectedIds, setSelectedIds] = useState<UID[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: UID[]; message: string } | null>(null);

  const soldCalves = useMemo(() => 
    calves.filter(c => c.status === CalfStatus.Sold && c.saleInfo),
  [calves]);

  const salesByYear = useMemo(() => {
    return soldCalves.reduce((acc, calf) => {
      const year = new Date(calf.saleInfo!.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(calf);
      return acc;
    }, {} as GroupedSales);
  }, [soldCalves]);

  const sortedYears = Object.keys(salesByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const handleSelect = (id: UID) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (year: string, checked: boolean) => {
    const yearIds = salesByYear[year].map(c => c.id);
    if (checked) {
      setSelectedIds(prev => Array.from(new Set([...prev, ...yearIds])));
    } else {
      setSelectedIds(prev => prev.filter(id => !yearIds.includes(id)));
    }
  };

  const handleDeleteRequest = (ids: UID[]) => {
    const message = ids.length === 1 
      ? "Segur que vols moure aquesta venda a la paperera?" 
      : `Segur que vols moure ${ids.length} vendes a la paperera?`;
    setDeleteConfirmation({ ids, message });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteConfirmation.ids.forEach(id => deleteCalf(id));
      setSelectedIds([]);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="space-y-8">
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-green-100 dark:bg-green-900/80 p-4 rounded-lg shadow-md flex justify-between items-center mb-4 border border-green-200 dark:border-green-800">
          <span className="font-bold">{selectedIds.length} vendes seleccionades</span>
          <button 
            onClick={() => handleDeleteRequest(selectedIds)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Icons.Trash className="w-4 h-4 mr-2" />
            Eliminar Seleccionats
          </button>
        </div>
      )}

      {sortedYears.map(year => (
        <div key={year} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold">Vendes - {year}</h2>
            <div className="flex items-center">
               <label className="text-sm mr-2 text-gray-500">Seleccionar Tot el {year}</label>
               <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                onChange={(e) => handleSelectAll(year, e.target.checked)}
                checked={salesByYear[year].every(c => selectedIds.includes(c.id))}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-4 py-3">DIB Vedell</th>
                  <th className="px-4 py-3">Sexe</th>
                  <th className="px-4 py-3">DIB Mare</th>
                  <th className="px-4 py-3">Data de Venda</th>
                  <th className="px-4 py-3">Destinació</th>
                  <th className="px-4 py-3 w-16 text-right">Accions</th>
                </tr>
              </thead>
              <tbody>
                {salesByYear[year].sort((a,b) => new Date(b.saleInfo!.date).getTime() - new Date(a.saleInfo!.date).getTime()).map(calf => {
                  const mother = cows.find(c => c.id === calf.motherId);
                  const isSelected = selectedIds.includes(calf.id);
                  return (
                    <tr key={calf.id} className={`border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelect(calf.id)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{calf.dib}</td>
                      <td className={`px-4 py-3 font-semibold ${calf.sex === Sex.Male ? 'text-black dark:text-white' : 'text-green-600'}`}>
                        {calf.sex === Sex.Male ? 'Mascle' : 'Femella'}
                      </td>
                      <td className="px-4 py-3">{mother?.dib || 'N/A'}</td>
                      <td className="px-4 py-3">{calf.saleInfo!.date}</td>
                      <td className="px-4 py-3">{calf.saleInfo!.destination}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteRequest([calf.id])}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
       {sortedYears.length === 0 && (
         <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Icons.Sales className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Sense Vendes Registrades</h2>
            <p className="mt-2 text-gray-500">No hi ha historial de vendes per mostrar.</p>
        </div>
      )}
      {deleteConfirmation && (
        <ConfirmationModal 
          isOpen={true}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={confirmDelete}
          title="Eliminar Venda"
          message={deleteConfirmation.message}
          confirmText="Eliminar"
          confirmButtonVariant="danger"
        />
      )}
    </div>
  );
};

export default SalesHistoryView;
