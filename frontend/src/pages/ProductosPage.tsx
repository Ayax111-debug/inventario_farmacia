import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductos } from '../hooks/inventario/useProducto';
import { useLaboratorios } from '../hooks/inventario/useLaboratorio';
import { ProductoForm } from '../components/organisms/Producto/ProductoForm';
import { ProductoTable } from '../components/organisms/Producto/ProductoTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { type Producto } from '../domain/models/Producto';
import { Paginator } from '../components/molecules/Paginator';
import { productoService } from '../services/producto.service'; 

const ProductosPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Hooks simples, sin lógica extraña
    const { 
        productos, loading, pagination,
        crearProducto, eliminarProducto, actualizarProducto,
    } = useProductos();

    const { laboratorios } = useLaboratorios();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProd, setEditingProd] = useState<Producto | null>(null);
    const [fetchingSingle, setFetchingSingle] = useState(false); 

    // --- LÓGICA DE URL (Para cargar producto al recargar página) ---
    useEffect(() => {
        const editId = searchParams.get('editar');
        if (!editId) return;
        
        const idToFind = Number(editId);
        const productoEnLista = productos.find(p => p.id === idToFind); 
    

        if (productoEnLista) {
            setEditingProd(productoEnLista);
            setIsModalOpen(true);
        } else {
            setFetchingSingle(true);
            productoService.getById(idToFind)
                .then((ProductoDesdeApi) => {
                    setEditingProd(ProductoDesdeApi);
                    setIsModalOpen(true);
                })
                .catch(() => setSearchParams({}))
                .finally(() => setFetchingSingle(false));
        }
    }, [searchParams]);


    // --- HANDLERS SIMPLES ---
    const handleCreate = () => {
        setEditingProd(null);
        setIsModalOpen(true);
        setSearchParams({});
    };

    const handleEdit = (prod: Producto) => {
        if (!prod.id) return; 
        setEditingProd(prod);
        setIsModalOpen(true);
        setSearchParams({ editar: prod.id.toString() });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProd(null);
        setSearchParams({}); 
    };

    const handleSubmit = async (formData: Producto) => {
        let success = false;
        if (editingProd && editingProd.id) {
            success = await actualizarProducto(editingProd.id, formData);
        } else {
            success = await crearProducto(formData);
        }
        if (success) handleCloseModal();
        return success;
    };

    if (loading && productos.length === 0) {
        return <div className="p-10 text-center text-blue-600 font-medium">Cargando inventario...</div>;
    }

    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
                    <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition">
                        + Nuevo Producto
                    </button>
                </div>
                {fetchingSingle && (
                    <div className="fixed top-20 right-6 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg shadow-lg border border-yellow-200 text-sm animate-pulse z-50">
                        ⏳ Cargando datos del lote...
                    </div>
                )}


                <ProductoTable 
                    data={productos} 
                    onDelete={eliminarProducto} 
                    onEdit={handleEdit}
                />
                
                <Paginator 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onNext={pagination.nextPage}
                    onPrev={pagination.prevPage}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                />

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProd ? "Editar Producto" : "Registrar Nuevo Producto"}
                >
                     {fetchingSingle ? (
                        <div className="p-10 text-center">Cargando datos...</div>
                    ) : (
                        <ProductoForm 
                            onSubmit={handleSubmit}
                            initialData={editingProd}
                            onCancel={handleCloseModal}
                            
                            listaLaboratorios={laboratorios} // Pasamos la lista normal
                        />
                    )}
                </Modal>
            </div>
        </MainTemplate>   
    );
};

export default ProductosPage;