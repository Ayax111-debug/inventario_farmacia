import { useState, useEffect,type FormEvent } from 'react';
import  { type Laboratorio}  from '../../../domain/models/laboratorio';

interface Props {
    // El componente padre decide qué hacer al guardar (POST API, log, etc)
    onSubmit: (lab: Laboratorio) => Promise<boolean | void>;
    initialData?:Laboratorio | null;
    onCancel?: () => void;
}

export const LaboratorioForm = ({ onSubmit, initialData, onCancel }: Props) => {
    const initialState = { nombre: '', direccion: '', telefono: '' };
    const [form, setForm] = useState<Laboratorio>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

     useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(initialState);
        }
    }, [initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;

        setIsSubmitting(true);
       
        const success = await onSubmit(form);
        setIsSubmitting(false);

        if (success) {
            setForm(initialState);
        }

        
        
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrar Nuevo Laboratorio</h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input 
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="Ej: Pfizer"
                        value={form.nombre}
                        onChange={e => setForm({...form, nombre: e.target.value})}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
                    <input 
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        placeholder="Ej: Av. Siempre Viva 123"
                        value={form.direccion}
                        onChange={e => setForm({...form, direccion: e.target.value})}
                        disabled={isSubmitting}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded font-medium text-white transition
                        ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                    `}
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
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
            </form>
        </div>
    );
};