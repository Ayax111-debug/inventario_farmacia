// hooks/useLaboratoriosSelect.ts
import { useState, useEffect } from 'react';
import { type Laboratorio } from '../../domain/models/laboratorio';
import { laboratorioService } from '../../services/laboratorio.service';

export const useLaboratoriosSelect = () => {
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Empieza cargando
    const [error, setError] = useState<string | null>(null);

    const cargarLaboratorios = async () => {
        setLoading(true);
        try {
            // Usamos el servicio "No Pagination" que creamos antes
            const data = await laboratorioService.getAllNoPagination();
            setLaboratorios(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar la lista de laboratorios');
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta UNA sola vez al montar el componente
    useEffect(() => {
        cargarLaboratorios();
    }, []);

    return { 
        laboratorios, 
        loading, 
        error,
        // Exponemos la función por si necesitas recargar la lista manualmente
        // (Ej: Si creas un laboratorio desde un modal rápido)
        recargarLista: cargarLaboratorios 
    };
};