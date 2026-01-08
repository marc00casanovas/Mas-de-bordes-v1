
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useData } from '../../hooks/useData';
import { Location } from '../../types';
import SearchableSelect from '../shared/SearchableSelect';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
}

const LocationFormModal: React.FC<LocationFormModalProps> = ({ isOpen, onClose, location }) => {
  const { addLocation, updateLocation, bulls } = useData();
  const [name, setName] = useState('');
  const [assignedBullId, setAssignedBullId] = useState<string | null>(null);

  const isEditMode = location && location.id;

  useEffect(() => {
    if(isOpen) {
      if (isEditMode) {
        setName(location.name);
        // FIX: Convert location.assignedBullId to string to match the state type.
        setAssignedBullId(String(location.assignedBullId));
      } else {
        setName('');
        setAssignedBullId(null);
      }
    }
  }, [location, isOpen]);

  // FIX: Convert bull IDs to strings to match the 'Option' type required by SearchableSelect.
  const bullOptions = bulls.map(b => ({ value: String(b.id), label: b.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !assignedBullId) {
      alert('Si us plau, omple tots els camps.');
      return;
    }
    
    if (isEditMode) {
      // FIX: The updateLocation function expects a full Location object.
      // Spreading the existing location object preserves all its properties like `isDeleted`.
      updateLocation({ ...location, name, assignedBullId });
    } else {
      // FIX: The Omit<Location, "id"> type requires isDeleted. New locations are not deleted.
      addLocation({ name, assignedBullId, isDeleted: false });
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Ubicació" : "Nova Ubicació"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nom de la Ubicació
          </label>
          <input
            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Paddock A, Estable 7..." required
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Toro Assignat
          </label>
          <SearchableSelect options={bullOptions} value={assignedBullId} onChange={setAssignedBullId} placeholder="Selecciona un toro" />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            {isEditMode ? "Guardar Canvis" : "Crear Ubicació"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LocationFormModal;
