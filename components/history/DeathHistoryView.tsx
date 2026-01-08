
import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { AnimalStatus, CalfStatus, Sex, UID } from '../../types';
import { Icons } from '../shared/Icons';
import ConfirmationModal from '../shared/ConfirmationModal';

type DeceasedAnimal = {
    id: UID;
    type: 'Cow' | 'Calf' | 'Bull';
    identifier: string; // DIB or Name
    deathDate: string;
    sex?: Sex;
};

const DeathHistoryView: React.FC = () => {
  const { cows, calves, bulls, deleteCow, deleteCalf, deleteBull } = useData();
  const [selectedIds, setSelectedIds] = useState<{id: UID, type: string}[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ items: {id: UID, type: string}[], message: string } | null>(null);

  const allDeceased = useMemo(() => {
    const list: DeceasedAnimal[] = [];
    cows.filter(c => c.status === AnimalStatus.Dead && c.deathDate).forEach(c => {
      list.push({ id: c.id, type: 'Cow', identifier: c.dib, deathDate: c.deathDate! });
    });
    calves.filter(c => c.status === CalfStatus.Dead && c.deathDate).forEach(c => {
      list.push({ id: c.id, type: 'Calf', identifier: c.dib, deathDate: c.deathDate!, sex: c.sex });
    });
    bulls.filter(b => b.status === AnimalStatus.Dead && b.deathDate).forEach(b => {
      list.push({ id: b.id, type: 'Bull', identifier: b.name, deathDate: b.deathDate! });
    });
    return list;
  }, [cows, calves, bulls]);

  const deathsByYear = useMemo(() => {
    return allDeceased.reduce((acc, animal) => {
      const year = new Date(animal.deathDate).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(animal);
      return acc;
    }, {} as Record<string, DeceasedAnimal[]>);
  }, [allDeceased]);

  const sortedYears = Object.keys(deathsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const handleSelect = (id: UID, type: string) => {
    setSelectedIds(prev => 
      prev.some(i => i.id === id) 
        ? prev.filter(i => i.id !== id) 
        : [...prev, {id, type}]
    );
  };

  const handleSelectAllYear = (year: string, checked: boolean) => {
    const yearItems = deathsByYear[year].map(a => ({id: a.id, type: a.type}));
    if (checked) {
      setSelectedIds(prev => {
        const otherItems = prev.filter(i => !yearItems.some(yi => yi.id === i.id));
        return [...otherItems, ...yearItems];
      });
    } else {
      setSelectedIds(prev => prev.filter(i => !yearItems.some(yi => yi.id === i.id)));
    }
  };

  const handleDeleteRequest = (items: {id: UID, type: string}[]) => {
    const message = items.length === 1 
      ? "Segur que vols moure aquest registre de mort a la paperera?" 
      : `Segur que vols moure ${items.length} registres de mort a la paperera?`;
    setDeleteConfirmation({ items, message });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteConfirmation.items.forEach(item => {
        if (item.type === 'Cow') deleteCow(item.id);
        else if (item.type === 'Calf') deleteCalf(item.id);
        else if (item.type === 'Bull') deleteBull(item.id);
      });
      setSelectedIds([]);
      setDeleteConfirmation(null);
    }
  };

  const getTypeName = (type: string) => {
    if (type === 'Cow') return 'Vaca';
    if (type === 'Calf') return 'Vedell';
    return 'Toro';
  };

  return (
    <div className="space-y-8">
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-red-100 dark:bg-red-900/80 p-4 rounded-lg shadow-md flex justify-between items-center mb-4 border border-red-200">
          <span className="font-bold text-red-800 dark:text-red-200">{selectedIds.length} registres seleccionats</span>
          <button 
            onClick={() => handleDeleteRequest(selectedIds)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Icons.Trash className="w-4 h-4 mr-2" />
            Moure a Paperera
          </button>
        </div>
      )}

      {sortedYears.map(year => (
        <div key={year} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold">Morts - {year}</h2>
            <div className="flex items-center">
               <label className="text-sm mr-2 text-gray-500">Seleccionar Tot el {year}</label>
               <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                onChange={(e) => handleSelectAllYear(year, e.target.checked)}
                checked={deathsByYear[year].every(a => selectedIds.some(si => si.id === a.id))}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 w-12 text-center"></th>
                  <th className="px-4 py-3">Tipus</th>
                  <th className="px-4 py-3">Identificador</th>
                  <th className="px-4 py-3">Data de Mort</th>
                  <th className="px-4 py-3 w-16 text-right">Accions</th>
                </tr>
              </thead>
              <tbody>
                {deathsByYear[year].sort((a,b) => new Date(b.deathDate).getTime() - new Date(a.deathDate).getTime()).map(animal => {
                  const isSelected = selectedIds.some(si => si.id === animal.id);
                  return (
                    <tr key={String(animal.id)} className={`border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelect(animal.id, animal.type)}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{getTypeName(animal.type)}</td>
                      <td className={`px-4 py-3 font-semibold ${animal.sex === Sex.Male ? 'text-black dark:text-white' : animal.sex === Sex.Female ? 'text-green-600' : ''}`}>
                        {animal.identifier}
                      </td>
                      <td className="px-4 py-3">{animal.deathDate}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteRequest([{id: animal.id, type: animal.type}])}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
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
            <Icons.Skull className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Sense Morts Registrades</h2>
            <p className="mt-2 text-gray-500">L'historial de baixes per mort és buit.</p>
        </div>
      )}
      {deleteConfirmation && (
        <ConfirmationModal 
          isOpen={true}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={confirmDelete}
          title="Eliminar Registre de Mort"
          message={deleteConfirmation.message}
          confirmText="Moure a Paperera"
          confirmButtonVariant="danger"
        />
      )}
    </div>
  );
};

export default DeathHistoryView;
