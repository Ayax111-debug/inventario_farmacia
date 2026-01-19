import { useState, useEffect, useRef } from 'react';

// Exportamos la interfaz para poder usarla en el padre si es necesario
export interface Option {
    id: number;
    nombre: string;
}

interface Props {
    label: string;
    options: Option[];
    selectedId: number;
    onChange: (id: number) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
   
}

export const SearchSelect = ({ 
    label, 
    options, 
    selectedId, 
    onChange, 
    placeholder = "Buscar...", 
    error,
    disabled = false,
    
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 1. Encontrar la opción seleccionada actualmente
    const selectedOption = options.find(opt => opt.id === selectedId);

    // 2. Sincronizar el input cuando cambia la selección externa (props)
    useEffect(() => {
        if (selectedOption) {
            setSearchTerm(selectedOption.nombre);
        } else {
            setSearchTerm('');
        }
    }, [selectedId, selectedOption]);

    // 3. Filtrado local (Client-Side)
    // Nota: Si son 50.000 productos, esto podría causar lentitud. 
    // Para listas gigantes se recomienda filtrado en servidor.
    const filteredOptions = options.filter(opt => 
        opt.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. Manejo de clicks fuera del componente
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // UX: Si el usuario escribió algo pero no seleccionó nada, revertimos al valor real
                if (selectedOption) {
                    setSearchTerm(selectedOption.nombre);
                } else {
                    setSearchTerm('');
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]); // Dependencia importante para saber a qué valor revertir

    const handleSelect = (option: Option) => {
        onChange(option.id);
        setSearchTerm(option.nombre);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            
            <div className="relative">
                <input
                    type="text"
                    disabled={disabled}
                 
                    value={searchTerm}
                    // Eventos
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        // Si borra todo el texto, enviamos ID 0 (limpiar selección)
                        if (e.target.value === '') onChange(0);
                    }}
                    onFocus={() => !disabled  && setIsOpen(true)}
                    // Estilos dinámicos
                    className={`
                        w-full border p-2 pr-10 rounded outline-none transition-colors
                        ${error 
                            ? 'border-red-500 focus:ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        }
                        ${(disabled ) 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'bg-white text-gray-900'
                        }
                    `}
                />
                
                {/* Icono de estado (Spinner o Flecha) */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
        
                </div>
            </div>

            {/* Dropdown de Resultados */}
            {isOpen && !disabled && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className={`
                                    px-4 py-2 cursor-pointer transition-colors text-sm
                                    ${option.id === selectedId 
                                        ? 'bg-blue-100 text-blue-700 font-medium' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {option.nombre}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-gray-500 text-sm text-center italic">
                            No se encontraron resultados
                        </li>
                    )}
                </ul>
            )}
            
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};