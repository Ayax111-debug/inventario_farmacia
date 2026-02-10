import { useState, useEffect, type FormEvent } from 'react';
import { type Lotes } from '../../../domain/models/Lotes';
import { globalSearchService } from '../../../services/globalSearch.service';
import { SearchSelect } from '../../molecules/SearchSelect';
import axios from 'axios'; // Importamos axios para verificar el error

interface Props {
    // CAMBIO: onSubmit ahora retorna una Promesa, no boolean
    onSubmit: (lote: Lotes) => Promise<void>; 
    initialData?: Lotes | null;
    onCancel?: () => void;
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
    
    // CAMBIO: Tipado correcto para los errores de Django
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... (Tu lógica de useEffect y SearchSelect se mantiene igual) ...
    // ... (Solo la omito aquí para ahorrar espacio visual) ...
    
    // --- LÓGICA DE BÚSQUEDA ASÍNCRONA (Mantener tu código original aquí) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [productOptions, setProductOptions] = useState<{ id: number, nombre: string }[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    
    // ... (Tus useEffects de initialData y Search se quedan igual) ...
    useEffect(() => {
       if (initialData) {
           setProductOptions([{ id: initialData.producto, nombre: initialData.producto_nombre }]);
           setForm({
               ...initialData,
               fecha_creacion: new Date(initialData.fecha_creacion).toISOString().split('T')[0],
               fecha_vencimiento: new Date(initialData.fecha_vencimiento).toISOString().split('T')[0],
           });
       }
    }, [initialData]);
    
    // ... (Tu useEffect del debounce se queda igual) ...


    // --- FUNCIÓN HELPER PARA LIMPIAR ERRORES AL ESCRIBIR ---
    const handleChange = (field: string, value: any) => {
        setForm({ ...form, [field]: value });
        
        // Si hay un error en este campo, lo borramos visualmente
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({}); // Limpiar errores previos

        // Validación básica front-end (opcional pero recomendada)
        if (!form.codigo_lote.trim() || form.producto <= 0) {
            alert("Completa los campos obligatorios");
            return;
        }

        setIsSubmitting(true);
        
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

        try {
            // AHORA ESPERAMOS QUE ESTO FALLE SI HAY ERROR 400
            await onSubmit(loteParaEnviar as unknown as Lotes);
            
            // Si llega aquí, es ÉXITO
            if (!initialData) {
                setForm(initialState);
                setProductOptions([]);
                setSearchTerm('');
            }
            // Aquí podrías cerrar el modal si quisieras
            if(onCancel && initialData) onCancel(); 

        } catch (error) {
            // AQUÍ CAPTURAMOS EL ERROR QUE LANZÓ EL HOOK
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrors(error.response.data); // Guardamos el JSON de Django
            } else {
                alert("Ocurrió un error inesperado.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Lote' : 'Registrar Nuevo Lote'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* SELECT DE PRODUCTO */}
                    <div className="md:col-span-2 relative">
                        <SearchSelect
                            label="Producto"
                            placeholder={isLoadingProducts ? "Buscando..." : "Escribe..."}
                            options={productOptions}
                            selectedId={form.producto}
                            onChange={(newId: number) => {
                                const selected = productOptions.find(p => p.id === newId);
                                handleChange('producto', newId); // Usamos el helper
                                if(selected) handleChange('producto_nombre', selected.nombre);
                            }}
                            onInputChange={(text) => setSearchTerm(text)}
                            disabled={!!initialData}
                        />
                        {/* MOSTRAR ERROR DE PRODUCTO SI EXISTE */}
                        {errors.producto && <p className="text-red-500 text-xs mt-1">{errors.producto[0]}</p>}
                    </div>

                    {/* INPUT CÓDIGO LOTE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Lote *</label>
                        <input
                            className={`w-full border p-2 rounded focus:ring-2 outline-none ${errors.codigo_lote ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                            value={form.codigo_lote}
                            // Usamos el helper handleChange
                            onChange={e => handleChange('codigo_lote', e.target.value)}
                            required
                        />
                        {/* MENSAJE DE ERROR */}
                        {errors.codigo_lote && (
                            <span className="text-red-500 text-xs font-bold block mt-1">
                                {errors.codigo_lote[0]}
                            </span>
                        )}
                    </div>

                    {/* INPUT CANTIDAD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.cantidad || ''}
                            onChange={e => handleChange('cantidad', Number(e.target.value))}
                            required
                        />
                         {errors.cantidad && <p className="text-red-500 text-xs mt-1">{errors.cantidad[0]}</p>}
                    </div>

                    {/* INPUT FECHA VENCIMIENTO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                        <input
                            type="date"
                            className={`w-full border p-2 rounded outline-none ${errors.fecha_vencimiento ? 'border-red-500' : 'border-gray-300'}`}
                            value={form.fecha_vencimiento}
                            onChange={e => handleChange('fecha_vencimiento', e.target.value)}
                            required
                        />
                        {errors.fecha_vencimiento && (
                             <span className="text-red-500 text-xs font-bold block mt-1">
                                {errors.fecha_vencimiento[0]}
                            </span>
                        )}
                    </div>

                    {/* INPUT FECHA ELABORACIÓN */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Elaboración</label>
                         <input
                            type="date"
                            className={`w-full border p-2 rounded outline-none ${errors.fecha_creacion ? 'border-red-500' : 'border-gray-300'}`}
                            value={form.fecha_creacion}
                            onChange={e => handleChange('fecha_creacion', e.target.value)}
                            required
                         />
                         {errors.fecha_creacion && (
                             <span className="text-red-500 text-xs font-bold block mt-1">
                                {errors.fecha_creacion[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* BOTONES */}
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
                
                {/* Mensaje de error general si existe non_field_errors */}
                {errors.non_field_errors && (
                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {errors.non_field_errors[0]}
                    </div>
                )}
            </form>
        </div>
    );
};