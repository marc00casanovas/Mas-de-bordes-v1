
import React, { useMemo } from 'react';
import { useData } from '../../hooks/useData';
// FIX: Import UID to be used in the DeceasedAnimal type.
import { AnimalStatus, CalfStatus, Sex, UID } from '../../types';
import { Icons } from '../shared/Icons';

type DeceasedAnimal = {
    // FIX: Changed id type from string to UID to match the data model.
    id: UID;
    type: 'Vaca' | 'Vedell' | 'Toro';
    identifier: string; // DIB or Name
    deathDate: string;
    sex?: Sex;
};

const DeathHistoryView: React.FC = () => {
  const { cows, calves, bulls } = useData();

  const deathsByYear = useMemo(() => {
    const allDeceased: DeceasedAnimal[] = [];

    cows.filter(c => c.status === AnimalStatus.Dead && c.deathDate).forEach(c => {
      allDeceased.push({ id: c.id, type: 'Vaca', identifier: c.dib, deathDate: c.deathDate! });
    });
    
    calves.filter(c => c.status === CalfStatus.Dead && c.deathDate).forEach(c => {
      allDeceased.push({ id: c.id, type: 'Vedell', identifier: c.dib, deathDate: c.deathDate!, sex: c.sex });
    });
    
    bulls.filter(b => b.status === AnimalStatus.Dead && b.deathDate).forEach(b => {
      allDeceased.push({ id: b.id, type: 'Toro', identifier: b.name, deathDate: b.deathDate! });
    });
    
    return allDeceased.reduce((acc, animal) => {
      const year = new Date(animal.deathDate).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(animal);
      return acc;
    }, {} as Record<string, DeceasedAnimal[]>);

  }, [cows, calves, bulls]);

  const sortedYears = Object.keys(deathsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-8">
      {sortedYears.map(year => (
        <div key={year} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold p-4 border-b dark:border-gray-700">Morts - {year}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Tipus</th>
                  <th className="px-4 py-3">Identificador</th>
                  <th className="px-4 py-3">Data de Mort</th>
                </tr>
              </thead>
              <tbody>
                {deathsByYear[year].sort((a,b) => new Date(b.deathDate).getTime() - new Date(a.deathDate).getTime()).map(animal => (
                  <tr key={String(animal.id)} className="border-b dark:border-gray-700 last:border-b-0">
                    <td className="px-4 py-3 font-medium">{animal.type}</td>
                    <td className={`px-4 py-3 font-semibold ${animal.sex === Sex.Male ? 'text-black dark:text-white' : animal.sex === Sex.Female ? 'text-green-600' : ''}`}>
                      {animal.identifier}
                    </td>
                    <td className="px-4 py-3">{animal.deathDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
       {sortedYears.length === 0 && (
         <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Icons.Skull className="w-24 h-24 text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Sense Morts Registrades</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No hi ha historial de morts per mostrar.</p>
        </div>
      )}
    </div>
  );
};

export default DeathHistoryView;
