
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { UID } from '../../types';
import { useData } from '../../hooks/useData';

interface BatchSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  calfIds: UID[];
  onSuccess: () => void;
}

const BatchSaleModal: React.FC<BatchSaleModalProps> = ({ isOpen, onClose, calfIds, onSuccess }) => {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { batchSellCalves } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !date || calfIds.length === 0) {
      alert('Please fill in all fields.');
      return;
    }
    batchSellCalves(calfIds, destination, date);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vendre ${calfIds.length} Vedell(s)`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="destination" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Destinació
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Nom de la Finca"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Data de Venda
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
           <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel·lar
            </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            Confirmar Venda
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BatchSaleModal;
