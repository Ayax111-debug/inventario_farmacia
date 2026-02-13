import { useState, useEffect, useRef } from 'react';

// Asegúrate de que tus interfaces coincidan
interface Option {
    id: number;
    nombre: string;
}

interface Props {
    label: string;
    placeholder?: string;
    options: Option[];
    selectedId: number | null | undefined;
    onChange: (newId: number) => void;
    disabled?: boolean;
    
    // --- NUEVO: Hacemos esta prop OPCIONAL ---
    // Si se pasa, activamos el modo "Server-Side Search"
    onInputChange?: (text: string) => void;
}

export const SearchSelect = ({ 
    label, 
    placeholder, 
    options, 
    selectedId, 
    onChange, 
    disabled = false,
    onInputChange // Recibimos la prop nueva
}: Props) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Efecto para mostrar el nombre del item seleccionado cuando carga la data inicial
    useEffect(() => {
        if (selectedId) {
            const selected = options.find(opt => opt.id === selectedId);
            if (selected) {
                setQuery(selected.nombre);
            }
        }
    }, [selectedId, options]);

    // Lógica inteligente de filtrado
    const filteredOptions = onInputChange 
        ? options // MODO SERVIDOR: Mostramos lo que el padre nos mande tal cual
        : query === '' // MODO CLIENTE (Antiguo): Filtramos localmente
            ? options
            : options.filter((opt) =>
                opt.nombre.toLowerCase().includes(query.toLowerCase())
              );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        setIsOpen(true);

        // Si el padre nos dio una función para buscar fuera, la ejecutamos
        if (onInputChange) {
            onInputChange(text);
        }
    };

    const handleSelect = (option: Option) => {
        setQuery(option.nombre);
        onChange(option.id);
        setIsOpen(false);
    };

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Si el usuario escribió algo que no es una opción válida, podrías resetear aquí
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onClick={() => !disabled && setIsOpen(true)}
                    disabled={disabled}
                />
                
                {/* Icono de flecha */}
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {isOpen && !disabled && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.id}
                                onClick={() => handleSelect(opt)}
                                className="p-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-700"
                            >
                                {opt.nombre}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500 text-sm">No hay resultados</li>
                    )}
                </ul>
            )}
        </div>
    );
};