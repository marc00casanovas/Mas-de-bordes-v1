
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
// FIX: Import UID type to use in function signatures.
import { Treatment, AnimalType, UID } from '../../types';
import { Icons } from '../shared/Icons';
import AddTreatmentModal from './AddTreatmentModal';

interface InfirmaryViewProps {
  searchTerm: string;
}

const InfirmaryView: React.FC<InfirmaryViewProps> = ({ searchTerm }) => {
  const { treatments, cows, calves, bulls } = useData();
  const [animalTypeFilter, setAnimalTypeFilter] = useState<AnimalType | 'All'>('All');
  const [ageFilter, setAgeFilter] = useState<number | null>(null); // age in months
  const [isAddTreatmentModalOpen, setAddTreatmentModalOpen] = useState(false);

  // FIX: Changed animalId parameter type from string to UID to match the data type.
  const getAnimalIdentifier = (animalId: UID, animalType: AnimalType): string => {
    switch(animalType) {
      case 'Cow': return cows.find(c => c.id === animalId)?.dib || '';
      case 'Calf': return calves.find(c => c.id === animalId)?.dib || '';
      case 'Bull': return bulls.find(b => b.id === animalId)?.name || '';
      default: return '';
    }
  };
  
  // FIX: Changed animalId parameter type from string to UID to match the data type.
  const getAnimalName = (animalId: UID, animalType: AnimalType) => {
     switch(animalType) {
      case 'Cow': return `Vaca DIB: ${getAnimalIdentifier(animalId, animalType)}`;
      case 'Calf': return `Vedell DIB: ${getAnimalIdentifier(animalId, animalType)}`;
      case 'Bull': return `Toro: ${getAnimalIdentifier(animalId, animalType)}`;
      default: return 'N/A';
    }
  };
  
  const filteredTreatments = useMemo(() => {
    return treatments
      .filter(t => animalTypeFilter === 'All' || t.animalType === animalTypeFilter)
      .filter(t => {
        if (!ageFilter || t.animalType !== 'Calf') return true;
        const calf = calves.find(c => c.id === t.animalId);
        if (!calf) return false;
        const birthDate = new Date(calf.birthDate);
        const ageInMonths = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        return ageInMonths < ageFilter;
      })
      .filter(t => {
        const identifier = getAnimalIdentifier(t.animalId, t.animalType);
        return identifier.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [treatments, animalTypeFilter, ageFilter, calves, searchTerm, cows, bulls]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Registres de Tractaments</h2>
          <div className="flex flex-wrap gap-4 items-center">
              {/* Filters */}
              <select 
                  value={animalTypeFilter} 
                  onChange={e => setAnimalTypeFilter(e.target.value as AnimalType | 'All')}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                  <option value="All">Tots els Animals</option>
                  <option value="Cow">Vaques</option>
                  <option value="Calf">Vedells</option>
                  <option value="Bull">Toros</option>
              </select>
              <select
                  value={ageFilter ?? ''}
                  onChange={e => setAgeFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={animalTypeFilter !== 'Calf'}
              >
                  <option value="">Filtrar per edat (vedells)</option>
                  <option value="2">Menys de 2 mesos</option>
                  <option value="6">Menys de 6 mesos</option>
                  <option value="12">Menys de 12 mesos</option>
              </select>
              <button 
                onClick={() => setAddTreatmentModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Icons.Plus className="w-5 h-5 mr-2" />
                  Nou Tractament
              </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3">Animal</th>
                <th className="px-4 py-3">Tipus Tractament</th>
                <th className="px-4 py-3">Data Aplicació</th>
                <th className="px-4 py-3">Repetició Necessària</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.map(treatment => {
                const needsAttention = treatment.repeatRequired && treatment.repeatDate && treatment.repeatDate <= today;
                return (
                  <tr key={treatment.id} className={`border-b dark:border-gray-700 ${needsAttention ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
                    <td className="px-4 py-3 font-medium">{getAnimalName(treatment.animalId, treatment.animalType)}</td>
                    <td className="px-4 py-3">{treatment.treatmentType}</td>
                    <td className="px-4 py-3">{treatment.dateApplied}</td>
                    <td className="px-4 py-3">
                      {treatment.repeatRequired ? (
                        <span className={`flex items-center ${needsAttention ? 'text-red-500 font-bold' : ''}`}>
                          {needsAttention && <Icons.Warning className="w-4 h-4 mr-2" />}
                          Sí ({treatment.repeatDate})
                        </span>
                      ) : (
                        'No'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AddTreatmentModal isOpen={isAddTreatmentModalOpen} onClose={() => setAddTreatmentModalOpen(false)} />
    </>
  );
};

export default InfirmaryView;
