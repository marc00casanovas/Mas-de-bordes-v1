
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icons } from './Icons';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = 'Selecciona una opció' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() =>
    options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const selectedOption = useMemo(() =>
    options.find(option => option.value === value), [options, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 text-left dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Cerca..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.map(option => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && <li className="px-4 py-2 text-sm text-gray-500">No s'han trobat resultats</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
