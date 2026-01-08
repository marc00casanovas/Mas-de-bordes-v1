
import React, { useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Calf, CalfStatus, Sex } from '../../types';
import { Icons } from '../shared/Icons';

interface GroupedSales {
  [year: string]: Calf[];
}

const SalesHistoryView: React.FC = () => {
  const { calves, cows } = useData();

  const salesByYear = useMemo(() => {
    const soldCalves = calves.filter(c => c.status === CalfStatus.Sold && c.saleInfo);
    return soldCalves.reduce((acc, calf) => {
      const year = new Date(calf.saleInfo!.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(calf);
      return acc;
    }, {} as GroupedSales);
  }, [calves]);

  const sortedYears = Object.keys(salesByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-8">
      {sortedYears.map(year => (
        <div key={year} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold p-4 border-b dark:border-gray-700">Vendes - {year}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">DIB Vedell</th>
                  <th className="px-4 py-3">Sexe</th>
                  <th className="px-4 py-3">DIB Mare</th>
                  <th className="px-4 py-3">Data de Venda</th>
                  <th className="px-4 py-3">Destinació</th>
                </tr>
              </thead>
              <tbody>
                {salesByYear[year].sort((a,b) => new Date(b.saleInfo!.date).getTime() - new Date(a.saleInfo!.date).getTime()).map(calf => {
                  const mother = cows.find(c => c.id === calf.motherId);
                  return (
                    <tr key={calf.id} className="border-b dark:border-gray-700 last:border-b-0">
                      <td className="px-4 py-3 font-medium">{calf.dib}</td>
                      <td className={`px-4 py-3 font-semibold ${calf.sex === Sex.Male ? 'text-black dark:text-white' : 'text-green-600'}`}>
                        {calf.sex === Sex.Male ? 'Mascle' : 'Femella'}
                      </td>
                      <td className="px-4 py-3">{mother?.dib || 'N/A'}</td>
                      <td className="px-4 py-3">{calf.saleInfo!.date}</td>
                      <td className="px-4 py-3">{calf.saleInfo!.destination}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
       {sortedYears.length === 0 && (
         <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Icons.Sales className="w-24 h-24 text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Sense Vendes Registrades</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No hi ha historial de vendes per mostrar.</p>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryView;
