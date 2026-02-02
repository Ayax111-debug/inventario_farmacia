import { useState, useEffect, type FormEvent } from 'react';
import { type Lotes } from '../../../domain/models/Lotes';
// Nota: Ya no importamos Producto aquí porque no usamos la lista completa
import { globalSearchService } from '../../../services/globalSearch.service';
import { SearchSelect } from '../../molecules/SearchSelect';

interface Props {
    onSubmit: (lote: Lotes) => Promise<boolean | void>;
    initialData?: Lotes | null;
    onCancel?: () => void;
    // Eliminé onInputChange de aquí. El padre de LoteForm no necesita saber que estás buscando.
}

export const LoteForm = ({ onSubmit, initialData, onCancel }: Props) => {

    const initialState = {
        producto: 0,
        producto_nombre: '',
        codigo_lote: '',
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        cantidad: 0,
        defectuoso: false,
        activo: true
    };

    const [form, setForm] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- LÓGICA DE BÚSQUEDA ASÍNCRONA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [productOptions, setProductOptions] = useState<{ id: number, nombre: string }[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // 1. Cargar datos iniciales al editar
    useEffect(() => {
        if (initialData) {
            // Inyectamos el producto actual para que el select no salga vacío
            setProductOptions([{
                id: initialData.producto,
                nombre: initialData.producto_nombre
            }]);

            setForm({
                ...initialData,
                fecha_creacion: new Date(initialData.fecha_creacion).toISOString().split('T')[0],
                fecha_vencimiento: new Date(initialData.fecha_vencimiento).toISOString().split('T')[0],
            });
        }
    }, [initialData]);

    // 2. Debounce para buscar productos en el servidor
    useEffect(() => {
        // Si hay menos de 4 letras, no buscamos (ahorro de recursos)
        if (searchTerm.length < 4) {
            // Si el usuario borró todo y no estamos editando, limpiamos la lista
            if (searchTerm.length === 0 && !initialData) {
                setProductOptions([]);
            }
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoadingProducts(true);
            try {
                // Llamada a tu servicio existente
                const data = await globalSearchService.search(searchTerm);

                // Mapeo simple
                const options = data.productos.map(prod => ({
                    id: prod.id,
                    nombre: prod.titulo
                }));

                setProductOptions(options);
            } catch (error) {
                console.error("Error buscando productos", error);
            } finally {
                setIsLoadingProducts(false);
            }
        }, 300); // Espera 300ms después de que el usuario deje de escribir

        return () => clearTimeout(timeoutId);
    }, [searchTerm, initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!form.codigo_lote.trim() || form.producto <= 0 || form.cantidad <= 0 || !form.fecha_vencimiento) {
            alert("Completa los campos obligatorios");
            return;
        }

        setIsSubmitting(true);
        // Construimos el objeto Lote
        const loteParaEnviar: Lotes = {
            id: initialData?.id,
            producto: form.producto,
            producto_nombre: form.producto_nombre,
            codigo_lote: form.codigo_lote,
            cantidad: form.cantidad,
            defectuoso: form.defectuoso,
            activo: form.activo,
            fecha_creacion: form.fecha_creacion,
            fecha_vencimiento: form.fecha_vencimiento,
        };

        const success = await onSubmit(loteParaEnviar as unknown as Lotes);
        setIsSubmitting(false);

        if (success && !initialData) {
            setForm(initialState);
            setProductOptions([]); // Limpiamos el select
            setSearchTerm('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Lote' : 'Registrar Nuevo Lote'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* SELECT OPTIMIZADO */}
                    <div className="md:col-span-2 relative">
                        <SearchSelect
                            label="Producto"
                            placeholder={isLoadingProducts ? "Buscando..." : "Escribe 4 letras para buscar..."}

                            // Lista pequeña y dinámica traída del backend
                            options={productOptions}

                            selectedId={form.producto}

                            onChange={(newId: number) => {
                                const selected = productOptions.find(p => p.id === newId);
                                setForm({
                                    ...form,
                                    producto: newId,
                                    producto_nombre: selected ? selected.nombre : form.producto_nombre
                                });
                            }}

                            // Aquí está la MAGIA: pasamos la función que actualiza searchTerm
                            // Como SearchSelect ahora acepta esta prop, TypeScript no se quejará
                            onInputChange={(text) => setSearchTerm(text)}

                            disabled={!!initialData}
                        />

                        {/* Feedback visual */}
                        {isLoadingProducts && (
                            <div className="absolute right-10 top-[42px] pointer-events-none">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        {searchTerm.length > 0 && searchTerm.length < 4 && !initialData && (
                            <span className="text-xs text-orange-500 ml-1">
                                Sigue escribiendo...
                            </span>
                        )}
                    </div>

                    {/* RESTO DE INPUTS (Sin cambios) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Lote *</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.codigo_lote}
                            onChange={e => setForm({ ...form, codigo_lote: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.cantidad || ''}
                            onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                            required
                        />
                    </div>

                    {/* Fechas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Elaboración</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.fecha_creacion}
                            onChange={e => setForm({ ...form, fecha_creacion: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.fecha_vencimiento}
                            onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* BOTONES (Sin cambios mayores) */}
                <div className="flex gap-3 justify-end mt-6">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded text-gray-700">
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>
            </form>
        </div>
    );
};