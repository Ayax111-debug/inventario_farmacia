import { useState, useEffect, useCallback } from 'react';
import { type Lotes } from '../../domain/models/Lotes';
import { loteService } from '../../services/lotes.service';

// Aceptamos filtros opcionales
export const useLotes = (filters: Record<string, any> = {}) => {
    const [lotes, setLotes] = useState<Lotes[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estado de paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    // useCallback evita loops infinitos
    const fetchLotes = useCallback(async (currentPage: number, currentFilters: any) => {
        setLoading(true);
        setError(null);
        try {
            // Pasamos página Y filtros al servicio
            const data = await loteService.getAll(currentPage, currentFilters);
            
            setLotes(data.results);
            setTotalPages(Math.ceil(data.count / 10)); // Asumiendo page_size=10
            setHasNext(!!data.next);
            setHasPrev(!!data.previous);
        } catch (err) {
            setError("Error al cargar los lotes");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // EFECTO PRINCIPAL: Se dispara si cambia la página O los filtros
    useEffect(() => {
        fetchLotes(page, filters);
    }, [page, filters, fetchLotes]); // <--- Aquí está la magia

    // Funciones de paginación
    const nextPage = () => { if (hasNext) setPage(prev => prev + 1); };
    const prevPage = () => { if (hasPrev) setPage(prev => prev - 1); };
    const goToPage = (num: number) => setPage(num);

    // CRUD (Crear, Actualizar, Eliminar) - Simplificados para el ejemplo
    const crearLote = async (lote: Lotes) => {
        await loteService.create(lote);
        fetchLotes(page, filters); // Recargamos la lista
    };

    const actualizarLote = async (id: number, lote: Lotes) => {
        await loteService.update(id, lote);
        fetchLotes(page, filters);
    };

    const eliminarLote = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar este lote?")) return;
        try {
            await loteService.delete(id);
            fetchLotes(page, filters);
        } catch (e) {
            alert("No se pudo eliminar el lote (quizás tiene stock).");
        }
    };

    return {
        lotes,
        loading,
        error,
        crearLote,
        actualizarLote,
        eliminarLote,
        pagination: {
            page,
            totalPages,
            nextPage,
            prevPage,
            goToPage, // Importante para resetear a pág 1 al filtrar
            hasNext,
            hasPrev
        }
    };
};