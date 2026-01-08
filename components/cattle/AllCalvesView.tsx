
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
// FIX: Import UID to resolve type errors.
import { Calf, Sex, Treatment, CalfStatus, UID } from '../../types';
import { Icons } from '../shared/Icons';
import CalfFormModal from './CalfFormModal';
import { exportToExcel } from '../../utils/export';
import ConfirmationModal from '../shared/ConfirmationModal';

interface AllCalvesViewProps {
    searchTerm: string;
}

const AllCalvesView: React.FC<AllCalvesViewProps> = ({ searchTerm }) => {
    const { calves, cows, treatments, deleteCalf } = useData();
    const [editingCalf, setEditingCalf] = useState<Calf | null>(null);
    const [sortBy, setSortBy] = useState<'birthDate' | 'dib'>('birthDate');
    const [ageFilter, setAgeFilter] = useState<string>('all');
    // FIX: Changed id type from string to UID to match the data type.
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: UID; name: string } | null>(null);

    // FIX: Changed calfId type from string to UID.
    const getLastTreatment = (calfId: UID): Treatment | undefined => {
        return treatments
            .filter(t => t.animalId === calfId)
            .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())[0];
    };

    const activeCalves = useMemo(() => calves.filter(c => c.status !== CalfStatus.Deleted), [calves]);

    const filteredAndSortedCalves = useMemo(() => {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

        return activeCalves
            .filter(calf => calf.dib.includes(searchTerm))
            .filter(calf => {
                if (ageFilter === 'all') return true;
                const birthDate = new Date(calf.birthDate);
                if (ageFilter === '<2') return birthDate > twoMonthsAgo;
                if (ageFilter === '<6') return birthDate > sixMonthsAgo;
                if (ageFilter === '>6') return birthDate <= sixMonthsAgo;
                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'dib') return a.dib.localeCompare(b.dib);
                return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
            });
    }, [activeCalves, searchTerm, sortBy, ageFilter]);
    
    const handleExportCalves = () => {
        const dataToExport = filteredAndSortedCalves.map(calf => {
            const mother = cows.find(c => c.id === calf.motherId);
            const lastTreatment = getLastTreatment(calf.id);
            return {
                DIB: calf.dib,
                Sexe: calf.sex === Sex.Male ? 'Mascle' : 'Femella',
                'Data Naixement': calf.birthDate,
                'DIB Mare': mother?.dib || 'N/A',
                Estat: calf.status,
                'Darrer Tractament': lastTreatment ? `${lastTreatment.treatmentType} (${lastTreatment.dateApplied})` : 'Cap'
            };
        });
        exportToExcel(dataToExport, "Llistat_Tots_Vedells");
    };
    
    // FIX: Changed motherId type from string to UID.
    const getMotherDib = (motherId: UID) => cows.find(c => c.id === motherId)?.dib || 'N/A';
    
    const handleDeleteRequest = (calf: Calf) => {
        setDeleteConfirmation({ id: calf.id, name: `el vedell DIB: ${calf.dib}` });
    };

    const confirmDelete = () => {
        if (deleteConfirmation) {
            deleteCalf(deleteConfirmation.id);
            setDeleteConfirmation(null);
        }
    };

    return (
        <>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
             <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="all">Totes les edats</option>
                        <option value="<2">Menors de 2 mesos</option>
                        <option value="<6">Menors de 6 mesos</option>
                        <option value=">6">Majors de 6 mesos</option>
                    </select>
                     <select value={sortBy} onChange={e => setSortBy(e.target.value as 'dib'|'birthDate')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="birthDate">Ordenar per Edat (més jove primer)</option>
                        <option value="dib">Ordenar per DIB</option>
                     </select>
                </div>
                <button onClick={handleExportCalves} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"><Icons.Export className="w-4 h-4 mr-2" />Exportar a Excel</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">DIB</th>
                            <th className="px-4 py-3">Data Naixement</th>
                            <th className="px-4 py-3">DIB Mare</th>
                            <th className="px-4 py-3">Darrer Tractament</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedCalves.map(calf => {
                            const isDead = calf.status === CalfStatus.Dead;
                            let textColor = calf.sex === Sex.Male ? 'text-black dark:text-white' : 'text-green-600';
                            if (isDead) textColor = 'text-red-600';
                            const lastTreatment = getLastTreatment(calf.id);

                            return (
                                <tr key={calf.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isDead ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                    <td className={`px-4 py-3 font-semibold ${textColor}`}>{calf.dib}</td>
                                    <td className="px-4 py-3">{calf.birthDate}</td>
                                    <td className="px-4 py-3">{getMotherDib(calf.motherId)}</td>
                                    <td className="px-4 py-3">{lastTreatment ? `${lastTreatment.treatmentType} (${lastTreatment.dateApplied})` : 'Cap'}</td>
                                    <td className="px-4 py-3 text-right">
                                       <div className="flex items-center justify-end space-x-2">
                                          <button onClick={() => setEditingCalf(calf)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Icons.Edit className="w-5 h-5"/></button>
                                          <button onClick={() => handleDeleteRequest(calf)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Icons.Trash className="w-5 h-5"/></button>
                                       </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        <CalfFormModal isOpen={!!editingCalf} onClose={() => setEditingCalf(null)} calf={editingCalf} />
        <ConfirmationModal 
            isOpen={!!deleteConfirmation}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={confirmDelete}
            title="Confirmar Eliminació"
            message={`Segur que vols eliminar ${deleteConfirmation?.name}? L'element es mourà a la paperera.`}
        />
        </>
    );
};

export default AllCalvesView;
