import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Asumo React Router
import { globalSearchService, type GlobalSearchResponse } from '../../../services/globalSearch.service';

export const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GlobalSearchResponse | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Lógica de Debounce (Espera 300ms después de escribir)
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 3) {
                setLoading(true);
                try {
                    const data = await globalSearchService.search(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Error en búsqueda global", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Cerrar al hacer clic fuera (Click Outside)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleNavigate = (type: 'producto' | 'lote' | 'laboratorio', id: number) => {
    setIsOpen(false);
    setQuery('');
    
    // Mapeo de rutas (Ajusta esto según tus rutas reales en React Router)
    const routes = {
        producto: '/productos',
        lote: '/lotes',
        laboratorio: '/laboratorios'
    };

    const basePath = routes[type];
    navigate(`${basePath}?editar=${id}`);
};

    return (
        <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto">
           
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>

                <input
                    type="text"
                    className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="Buscar producto, lote, lab..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 3 && setIsOpen(true)}
                />

                {loading && (
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 animate-pulse">
                        ...
                    </span>
                )}
            </div>

            {/* --- MOLECULE: Lista de Resultados --- */}
            {isOpen && results && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">

                    {/* Sección Productos */}
                    {results.productos.length > 0 && (
                        <div className="py-2">
                            <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Productos</h3>
                            {results.productos.map(item => (
                                <div
                                    key={`p-${item.id}`}
                                    onClick={() => handleNavigate('producto',item.id)} // Ajusta tu ruta
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{item.titulo}</p>
                                        <p className="text-xs text-gray-500">{item.subtitulo}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded group-hover:bg-white">
                                        {item.extra}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sección Lotes */}
                    {results.lotes.length > 0 && (
                        <div className="py-2 border-t border-gray-100">
                            <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Lotes</h3>
                            {results.lotes.map(item => (
                                <div
                                    key={`l-${item.id}`}
                                    // Probablemente quieras ir al producto y filtrar el lote, o al detalle del lote
                                    onClick={() => handleNavigate('lote',item.id)}
                                    className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                                >
                                    <p className="text-sm font-medium text-gray-800">{item.titulo}</p>
                                    <p className="text-xs text-gray-500">Producto: {item.extra}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Feedback vacío */}
                    {results.productos.length === 0 && results.lotes.length === 0 && results.laboratorios.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};