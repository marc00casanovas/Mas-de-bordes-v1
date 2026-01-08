
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { AnimalStatus, CalfStatus, UID, Cow, Calf, Bull, Location } from '../../types';
import { Icons } from '../shared/Icons';
import ConfirmationModal from '../shared/ConfirmationModal';

type TrashItem = {
    id: UID;
    name: string;
    type: 'Cow' | 'Calf' | 'Bull' | 'Location';
}

const TrashView: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
    const { 
        cows, calves, bulls, locations, 
        batchRestore, batchPermanentlyDelete
    } = useData();

    const [selectedItems, setSelectedItems] = useState<TrashItem[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ items: TrashItem[], action: 'restore' | 'delete' } | null>(null);

    const trashItems = useMemo(() => {
        const items: TrashItem[] = [];
        cows.filter(c => c.status === AnimalStatus.Deleted).forEach(c => items.push({ id: c.id, name: `Vaca DIB: ${c.dib}`, type: 'Cow' }));
        calves.filter(c => c.status === CalfStatus.Deleted).forEach(c => items.push({ id: c.id, name: `Vedell DIB: ${c.dib}`, type: 'Calf' }));
        bulls.filter(b => b.status === AnimalStatus.Deleted).forEach(b => items.push({ id: b.id, name: `Toro: ${b.name}`, type: 'Bull' }));
        locations.filter(l => l.isDeleted).forEach(l => items.push({ id: l.id, name: `Ubicació: ${l.name}`, type: 'Location' }));
        return items;
    }, [cows, calves, bulls, locations]);

    const filteredItems = useMemo(() => 
        trashItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [trashItems, searchTerm]);

    const handleSelectItem = (item: TrashItem) => {
        setSelectedItems(prev => 
            prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([]);
        }
    };
    
    const confirmAction = () => {
        if(!deleteConfirmation) return;
        
        if(deleteConfirmation.action === 'restore') {
            batchRestore(deleteConfirmation.items);
        } else {
            batchPermanentlyDelete(deleteConfirmation.items);
        }
        
        setSelectedItems([]);
        setDeleteConfirmation(null);
    };

    return (
        <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Paperera</h2>
            
            {selectedItems.length > 0 && (
                 <div className="flex justify-between items-center p-2 mb-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <span className="font-medium">{selectedItems.length} element(s) seleccionat(s)</span>
                    <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirmation({ items: selectedItems, action: 'restore'})} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Restaurar</button>
                        <button onClick={() => setDeleteConfirmation({ items: selectedItems, action: 'delete'})} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar Permanentment</button>
                    </div>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 w-12 text-center">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}/>
                            </th>
                            <th className="px-4 py-3">Element</th>
                            <th className="px-4 py-3">Tipus</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-3 text-center">
                                    <input type="checkbox" checked={selectedItems.some(i => i.id === item.id)} onChange={() => handleSelectItem(item)} />
                                </td>
                                <td className="px-4 py-3">{item.name}</td>
                                <td className="px-4 py-3">{item.type}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => setDeleteConfirmation({ items: [item], action: 'restore'})} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Restaurar"><Icons.Check className="w-5 h-5"/></button>
                                        <button onClick={() => setDeleteConfirmation({ items: [item], action: 'delete'})} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Eliminar Permanentment"><Icons.Trash className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredItems.length === 0 && (
                <div className="text-center py-8">
                    <Icons.Trash className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-500">La paperera és buida.</p>
                </div>
            )}
        </div>
        {deleteConfirmation && (
            <ConfirmationModal 
                isOpen={true}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmAction}
                title={`Confirmar ${deleteConfirmation.action === 'restore' ? 'Restauració' : 'Eliminació Permanent'}`}
                message={
                    deleteConfirmation.action === 'restore' 
                    ? `Segur que vols restaurar ${deleteConfirmation.items.length} element(s)?`
                    : `Segur que vols eliminar permanentment ${deleteConfirmation.items.length} element(s)? Aquesta acció no es pot desfer.`
                }
                confirmText={deleteConfirmation.action === 'restore' ? 'Sí, restaurar' : 'Sí, eliminar permanentment'}
                confirmButtonVariant={deleteConfirmation.action === 'restore' ? 'primary' : 'danger'}
            />
        )}
        </>
    );
};

export default TrashView;
