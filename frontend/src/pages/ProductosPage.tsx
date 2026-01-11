import { useState } from 'react';
import { useProductos } from '../hooks/inventario/useProducto';
import {useLaboratorios} from '../hooks/inventario/useLaboratorio';
import { ProductoForm } from '../components/organisms/Producto/ProductoForm';
import { ProductoTable } from '../components/organisms/Producto/ProductoTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { type Producto } from '../domain/models/Producto';
import {Paginator} from '../components/molecules/Paginator'

const ProductosPage = () => {
    // 1. Extraemos la lógica del Hook
    const { 
        productos, 
        loading, 
        error, 
        pagination,
        crearProducto, 
        eliminarProducto,
        actualizarProducto,
    } = useProductos();

    const {laboratorios, loading: loadingLabs} = useLaboratorios();

    // 2. Estados para el Modal y Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProd, setEditingProd] = useState<Producto | null>(null);

    // 3. Handlers para abrir/cerrar modal
    const handleCreate = () => {
        setEditingProd(null); // Limpiamos para que sea uno nuevo
        setIsModalOpen(true);
    };

    const handleEdit = (prod: Producto) => {
        setEditingProd(prod); // Cargamos el producto a editar
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProd(null);
    };

    // 4. El Cerebro: Decide si crea o actualiza
    const handleSubmit = async (formData: Producto) => {
        let success = false;

        if (editingProd && editingProd.id) {
            // EDITAR
            success = await actualizarProducto(editingProd.id, formData);
        } else {
            // CREAR
            success = await crearProducto(formData);
        }

        if (success) {
            handleCloseModal();
        }
        return success;
    };

    // 5. Loader
    if (loading && productos.length === 0) {
        return <div className="p-10 text-center text-blue-600 font-medium">Cargando inventario...</div>;
    }

    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            Total: {productos.length}
                        </span>
                    </div>

                    <button 
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                    >
                        <span>+</span> Nuevo Producto
                    </button>
                </div>
                
                {/* Manejo de Errores */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
                        <p className="font-bold">Error del sistema</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Tabla */}
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

                {/* Modal con Formulario */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProd ? "Editar Producto" : "Registrar Nuevo Producto"}
                >
                    <ProductoForm 
                        onSubmit={handleSubmit}
                        initialData={editingProd}
                        onCancel={handleCloseModal}
                        listaLaboratorios={laboratorios}
                    />
                </Modal>

            </div>
        </MainTemplate>   
    );
};

export default ProductosPage;