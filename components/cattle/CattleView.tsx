
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
// FIX: Add CalfStatus to imports to resolve reference error.
import { Cow, Calf, Sex, Treatment, UID, Location, AnimalStatus, CalfStatus } from '../../types';
import CalfList from './CalfList';
import { Icons } from '../shared/Icons';
import CowFormModal from './CowFormModal';
import CalfFormModal from './CalfFormModal';
import AllCalvesView from './AllCalvesView';
import BatchChangeLocationModal from './BatchChangeLocationModal';
import { exportToExcel } from '../../utils/export';
import ConfirmationModal from '../shared/ConfirmationModal';

interface CattleViewProps {
  searchTerm: string;
}

const CowCard: React.FC<{ 
    cow: Cow; 
    allCalves: Calf[];
    allTreatments: Treatment[];
    onEdit: (cow: Cow) => void;
    onDeleteRequest: (id: UID, name: string) => void;
    isSelected: boolean;
    onSelect: (id: UID) => void;
}> = ({ cow, allCalves, allTreatments, onEdit, onDeleteRequest, isSelected, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { locations, bulls } = useData();

  const cowLocation = locations.find(l => l.id === cow.locationId);
  const locationBull = bulls.find(b => b.id === cowLocation?.assignedBullId);
  const calvesOfCow = useMemo(() => allCalves.filter(c => c.motherId === cow.id), [allCalves, cow.id]);

  const maleCalves = calvesOfCow.filter(c => c.sex === Sex.Male).length;
  const femaleCalves = calvesOfCow.filter(c => c.sex === Sex.Female).length;
  
  const today = new Date().toISOString().split('T')[0];
  const hasPendingTreatment = allTreatments.some(t => t.animalId === cow.id && t.repeatRequired && t.repeatDate && t.repeatDate <= today);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-all duration-300 border ${isSelected ? 'border-green-500' : 'border-transparent'}`}>
       <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4">
           <input 
             type="checkbox"
             className="form-checkbox h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
             checked={isSelected}
             onChange={() => onSelect(cow.id)}
           />
          <Icons.Cow className="w-8 h-8 text-green-600" />
          <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              DIB: {cow.dib}
              {hasPendingTreatment && <span title="Tractament pendent"><Icons.Warning className="w-5 h-5 text-red-500" /></span>}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ubicació: {cowLocation?.name || 'N/A'} (Toro: {locationBull?.name || 'N/A'})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <div className="flex items-center space-x-1">
              <span className="font-bold text-black dark:text-gray-300">{maleCalves}</span>
              <span className="text-sm">M</span>
           </div>
            <div className="flex items-center space-x-1">
                <span className="font-bold text-green-600">{femaleCalves}</span>
                <span className="text-sm">F</span>
            </div>
          <Icons.ChevronDown className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} onClick={() => setIsExpanded(!isExpanded)} />
           <button onClick={() => onEdit(cow)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Icons.Edit className="w-5 h-5"/></button>
           <button onClick={() => onDeleteRequest(cow.id, `la vaca amb DIB ${cow.dib}`)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Icons.Trash className="w-5 h-5"/></button>
        </div>
      </div>
      {isExpanded && (
         <div className="p-4">
             {calvesOfCow.length > 0 ? (
                <CalfList calves={calvesOfCow} />
             ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Aquesta vaca no té vedells registrats.</p>
             )}
         </div>
      )}
    </div>
  );
};

const CattleView: React.FC<CattleViewProps> = ({ searchTerm }) => {
  const { cows, calves, treatments, locations, deleteCow } = useData();
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [isCalfModalOpen, setCalfModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'byCow' | 'allCalves'>('byCow');

  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dib' | 'birthDate'>('dib');
  
  const [selectedCowIds, setSelectedCowIds] = useState<UID[]>([]);
  const [isBatchLocationModalOpen, setBatchLocationModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: UID; name: string } | null>(null);

  const activeCows = useMemo(() => cows.filter(cow => cow.status === AnimalStatus.Alive), [cows]);
  const activeCalves = useMemo(() => calves.filter(calf => calf.status !== CalfStatus.Sold && calf.status !== CalfStatus.Deleted), [calves]);

  const filteredAndSortedCows = useMemo(() => {
    return activeCows
      .filter(cow => locationFilter === 'all' || cow.locationId === locationFilter)
      .filter(cow => cow.dib.includes(searchTerm))
      .sort((a, b) => {
        if (sortBy === 'dib') return a.dib.localeCompare(b.dib);
        return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
      });
  }, [activeCows, locationFilter, sortBy, searchTerm]);
  
  const handleExportCows = () => {
      const dataToExport = filteredAndSortedCows.map(cow => {
          const location = locations.find(l => l.id === cow.locationId);
          return {
              DIB: cow.dib,
              'Data Naixement': cow.birthDate,
              Ubicació: location?.name || 'N/A',
              'Vedells Vius': activeCalves.filter(c => c.motherId === cow.id && c.status === 'ALIVE').length
          };
      });
      exportToExcel(dataToExport, "Llistat_Vaques");
  };

  const handleSelectCow = (id: UID) => {
    setSelectedCowIds(prev => prev.includes(id) ? prev.filter(cowId => cowId !== id) : [...prev, id]);
  };

  const handleDeleteRequest = (id: UID, name: string) => setDeleteConfirmation({ id, name });
  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteCow(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center gap-4 flex-wrap">
         <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button onClick={() => setViewMode('byCow')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === 'byCow' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>Vista per Vaca</button>
            <button onClick={() => setViewMode('allCalves')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === 'allCalves' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>Tots els Vedells</button>
         </div>
         <div className="flex justify-end gap-4 flex-wrap">
            <button onClick={() => setCalfModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Icons.Plus className="w-5 h-5 mr-2" />Afegir Vedell</button>
            <button onClick={() => setEditingCow({} as Cow)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Icons.Plus className="w-5 h-5 mr-2" />Afegir Vaca</button>
         </div>
       </div>

       {viewMode === 'byCow' && (
         <>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="all">Totes les Ubicacions</option>
                {locations.filter(l => !l.isDeleted).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'dib'|'birthDate')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="dib">Ordenar per DIB</option>
                <option value="birthDate">Ordenar per Edat</option>
              </select>
              <button onClick={handleExportCows} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"><Icons.Export className="w-4 h-4 mr-2" />Exportar a Excel</button>
            </div>
            {selectedCowIds.length > 0 && (
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{selectedCowIds.length} vaca(s) seleccionada(s)</span>
                    <button onClick={() => setBatchLocationModalOpen(true)} className="px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Canviar Ubicació...</button>
                </div>
            )}
          </div>
          {filteredAndSortedCows.map(cow => (
            <CowCard key={cow.id} cow={cow} allCalves={activeCalves} allTreatments={treatments} onEdit={setEditingCow} onDeleteRequest={handleDeleteRequest} isSelected={selectedCowIds.includes(cow.id)} onSelect={handleSelectCow}/>
          ))}
         </>
       )}
       
       {viewMode === 'allCalves' && <AllCalvesView searchTerm={searchTerm} />}

      <CowFormModal isOpen={!!editingCow} onClose={() => setEditingCow(null)} cow={editingCow} />
      <CalfFormModal isOpen={isCalfModalOpen} onClose={() => setCalfModalOpen(false)} />
      <BatchChangeLocationModal isOpen={isBatchLocationModalOpen} onClose={() => setBatchLocationModalOpen(false)} cowIds={selectedCowIds} onSuccess={() => setSelectedCowIds([])}/>
      <ConfirmationModal 
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminació"
        message={`Segur que vols eliminar ${deleteConfirmation?.name}? L'element es mourà a la paperera.`}
      />
    </div>
  );
};

export default CattleView;
