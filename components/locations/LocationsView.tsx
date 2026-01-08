
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Icons } from '../shared/Icons';
import ManageBullsModal from './ManageBullsModal';
// FIX: Import UID to use it in component state and function signatures.
import { Location, UID } from '../../types';
import LocationFormModal from './LocationFormModal';
import ConfirmationModal from '../shared/ConfirmationModal';

interface LocationsViewProps {
  searchTerm: string;
}

const LocationsView: React.FC<LocationsViewProps> = ({ searchTerm }) => {
  const { locations, bulls, cows, deleteLocation } = useData();
  const [isBullsModalOpen, setBullsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  // FIX: Changed the type of 'id' in state from string to UID to match the data model.
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: UID; name: string } | null>(null);

  const activeLocations = useMemo(() => locations.filter(l => !l.isDeleted), [locations]);

  const filteredLocations = useMemo(() => {
    return activeLocations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeLocations, searchTerm]);

  // FIX: Changed 'id' parameter type from string to UID.
  const handleDeleteRequest = (id: UID, name: string) => {
    setDeleteConfirmation({ id, name });
  };
  
  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteLocation(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Gestió d'Ubicacions i Toros</h2>
          <div className="flex gap-4">
            <button onClick={() => setBullsModalOpen(true)} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Icons.Edit className="w-5 h-5 mr-2" />
              Gestionar Toros
            </button>
            <button onClick={() => setEditingLocation({} as Location)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Icons.Plus className="w-5 h-5 mr-2" />
              Nova Ubicació
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map(location => {
            const assignedBull = bulls.find(b => b.id === location.assignedBullId);
            const cowsInLocation = cows.filter(c => c.locationId === location.id && c.status !== 'DELETED').length;
            return (
              <div key={location.id} className="border dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
                     <div className="flex items-center space-x-1">
                       <button onClick={() => setEditingLocation(location)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Icons.Edit className="w-5 h-5"/></button>
                       <button onClick={() => handleDeleteRequest(location.id, location.name)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Icons.Trash className="w-5 h-5"/></button>
                     </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Toro Assignat: {assignedBull?.name || 'N/A'}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Vaques en aquesta ubicació: <strong>{cowsInLocation}</strong></p>
              </div>
            );
          })}
        </div>
      </div>
      <ManageBullsModal isOpen={isBullsModalOpen} onClose={() => setBullsModalOpen(false)} />
      <LocationFormModal isOpen={!!editingLocation} onClose={() => setEditingLocation(null)} location={editingLocation} />
      <ConfirmationModal 
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminació"
        message={`Segur que vols eliminar la ubicació "${deleteConfirmation?.name}"? Es mourà a la paperera.`}
      />
    </>
  );
};

export default LocationsView;
