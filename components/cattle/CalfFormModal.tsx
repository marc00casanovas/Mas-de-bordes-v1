
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useData } from '../../hooks/useData';
import { Sex, CalfStatus, Calf } from '../../types';
import SearchableSelect from '../shared/SearchableSelect';

interface CalfFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  calf?: Calf | null;
}

const CalfFormModal: React.FC<CalfFormModalProps> = ({ isOpen, onClose, calf }) => {
  const { addCalf, updateCalf, cows, locations } = useData();
  const [dib, setDib] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [motherId, setMotherId] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex>(Sex.Female);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<CalfStatus>(CalfStatus.Alive);
  const [deathDate, setDeathDate] = useState('');
  const [newLocationId, setNewLocationId] = useState<string | null>(null); // For female breeding
  
  const isEditMode = calf && calf.id;

  useEffect(() => {
    if (isOpen) {
        if (isEditMode) {
          setDib(calf.dib);
          setBirthDate(calf.birthDate);
          // FIX: Convert calf.motherId to a string to match the state type.
          setMotherId(String(calf.motherId));
          setSex(calf.sex);
          setNotes(calf.notes || '');
          setStatus(calf.status);
          setDeathDate(calf.deathDate || '');
        } else {
          setDib('');
          setBirthDate(new Date().toISOString().split('T')[0]);
          setMotherId(null);
          setSex(Sex.Female);
          setNotes('');
          setStatus(CalfStatus.Alive);
          setDeathDate('');
        }
        setNewLocationId(null);
    }
  }, [calf, isOpen]);


  // FIX: Converted cow IDs to strings to match the 'Option' type required by SearchableSelect.
  const cowOptions = cows.map(c => ({ value: String(c.id), label: `DIB: ${c.dib}` }));
  // FIX: Converted location IDs to strings to match the 'Option' type required by SearchableSelect.
  const locationOptions = locations.map(l => ({ value: String(l.id), label: l.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dib || !birthDate || !motherId) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    if (dib.length !== 4 || !/^\d{4}$/.test(dib)) {
      alert('El DIB ha de ser de 4 dígits.');
      return;
    }
    
    // FIX: Compare IDs as strings for type safety, as motherId is a string from state.
    const mother = cows.find(c => String(c.id) === motherId);
    if (!mother) {
        alert("No s'ha trobat la vaca mare.");
        return;
    }
    const location = locations.find(l => l.id === mother.locationId);
     if (!location) {
        alert("No s'ha trobat la ubicació de la mare.");
        return;
    }
    const fatherId = location.assignedBullId;

    const calfData: Calf = {
        id: isEditMode ? calf.id : '',
        dib, birthDate, motherId, sex, fatherId, status,
        notes: notes || undefined,
        deathDate: status === CalfStatus.Dead ? deathDate : undefined,
        saleInfo: isEditMode ? calf.saleInfo : undefined,
    };

    if (isEditMode) {
        updateCalf(calfData, newLocationId || undefined);
    } else {
        addCalf(calfData);
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Vedell" : "Afegir Nou Vedell"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mare</label>
          <SearchableSelect options={cowOptions} value={motherId} onChange={setMotherId} placeholder="Selecciona la mare" />
        </div>
        <div>
          <label htmlFor="dib-calf" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">DIB (4 dígits)</label>
          <input
            type="text" id="dib-calf" value={dib} onChange={(e) => setDib(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            maxLength={4} required
          />
        </div>
        <div>
          <label htmlFor="birthDate-calf" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data de Naixement</label>
          <input
            type="date" id="birthDate-calf" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
         <div>
          <label htmlFor="sex" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sexe</label>
          <select id="sex" value={sex} onChange={e => setSex(e.target.value as Sex)}
             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
            <option value={Sex.Female}>Femella</option>
            <option value={Sex.Male}>Mascle</option>
          </select>
        </div>
        {isEditMode && (
          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estat</label>
             <select id="status" value={status} onChange={e => setStatus(e.target.value as CalfStatus)}
               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
              <option value={CalfStatus.Alive}>Viu</option>
              <option value={CalfStatus.Dead}>Mort</option>
              <option value={CalfStatus.Sold}>Venut</option>
              <option value={CalfStatus.Breeding}>Recria</option>
            </select>
          </div>
        )}
        {isEditMode && status === CalfStatus.Dead && (
           <div>
              <label htmlFor="deathDate-calf" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data de Mort</label>
              <input type="date" id="deathDate-calf" value={deathDate} onChange={e => setDeathDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required/>
           </div>
        )}
        {isEditMode && status === CalfStatus.Breeding && sex === Sex.Female && (
            <div>
                 <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ubicació per la Nova Vaca</label>
                 <SearchableSelect options={locationOptions} value={newLocationId} onChange={setNewLocationId} placeholder="Selecciona una ubicació" />
            </div>
        )}
        <div>
            <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comentari (Opcional)</label>
            <textarea
                id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Qualsevol informació addicional..."
            />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            {isEditMode ? "Guardar Canvis" : "Afegir Vedell"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CalfFormModal;
