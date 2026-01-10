import { useState, useEffect, useCallback } from 'react';
import { type Laboratorio } from '../../domain/models/laboratorio';
import { laboratorioService } from '../../services/laboratorio.service';

export const useLaboratorios = () => {
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLaboratorios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await laboratorioService.getAll();
            setLaboratorios(data); // Ojo: si es paginado sería data.results
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar laboratorios. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar al montar
    useEffect(() => {
        fetchLaboratorios();
    }, [fetchLaboratorios]);

    const crearLaboratorio = async (lab: Laboratorio) => {
        try {
            await laboratorioService.create(lab);
            await fetchLaboratorios(); // Recargamos la lista (Estrategia simple)
            return true;
        } catch (err) {
            setError('Error al crear');
            return false;
        }
    };

    const actualizarLaboratorio = async (id: number, lab: Laboratorio) => {
        try {
            await laboratorioService.update(id, lab);
            
            setLaboratorios(prev => prev.map(item => 
                item.id === id ? { ...item, ...lab } : item
            ));
            
            return true;
        } catch (err) {
            setError('Error al actualizar el laboratorio');
            return false;
        }
    };


    const eliminarLaboratorio = async (id: number) => {
        try {
            await laboratorioService.delete(id);
            // Estrategia Optimista (más rápida visualmente):
            setLaboratorios(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            setError('Error al eliminar');
        }
    };

    return {
        laboratorios,
        loading,
        error,
        crearLaboratorio,
        eliminarLaboratorio,
        actualizarLaboratorio,
        refetch: fetchLaboratorios
    };
};