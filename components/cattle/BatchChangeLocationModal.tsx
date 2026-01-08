
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { UID } from '../../types';
import { useData } from '../../hooks/useData';
import SearchableSelect from '../shared/SearchableSelect';

interface BatchChangeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cowIds: UID[];
  onSuccess: () => void;
}

const BatchChangeLocationModal: React.FC<BatchChangeLocationModalProps> = ({ isOpen, onClose, cowIds, onSuccess }) => {
  const [locationId, setLocationId] = useState<string | null>(null);
  const { batchUpdateCowLocations, locations } = useData();

  // FIX: Converted location IDs to strings to match the 'Option' type required by SearchableSelect.
  const locationOptions = locations.map(l => ({ value: String(l.id), label: l.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || cowIds.length === 0) {
      alert('Si us plau, selecciona una destinació.');
      return;
    }
    batchUpdateCowLocations(cowIds, locationId);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Canviar Ubicació de ${cowIds.length} Vaca(s)`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nova Ubicació
          </label>
           <SearchableSelect
            options={locationOptions}
            value={locationId}
            onChange={setLocationId}
            placeholder="Selecciona la nova ubicació"
          />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            Confirmar Canvi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BatchChangeLocationModal;
