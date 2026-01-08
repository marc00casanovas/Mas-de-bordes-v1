
import React, { useState, useMemo } from 'react';
import { Calf, Sex, UID, CalfStatus } from '../../types';
import { Icons } from '../shared/Icons';
import BatchSaleModal from './BatchSaleModal';
import { useData } from '../../hooks/useData';
import CalfFormModal from './CalfFormModal';
import ConfirmationModal from '../shared/ConfirmationModal';

interface CalfListProps {
  calves: Calf[];
}

const CalfListItem: React.FC<{ 
    calf: Calf; 
    isSelected: boolean; 
    onSelect: (id: UID) => void; 
    onEdit: (calf: Calf) => void;
    onDeleteRequest: (id: UID, name: string) => void;
}> = ({ calf, isSelected, onSelect, onEdit, onDeleteRequest }) => {
  const { treatments } = useData();
  const isMale = calf.sex === Sex.Male;
  const isDead = calf.status === CalfStatus.Dead;
  
  let textColor = isMale ? 'text-black dark:text-white' : 'text-green-600';
  if (isDead) textColor = 'text-red-600';

  const iconText = isMale ? 'M' : 'F';

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const hasPendingTreatment = useMemo(() => 
    treatments.some(t => t.animalId === calf.id && t.repeatRequired && t.repeatDate && t.repeatDate <= today),
  [treatments, calf.id, today]);

  return (
    <tr className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${isDead ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
      <td className="px-4 py-3 w-12 text-center">
        <input 
          type="checkbox"
          className="form-checkbox h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          checked={isSelected}
          onChange={() => onSelect(calf.id)}
          disabled={isDead}
        />
      </td>
      <td className={`px-4 py-3 font-semibold ${textColor}`}>
        <div className="flex items-center space-x-2">
            <span>{iconText}</span>
            <span>{calf.dib}</span>
            {hasPendingTreatment && !isDead && <span title="Tractament pendent"><Icons.Warning className="w-4 h-4 text-red-500" /></span>}
        </div>
      </td>
      <td className="px-4 py-3">{calf.birthDate}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button onClick={() => onEdit(calf)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Icons.Edit className="w-5 h-5"/></button>
          <button onClick={() => onDeleteRequest(calf.id, `el vedell DIB: ${calf.dib}`)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Icons.Trash className="w-5 h-5"/></button>
        </div>
      </td>
    </tr>
  );
};

const CalfList: React.FC<CalfListProps> = ({ calves }) => {
  const { deleteCalf } = useData();
  const [selectedCalfIds, setSelectedCalfIds] = useState<UID[]>([]);
  const [isSaleModalOpen, setSaleModalOpen] = useState(false);
  const [editingCalf, setEditingCalf] = useState<Calf | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: UID; name: string } | null>(null);

  const handleSelectCalf = (id: UID) => {
    setSelectedCalfIds(prev =>
      prev.includes(id) ? prev.filter(calfId => calfId !== id) : [...prev, id]
    );
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCalfIds(calves.filter(c => c.status !== CalfStatus.Dead).map(c => c.id));
    } else {
      setSelectedCalfIds([]);
    }
  };

  const handleDeleteRequest = (id: UID, name: string) => {
    setDeleteConfirmation({ id, name });
  };
  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteCalf(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
      {selectedCalfIds.length > 0 && (
        <div className="flex justify-between items-center p-2 mb-2 bg-green-100 dark:bg-green-900/50 rounded-md">
          <span className="font-medium">{selectedCalfIds.length} vedell(s) seleccionat(s)</span>
          <button 
            onClick={() => setSaleModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Venda en Lot
          </button>
        </div>
      )}
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 w-12 text-center">
              <input 
                type="checkbox"
                className="form-checkbox h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                onChange={handleSelectAll}
                checked={selectedCalfIds.length > 0 && selectedCalfIds.length === calves.filter(c => c.status !== CalfStatus.Dead).length}
              />
            </th>
            <th className="px-4 py-2">DIB</th>
            <th className="px-4 py-2">Data de Naixement</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {calves.map(calf => (
            <CalfListItem 
              key={calf.id} 
              calf={calf}
              isSelected={selectedCalfIds.includes(calf.id)}
              onSelect={handleSelectCalf}
              onEdit={setEditingCalf}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </tbody>
      </table>
      <BatchSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        calfIds={selectedCalfIds}
        onSuccess={() => setSelectedCalfIds([])}
      />
      <CalfFormModal
        isOpen={!!editingCalf}
        onClose={() => setEditingCalf(null)}
        calf={editingCalf}
      />
       <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminació"
        message={`Segur que vols eliminar ${deleteConfirmation?.name}? Aquesta acció no es pot desfer.`}
      />
    </div>
  );
};

export default CalfList;
