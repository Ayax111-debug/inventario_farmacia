import { useState, useEffect, type FormEvent } from 'react';
import { type Laboratorio } from '../../../domain/models/laboratorio';
import axios from 'axios';

interface Props {
    onSubmit: (lab: Laboratorio) => Promise<void | any>;
    initialData?: Laboratorio | null;
    onCancel?: () => void;
}

export const LaboratorioForm = ({ onSubmit, initialData, onCancel }: Props) => {
    
    const initialState = { nombre: '', direccion: '', telefono: '' };
    
    const [form, setForm] = useState<Laboratorio>(initialState);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(initialState);
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (field: keyof Laboratorio, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!form.nombre.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(form);

            if (!initialData) {
                setForm(initialState);
            }
            if (onCancel && initialData) onCancel();

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrors(error.response.data);
            } else {
                alert("Error inesperado al guardar el laboratorio.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (fieldName: string) => `
        w-full border p-2 rounded focus:ring-2 outline-none transition
        ${errors[fieldName] 
            ? 'border-red-500 ring-red-200 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }
    `;

    return (
        <div className="bg-white p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Laboratorio' : 'Registrar Nuevo Laboratorio'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {errors.non_field_errors && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {errors.non_field_errors[0]}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input 
                            className={inputClass('nombre')}
                            placeholder="Ej: Pfizer"
                            value={form.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.nombre && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.nombre[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input 
                            className={inputClass('direccion')}
                            placeholder="Ej: Av. Providencia 1234"
                            value={form.direccion || ''}
                            onChange={e => handleChange('direccion', e.target.value)}
                            disabled={isSubmitting}
                        />
                        {errors.direccion && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.direccion[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input 
                            className={inputClass('telefono')}
                            placeholder="Ej: +56912345678"
                            value={form.telefono || ''}
                            onChange={e => handleChange('telefono', e.target.value)}
                            disabled={isSubmitting}
                        />
                        {errors.telefono && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.telefono[0]}</span>}
                    </div>
                </div>
            
                <div className="flex gap-3 justify-end mt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={() => { setForm(initialState); setErrors({}); onCancel(); }}
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