import { useState, useEffect, useCallback } from 'react';
import { type Producto } from '../../domain/models/Producto';
import { productoService } from '../../services/producto.service'

export const useProductos = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const fetchProductos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productoService.getAll(page);
            setProductos(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const crearProducto = async (prod: Producto) => {
        try {
            await productoService.create(prod);
            await fetchProductos();
            return true;
        } catch (err) {
            setError('Error al crear producto');
            return false;
        }
    };

    const actualizarProducto = async (id: number, prod: Producto) => {
        setLoading(true);
        try {
            await productoService.update(id, prod);
            setProductos(prev => prev.map(item => 
                item.id === id ? { ...item, ...prod } : item
            ));
            return true;
        } catch (err) {
            setError('Error al actualizar producto');
            return false;
        }finally{
        setLoading(false)
        }
    };

    const eliminarProducto = async (id: number) => {
        try {
            await productoService.delete(id);
            setProductos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Error al eliminar producto');
        }
    };

    return {
        productos,
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
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        refetch: fetchProductos
    };
};