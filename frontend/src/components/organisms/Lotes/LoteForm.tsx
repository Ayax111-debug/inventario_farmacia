import { useState, useEffect, type FormEvent } from 'react';
import { type Lotes } from '../../../domain/models/Lotes';
import { type Producto } from '../../../domain/models/Producto';
import { SearchSelect } from '../../molecules/SearchSelect';

interface Props {
    onSubmit: (lote: Lotes) => Promise<boolean | void>;
    initialData?: Lotes | null;
    onCancel?: () => void;
    // CORRECCIÓN: La lista es de PRODUCTOS, para poder seleccionar a qué producto pertenece el lote
    listaProductos: Producto[]; 
    
}

export const LoteForm = ({ onSubmit, initialData, onCancel, listaProductos}: Props) => {

    // 1. ESTRATEGIA DE FECHAS:
    // Definimos el estado inicial con fechas en string (YYYY-MM-DD) para que los inputs HTML no fallen.
    // Usamos 'any' temporalmente en el estado del form para facilitar el manejo de strings en lugar de Date objects.
    const initialState = {
        producto: 0,
        producto_nombre:'',
        codigo_lote: '',
        fecha_creacion: new Date().toISOString().split('T')[0], // Hoy
        fecha_vencimiento: '', // Vacío inicialmente
        cantidad: 0,
        defectuoso: false,
        activo: true
    };

    const [form, setForm] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. CARGAR DATOS (Sincronización)
    useEffect(() => {
        if (initialData) {
            // Si viene data del backend (Dates), las convertimos a String para el input
            setForm({
                ...initialData,
                fecha_creacion: new Date(initialData.fecha_creacion).toISOString().split('T')[0],
                fecha_vencimiento: new Date(initialData.fecha_vencimiento).toISOString().split('T')[0],
            });
        } else {
            setForm(initialState);
        }
    }, [initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!form.codigo_lote.trim() || form.producto <= 0 || form.cantidad <= 0 || !form.fecha_vencimiento) {
            alert("Por favor completa los campos obligatorios (Producto, Código, Cantidad, Vencimiento).");
            return;
        }

        setIsSubmitting(true);

        // 3. ADAPTADOR (Payload):
        // Convertimos los strings del form de vuelta a Objetos Date para el Backend
        const loteParaEnviar: Lotes = {
            id: initialData?.id, // Mantenemos el ID si existe
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
        }
    };

    

    return (
        <div className="bg-white p-6 rounded-lg mb-6 ">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Lote' : 'Registrar Nuevo Lote'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* SELECCIONAR PRODUCTO */}
                    <div className="md:col-span-2">
                        <SearchSelect
                            label="Producto"
                            placeholder="Escribe para buscar un producto..."
                            options={listaProductos
                                // 1. Filtramos por seguridad (quitamos si alguno no tiene ID)
                                .filter(prod => prod.id !== undefined)
                                // 2. Mapeamos para cumplir estrictamente con la interfaz Option { id, nombre }
                                .map(prod => ({
                                    id: prod.id!, // El signo '!' fuerza a TS a entender que "aquí sí hay un número"
                                    nombre: prod.nombre
                                }))
                            }// Pasas la lista completa de 100 labs
                            selectedId={form.producto} // El ID seleccionado en tu estado
                            onChange={(newId: number) => {
                                // Actualizamos el estado del formulario con el ID seleccionado
                                setForm({ ...form, producto: newId });
                            }}
                            disabled={!!initialData}
                             // Opcional: si no quieres permitir cambiarlo al editar
                        />
                    </div>

                    {/* CÓDIGO DE LOTE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Lote *</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: L-2024-001"
                            value={form.codigo_lote}
                            onChange={e => setForm({ ...form, codigo_lote: e.target.value })}
                            required
                        />
                    </div>

                    {/* CANTIDAD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Inicial *</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.cantidad || ''}
                            onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                            required
                        />
                    </div>

                    {/* FECHA ELABORACIÓN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Elaboración</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.fecha_creacion}
                            onChange={e => setForm({ ...form, fecha_creacion: e.target.value })}
                            required
                        />
                    </div>

                    {/* FECHA VENCIMIENTO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento *</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.fecha_vencimiento}
                            onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
                            required
                        />
                    </div>

                </div>

                {/* CHECKBOXES DE ESTADO */}
                <div className="flex gap-6 items-center py-2 border-t border-gray-100 mt-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                            checked={form.defectuoso}
                            onChange={e => setForm({ ...form, defectuoso: e.target.checked })}
                        />
                        <span className={form.defectuoso ? "text-red-600 font-medium" : ""}>Marca como Defectuoso</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            checked={form.activo}
                            onChange={e => setForm({ ...form, activo: e.target.checked })}
                        />
                        <span>Lote Activo (Disponible)</span>
                    </label>
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 justify-end mt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={() => { setForm(initialState); onCancel(); }}
                            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded font-medium text-white transition
                            ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
                    >
                        {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>
            </form>
        </div>
    );
};