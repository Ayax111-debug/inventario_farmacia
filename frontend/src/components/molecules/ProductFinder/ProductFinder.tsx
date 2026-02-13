// src/components/molecules/ProductFinder.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useProductos } from '../../../hooks/inventario/useProducto'; // Reutilizamos tu hook existente
import { type Producto } from '../../../domain/models/Producto'
import { useDebounce } from '../../../hooks/Debounce/useDebounce';

interface Props {
    onProductSelected: (prod: Producto, cantidad: number) => void;
}

export const ProductFinder = ({ onProductSelected }: Props) => {
    const [query, setQuery] = useState('');
    const [qty, setQty] = useState(1);
    // Usamos tu hook existente para buscar.
    // NOTA: Idealmente, el hook useProductos debería aceptar un parametro para buscar un solo item exacto.
    // Por ahora, asumimos que filtra por el query string.
    const debouncedQuery = useDebounce(query, 500)


    const searchFilters = useMemo(() =>{
        if (!debouncedQuery || debouncedQuery.length < 2) return {search: ''};
        return{search:debouncedQuery};
    },[debouncedQuery])
    const { productos, loading } = useProductos(searchFilters);

    const inputRef = useRef<HTMLInputElement>(null);
    const qtyRef = useRef<HTMLInputElement>(null);

    // Auto-focus al montar: Siempre listo para escanear
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // El primer resultado de la búsqueda es nuestro "candidato"
    const stagedProduct = query && productos.length > 0 ? productos[0] : null;

    const handleKeyDown = (e: React.KeyboardEvent, target: 'search' | 'qty') => {
        if (e.key === 'Enter') {
            if (target === 'search' && stagedProduct) {
                 // Si dio enter en búsqueda y hay producto, pasa al campo cantidad
                qtyRef.current?.focus();
                qtyRef.current?.select();
            } else if (target === 'qty' && stagedProduct) {
                // Si dio enter en cantidad, confirma y agrega al carrito
                onProductSelected(stagedProduct, qty);
                // Reset para el siguiente producto
                setQuery('');
                setQty(1);
                inputRef.current?.focus();
            }
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
            <div className="flex gap-4 items-end">
                 {/* Input "Escáner" */}
                <div className="flex-grow">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Escanear Código de Barras / Buscar (F1)
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, 'search')}
                        className="w-full text-xl p-3 border-2 border-blue-500 rounded focus:outline-none"
                        placeholder="...escanear ahora"
                        autoComplete="off"
                    />
                </div>
                
                 {/* Input Cantidad */}
                <div className="w-32">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Cantidad
                    </label>
                     <input
                        ref={qtyRef}
                        type="number"
                        min={1}
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        onKeyDown={e => handleKeyDown(e, 'qty')}
                        className="w-full text-xl p-3 border border-gray-300 rounded text-center"
                         disabled={!stagedProduct}
                    />
                </div>
            </div>

            {/* Vista Previa "Staged Product" */}
            <div className={`mt-4 p-3 rounded bg-gray-50 border ${stagedProduct ? 'border-green-200' : 'border-gray-100'}`}>
                {loading && <p className="text-gray-500">Buscando...</p>}
                
                {!loading && !stagedProduct && query && (
                     <p className="text-red-500 font-bold">Producto no encontrado.</p>
                )}

                {stagedProduct && (
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{stagedProduct.nombre}</h3>
                            <p className="text-sm text-gray-600">{stagedProduct.codigo_serie} | Stock: {stagedProduct.stock_total}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-gray-500 uppercase">Precio Unitario</p>
                             <p className="text-2xl font-bold text-blue-600">${stagedProduct.precio_venta.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};