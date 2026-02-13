// hooks/useLaboratoriosSelect.ts
import { useState, useEffect } from 'react';
import { type Producto } from '../../domain/models/Producto';
import { productoService } from '../../services/producto.service';

export const useProductoSelect = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Empieza cargando
    const [error, setError] = useState<string | null>(null);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            // Usamos el servicio "No Pagination" que creamos antes
            const data = await productoService.getAllNoPagination();
            setProductos(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar la lista de productos');
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta UNA sola vez al montar el componente
    useEffect(() => {
        cargarProductos();
    }, []);

    return { 
        productos, 
        loading, 
        error,
        // Exponemos la función por si necesitas recargar la lista manualmente
        // (Ej: Si creas un laboratorio desde un modal rápido)
        recargarLista: cargarProductos
    };
};