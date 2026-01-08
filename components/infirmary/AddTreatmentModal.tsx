
import React, { useState, useMemo } from 'react';
import Modal from '../shared/Modal';
import { useData } from '../../hooks/useData';
import SearchableSelect from '../shared/SearchableSelect';
import { AnimalType, Treatment } from '../../types';

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({ isOpen, onClose }) => {
  const { addTreatment, cows, calves, bulls } = useData();
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [treatmentType, setTreatmentType] = useState('');
  const [dosage, setDosage] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [repeatRequired, setRepeatRequired] = useState(false);
  const [repeatDate, setRepeatDate] = useState('');

  // FIX: Convert animal IDs to strings to match the 'Option' type required by SearchableSelect.
  const animalOptions = useMemo(() => [
    ...cows.map(c => ({ value: String(c.id), label: `Vaca DIB: ${c.dib}` })),
    ...calves.map(c => ({ value: String(c.id), label: `Vedell DIB: ${c.dib}` })),
    ...bulls.map(b => ({ value: String(b.id), label: `Toro: ${b.name}` })),
  ], [cows, calves, bulls]);
  
  const getAnimalType = (selectedId: string): AnimalType => {
      if(cows.some(c => String(c.id) === selectedId)) return 'Cow';
      if(calves.some(c => String(c.id) === selectedId)) return 'Calf';
      return 'Bull';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !treatmentType || !dosage || !dateApplied) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    if (repeatRequired && !repeatDate) {
        alert('Si us plau, especifica la data de repetició.');
        return;
    }

    addTreatment({
      animalId,
      animalType: getAnimalType(animalId),
      treatmentType,
      dosage,
      dateApplied,
      repeatRequired,
      repeatDate: repeatRequired ? repeatDate : undefined,
      // FIX: The Treatment type requires isDeleted. New treatments are not deleted.
      isDeleted: false,
    });
    
    onClose();
    // Reset form
    setAnimalId(null);
    setTreatmentType('');
    setDosage('');
    setDateApplied(new Date().toISOString().split('T')[0]);
    setRepeatRequired(false);
    setRepeatDate('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Afegir Nou Tractament">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Animal</label>
          <SearchableSelect options={animalOptions} value={animalId} onChange={setAnimalId} placeholder="Selecciona un animal" />
        </div>
        <div>
          <label htmlFor="treatmentType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipus de Tractament</label>
          <input
            type="text" id="treatmentType" value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Vacuna, antibiòtic, etc." required
          />
        </div>
        <div>
          <label htmlFor="dosage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dosi</label>
          <input
            type="text" id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Ex: 10ml" required
          />
        </div>
        <div>
          <label htmlFor="dateApplied" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data d'Aplicació</label>
          <input
            type="date" id="dateApplied" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
         <div className="flex items-center">
            <input id="repeatRequired" type="checkbox" checked={repeatRequired} onChange={e => setRepeatRequired(e.target.checked)} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="repeatRequired" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">S'ha de repetir?</label>
        </div>
        {repeatRequired && (
            <div>
                <label htmlFor="repeatDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data de Repetició</label>
                <input
                    type="date" id="repeatDate" value={repeatDate} onChange={(e) => setRepeatDate(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                />
            </div>
        )}
        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            Afegir Tractament
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTreatmentModal;
