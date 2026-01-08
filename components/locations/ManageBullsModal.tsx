
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useData } from '../../hooks/useData';
// FIX: Import UID to use in state and function signatures.
import { Bull, AnimalStatus, UID } from '../../types';
import { Icons } from '../shared/Icons';
import ConfirmationModal from '../shared/ConfirmationModal';

interface ManageBullsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageBullsModal: React.FC<ManageBullsModalProps> = ({ isOpen, onClose }) => {
  const { bulls, addBull, updateBull, deleteBull } = useData();
  const [newBullName, setNewBullName] = useState('');
  const [editingBull, setEditingBull] = useState<Bull | null>(null);
  // FIX: Changed id type from string to UID.
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: UID; name: string } | null>(null);


  const handleAddBull = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBullName.trim()) return;
    addBull({ name: newBullName.trim(), status: AnimalStatus.Alive });
    setNewBullName('');
  };

  const handleUpdateBull = () => {
    if (!editingBull || !editingBull.name.trim()) return;
    updateBull(editingBull);
    setEditingBull(null);
  }
  
  // FIX: Changed id type from string to UID.
  const handleDeleteRequest = (id: UID, name: string) => {
    setDeleteConfirmation({ id, name });
  };
  
  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteBull(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };


  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Toros">
      <div className="space-y-4">
        <form onSubmit={handleAddBull} className="flex gap-2">
          <input
            type="text"
            value={newBullName}
            onChange={(e) => setNewBullName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Nom del nou toro"
          />
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            Afegir
          </button>
        </form>

        <div className="max-h-80 overflow-y-auto space-y-2">
            {bulls.map(bull => (
                <div key={bull.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {editingBull?.id === bull.id ? (
                        <div className="flex-grow mr-2">
                          <input 
                              type="text"
                              value={editingBull.name}
                              onChange={(e) => setEditingBull({...editingBull, name: e.target.value})}
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-1.5 dark:bg-gray-600"
                              autoFocus
                          />
                           <select value={editingBull.status} onChange={e => setEditingBull({...editingBull, status: e.target.value as AnimalStatus})} className="mt-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-1.5 dark:bg-gray-600">
                                <option value={AnimalStatus.Alive}>Viu</option>
                                <option value={AnimalStatus.Dead}>Mort</option>
                                <option value={AnimalStatus.Sold}>Venut</option>
                           </select>
                        </div>
                    ) : (
                        <span className={`${bull.status !== AnimalStatus.Alive ? 'line-through text-gray-500' : ''}`}>{bull.name} ({bull.status})</span>
                    )}
                    <div className="flex gap-2">
                        {editingBull?.id === bull.id ? (
                            <button onClick={handleUpdateBull} className="p-1.5 text-green-600 hover:text-green-800"><Icons.Check className="w-5 h-5"/></button>
                        ) : (
                            <button onClick={() => setEditingBull(bull)} className="p-1.5 text-blue-600 hover:text-blue-800"><Icons.Edit className="w-5 h-5"/></button>
                        )}
                        <button onClick={() => handleDeleteRequest(bull.id, bull.name)} className="p-1.5 text-red-600 hover:text-red-800"><Icons.Trash className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-end pt-4">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Tancar
            </button>
        </div>
      </div>
    </Modal>
    <ConfirmationModal 
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminació"
        message={`Segur que vols eliminar el toro "${deleteConfirmation?.name}"?`}
    />
    </>
  );
};

export default ManageBullsModal;
