import { useState, useEffect, useCallback } from 'react';
import { type Laboratorio } from '../../domain/models/laboratorio';
import { laboratorioService } from '../../services/laboratorio.service';
import axios from 'axios';

export const useLaboratorios = () => {
    // 1. Estado de Datos
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // 2. Estado de Paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10; // Debe coincidir con tu settings.py de Django

    // 3. Fetch Data (Ahora depende de la página)
    const fetchLaboratorios = useCallback(async () => {
        setLoading(true);
        try {
            // Pasamos la página actual al servicio
            const data = await laboratorioService.getAll(page);
            
            // Extraemos el array de 'results' y calculamos páginas totales
            setLaboratorios(data.results); 
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setGlobalError(null);
        } catch (err) {
            console.error(err);
            setGlobalError('Error al cargar laboratorios. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    }, [page]); // Se ejecuta cada vez que 'page' cambia

    // Cargar al montar y al cambiar de página
    useEffect(() => {
        fetchLaboratorios();
    }, [fetchLaboratorios]);

    // 4. CRUD Operations
    const crearLaboratorio = async (lab: Laboratorio) => {
        setLoading(true);
        try {
            await laboratorioService.create(lab);
            await fetchLaboratorios(); // Recargamos para ver el nuevo item
            return true;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400){
                throw(err)
            }
            setGlobalError("Error inesperado al actualizar")
        } finally {
            setLoading(false);
        }
    };

    const actualizarLaboratorio = async (id: number, lab: Laboratorio) => {
        setLoading(true);
        try {
            await laboratorioService.update(id, lab);
            await fetchLaboratorios(); // Aseguramos consistencia con backend
            return true;
        } catch (err) {
            throw(err)

        } finally {
            setLoading(false);
        }
    };

    const eliminarLaboratorio = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este laboratorio?')) return;
        
        setLoading(true);
        try {
            await laboratorioService.delete(id);
            // Si borramos el último item de una página y no es la primera, volvemos atrás
            if (laboratorios.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                await fetchLaboratorios();
            }
            
        } catch (err) {
            setGlobalError('Error al eliminar');
            
        } finally {
            setLoading(false);
        }
    };

    // 5. Exponer datos y controles
    return {
        laboratorios,
        loading,
        error: globalError,
        pagination: {
            page,
            setPage,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
            prevPage: () => setPage(p => Math.max(p - 1, 1))
        },
        crearLaboratorio,
        eliminarLaboratorio,
        actualizarLaboratorio,
        refetch: fetchLaboratorios
    };
};