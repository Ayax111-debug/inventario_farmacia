import { useState, useEffect, useCallback } from 'react';
import { type Lotes } from '../../domain/models/Lotes';
import { loteService } from '../../services/lotes.service';
import axios from 'axios';

export const useLotes = () => {
    const [lotes, setLotes] = useState<Lotes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    // Este error es solo para errores GLOBALES (500, red, etc)
    const [globalError, setGlobalError] = useState<string | null>(null);

    // ... (paginación y fetchLotes igual que antes) ...
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const fetchLotes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await loteService.getAll(page);
            setLotes(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setGlobalError(null);
        } catch (err) {
            console.error(err);
            setGlobalError('Error al cargar lotes');
        } finally {
            setLoading(false);
        }
    }, [page]);
    
    useEffect(() => { fetchLotes(); }, [fetchLotes]);


    // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
    const crearLote = async (lote: Lotes) => {
        try {
            await loteService.create(lote);
            await fetchLotes();
            // No retornamos true/false, si no falla, asumimos éxito
        } catch (err) {
            // Si es error de validación, LO LANZAMOS ARRIBA
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                throw err; 
            }
            // Si es otro error, lo manejamos aquí
            setGlobalError('Error crítico al crear el lote');
            throw err; // También lo lanzamos para detener el formulario
        }
    };

    const actualizarLote = async (id: number, prod: Lotes) => {
        try {
            await loteService.update(id, prod);
            setLotes(prev => prev.map(item => 
                item.id === id ? { ...item, ...prod } : item
            ));
        } catch (err) {
            // RE-LANZAR EL ERROR para que LoteForm lo capture
            throw err; 
        }
    };

    const eliminarLote = async (id: number) => {
        try {
            await loteService.delete(id);
            setLotes(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setGlobalError('Error al eliminar lote');
        }
    };

    return {
        lotes,
        loading,
        error: globalError, // Renombrado para claridad
        pagination: { page, setPage, totalPages, hasNext: page < totalPages, hasPrev: page > 1, nextPage: () => setPage(p => Math.min(p + 1, totalPages)), prevPage: () => setPage(p => Math.max(p - 1, 1)) },
        crearLote,
        actualizarLote, // Nota: La firma ahora devuelve Promise<void> que puede fallar
        eliminarLote,
        refetch: fetchLotes
    };
};