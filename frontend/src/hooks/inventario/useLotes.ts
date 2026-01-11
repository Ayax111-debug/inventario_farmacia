import { useState, useEffect, useCallback } from 'react';
import { type Lotes } from '../../domain/models/Lotes';
import { loteService } from '../../services/lotes.service'

export const useLotes = () => {
    const [lotes, setLotes] = useState<Lotes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const fetchLotes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await loteService.getAll(page);
            setLotes(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar lotes');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchLotes();
    }, [fetchLotes]);

    const crearLote = async (lote: Lotes) => {
        try {
            await loteService.create(lote);
            await fetchLotes();
            return true;
        } catch (err) {
            setError('Error al crear el lote');
            return false;
        }
    };

    const actualizarLote = async (id: number, prod: Lotes) => {
        try {
            await loteService.update(id, prod);
            setLotes(prev => prev.map(item => 
                item.id === id ? { ...item, ...prod } : item
            ));
            return true;
        } catch (err) {
            setError('Error al actualizar lote');
            return false;
        }
    };

    const eliminarLote = async (id: number) => {
        try {
            await loteService.delete(id);
            setLotes(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Error al eliminar lote');
        }
    };

    return {
        lotes,
        loading,
        error,
         pagination: {
            page,
            setPage,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
            prevPage: () => setPage(p => Math.max(p - 1, 1))
        },
        crearLote,
        actualizarLote,
        eliminarLote,
        refetch: fetchLotes
    };
};