
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useData } from '../../hooks/useData';
import SearchableSelect from '../shared/SearchableSelect';
import { Cow, AnimalStatus } from '../../types';

interface CowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cow?: Cow | null;
}

const CowFormModal: React.FC<CowFormModalProps> = ({ isOpen, onClose, cow }) => {
  const { addCow, updateCow, locations } = useData();
  const [dib, setDib] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnimalStatus>(AnimalStatus.Alive);
  const [deathDate, setDeathDate] = useState('');
  const [saleInfo, setSaleInfo] = useState({ date: '', destination: ''});

  const isEditMode = cow && cow.id;

  useEffect(() => {
    if (isOpen) {
        if (isEditMode) {
          setDib(cow.dib);
          setBirthDate(cow.birthDate);
          // FIX: Convert cow.locationId to a string to match the state type.
          setLocationId(String(cow.locationId));
          setStatus(cow.status);
          setDeathDate(cow.deathDate || '');
          setSaleInfo(cow.saleInfo || { date: '', destination: ''});
        } else {
          setDib('');
          setBirthDate('');
          setLocationId(null);
          setStatus(AnimalStatus.Alive);
          setDeathDate('');
          setSaleInfo({ date: '', destination: ''});
        }
    }
  }, [cow, isOpen]);

  // FIX: Converted location IDs to strings to match the 'Option' type required by SearchableSelect.
  const locationOptions = locations.map(l => ({ value: String(l.id), label: l.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dib || !birthDate || !locationId) {
      alert('Si us plau, omple tots els camps.');
      return;
    }
    if (dib.length !== 4 || !/^\d{4}$/.test(dib)) {
      alert('El DIB ha de ser de 4 dígits.');
      return;
    }

    const cowData = {
        dib, birthDate, locationId, status,
        deathDate: status === AnimalStatus.Dead ? deathDate : undefined,
        saleInfo: status === AnimalStatus.Sold ? saleInfo : undefined,
    };

    if (isEditMode) {
        updateCow({ id: cow.id, ...cowData });
    } else {
        addCow(cowData);
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Vaca" : "Afegir Nova Vaca"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dib" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            DIB (4 dígits)
          </label>
          <input
            type="text" id="dib" value={dib} onChange={(e) => setDib(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            maxLength={4} required
          />
        </div>
        <div>
          <label htmlFor="birthDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Data de Naixement
          </label>
          <input
            type="date" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Ubicació
          </label>
          <SearchableSelect options={locationOptions} value={locationId} onChange={setLocationId} placeholder="Selecciona una ubicació"/>
        </div>
        
        {isEditMode && (
          <div>
            <label htmlFor="status-cow" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estat</label>
            <select id="status-cow" value={status} onChange={e => setStatus(e.target.value as AnimalStatus)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value={AnimalStatus.Alive}>Viva</option>
              <option value={AnimalStatus.Dead}>Morta</option>
              <option value={AnimalStatus.Sold}>Venuda</option>
            </select>
          </div>
        )}

        {isEditMode && status === AnimalStatus.Dead && (
           <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data de Mort</label>
              <input type="date" value={deathDate} onChange={e => setDeathDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required/>
           </div>
        )}

        {isEditMode && status === AnimalStatus.Sold && (
           <div className="space-y-2 p-2 border rounded-md dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Informació de Venda</label>
              <input type="date" value={saleInfo.date} onChange={e => setSaleInfo(s => ({...s, date: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required/>
              <input type="text" placeholder="Destinació" value={saleInfo.destination} onChange={e => setSaleInfo(s => ({...s, destination: e.target.value}))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required/>
           </div>
        )}

        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            {isEditMode ? "Guardar Canvis" : "Afegir Vaca"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CowFormModal;
