import { useState, useEffect, type FormEvent } from 'react';
import { type Producto } from '../../../domain/models/Producto';
import { type Laboratorio } from '../../../domain/models/laboratorio';


interface Props {
    onSubmit: (producto: Producto) => Promise<boolean | void>;
    initialData?: Producto | null;
    onCancel?: () => void;
    listaLaboratorios: Laboratorio[];
}

export const ProductoForm = ({ onSubmit, initialData, onCancel, listaLaboratorios }: Props) => {

    // Estado inicial: Activo empieza en true, números en 0
    const initialState: Producto = {
        laboratorio: 0,
        laboratorio_nombre:'',
        nombre: '',
        descripcion: '',
        cantidad_mg: 0,
        cantidad_capsulas: 0,
        es_bioequivalente: false,
        codigo_serie: '',
        precio_venta: 0,
        activo: true
    };

    const [form, setForm] = useState<Producto>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(initialState);
        }
    }, [initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validaciones Obligatorias
        if (
            !form.nombre.trim() ||
            !form.codigo_serie.trim() ||
            form.laboratorio <= 0 ||
            form.cantidad_mg <= 0 ||
            form.precio_venta < 0
        ) {
            alert("Por favor completa los campos obligatorios correctamente.");
            return;
        }

        setIsSubmitting(true);
         const productoParaEnviar: Producto = {
                    id: initialData?.id, // Mantenemos el ID si existe
                    laboratorio: form.laboratorio,
                    laboratorio_nombre: form.laboratorio_nombre,
                    nombre: form.nombre,
                    descripcion: form.descripcion,
                    cantidad_mg: form.cantidad_mg,
                    cantidad_capsulas: form.cantidad_capsulas,
                    es_bioequivalente: form.es_bioequivalente,
                    codigo_serie: form.codigo_serie,
                    precio_venta: form.precio_venta,
                    activo: form.activo,
                };

        const success = await onSubmit(productoParaEnviar);
        setIsSubmitting(false);

        if (success && !initialData) {
            setForm(initialState);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Paracetamol"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>

                    {/* Código de Serie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código Barra *</label>
                        <input
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: 78000123"
                            value={form.codigo_serie}
                            onChange={e => setForm({ ...form, codigo_serie: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>id_laboratorio</label>
                        <p className='mb-2 bg-grey'>
                            {initialData && !listaLaboratorios.find(l => l.id === form.laboratorio) && (
                                
                                <option value={form.laboratorio}>
                                 {form.laboratorio} 
                                </option>
                            )}
                        </p>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Laboratorio *</label>
                        
                        <select
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={form.laboratorio} // El valor seleccionado es el ID (número)
                            onChange={e => setForm({
                                ...form,
                                // OJO AQUÍ: Los select siempre devuelven strings, hay que convertir a Number
                                laboratorio: Number(e.target.value)
                            })}
                            required
                            disabled={!!initialData}
                        >
                            <option value={0}>-- Seleccione un laboratorio --</option>

                            {/* Mapeamos la lista para crear las opciones */}
                            {listaLaboratorios.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                    {lab.nombre}
                                </option>
                            ))}
                            {initialData && !listaLaboratorios.find(l => l.id === form.laboratorio) && (
                                
                                <option value={form.laboratorio}>
                                 {form.laboratorio_nombre} 
                                </option>
                            )}
                        </select>
                    </div>

                    {/* Precio Venta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.precio_venta || ''}
                            onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
                            required
                        />
                    </div>

                    {/* Cantidad MG */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosis (mg) *</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.cantidad_mg || ''}
                            onChange={e => setForm({ ...form, cantidad_mg: Number(e.target.value) })}
                            required
                        />
                    </div>

                    {/* Cantidad Cápsulas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cápsulas/Unidades</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.cantidad_capsulas || ''}
                            onChange={e => setForm({ ...form, cantidad_capsulas: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Descripción (Ancho completo) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Componente Activo / Descripción</label>
                    <textarea
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                        value={form.descripcion}
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    />
                </div>

                {/* CHECKBOXES */}
                <div className="flex gap-6 items-center py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            checked={form.es_bioequivalente}
                            onChange={e => setForm({ ...form, es_bioequivalente: e.target.checked })}
                        />
                        <span>Es Bioequivalente</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            checked={form.activo}
                            onChange={e => setForm({ ...form, activo: e.target.checked })}
                        />
                        <span>Producto Activo</span>
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