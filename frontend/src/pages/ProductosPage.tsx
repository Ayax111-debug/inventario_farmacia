import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductos } from '../hooks/inventario/useProducto';
import { ProductoForm } from '../components/organisms/Producto/ProductoForm';
import { ProductoTable } from '../components/organisms/Producto/ProductoTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { Paginator } from '../components/molecules/Paginator';
import { SmartFilter, type FilterConfig } from '../components/organisms/SmartFilter/SmartFilter';
import { productoService } from '../services/producto.service'; 
import { AddButton } from '../components/atoms/Button/AddButton';
import { useLaboratoriosSelect } from '../hooks/inventario/useLaboratorioSelect'; 
import { type Producto } from '../domain/models/Producto';

const ProductosPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. ESTADO PARA FILTROS
    const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

    // 2. HOOK DE PRODUCTOS (Ahora recibe filtros)
    const { 
        productos, loading, error, pagination,
        crearProducto, eliminarProducto, actualizarProducto,
    } = useProductos(currentFilters);

    const { laboratorios } = useLaboratoriosSelect();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProd, setEditingProd] = useState<Producto | null>(null);
    const [fetchingSingle, setFetchingSingle] = useState(false); 

    // ---------------------------------------------
    // 3. CONFIGURACIÓN DEL SMART FILTER
    // ---------------------------------------------
    const filterConfig: FilterConfig[] = useMemo(() => [
        { 
            key: 'search', 
            label: 'Buscar (Nombre/SKU)', 
            type: 'text' 
        },
        { 
            key: 'laboratorio', 
            label: 'Laboratorio', 
            type: 'select',
            // Mapeamos laboratorios asegurando que el ID no sea undefined para TS
            options: laboratorios
                .filter(l => l.id !== undefined)
                .map(l => ({ id: l.id!, label: l.nombre }))
        },
        { 
            key: 'es_bioequivalente', 
            label: 'Bioequivalente', 
            type: 'boolean' 
        },
        { 
            key: 'activo', 
            label: 'Estado', 
            type: 'boolean' 
        }
    ], [laboratorios]);

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setCurrentFilters(newFilters);
        pagination.goToPage(1); // Reset a pág 1 al filtrar
    };

    // ---------------------------------------------
    // 4. LÓGICA DE URL Y MODAL (Optimizada)
    // ---------------------------------------------
    useEffect(() => {
        const editId = searchParams.get('editar');
        if (!editId) {
            setEditingProd(null)
            setIsModalOpen(false)
            return;}
        
        const idToFind = Number(editId);

        // Guardia de seguridad para evitar re-renders infinitos o lag
        if (isModalOpen && editingProd?.id === idToFind) return;

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
    }, [searchParams, productos.length]);

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
        if (editingProd?.id) {
            await actualizarProducto(editingProd.id, formData);
        } else {
            await crearProducto(formData);
        }
        handleCloseModal();
    };

    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                
                {/* Header */}
                <div className="flex bg-white p-5 rounded-xl shadow-sm justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Catálogo de Productos</h1>
                    <AddButton label='Agregar Producto' onClick={handleCreate}/>
                </div>

                {/* Smart Filter */}
                <SmartFilter 
                    config={filterConfig} 
                    onFilterChange={handleFilterChange} 
                />

                {/* Feedback de Carga/Error */}
                {fetchingSingle && (
                    <div className="fixed top-20 right-6 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg shadow-lg border border-yellow-200 text-sm animate-pulse z-50">
                        ⏳ Cargando datos del producto...
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 mb-6 rounded border border-red-200">
                        {error}
                    </div>
                )}

                {/* Tabla y Paginación */}
                {loading && productos.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 animate-pulse font-medium">
                        Cargando catálogo...
                    </div>
                ) : (
                    <>
                        <ProductoTable 
                            data={productos} 
                            onDelete={eliminarProducto} 
                            onEdit={handleEdit}
                        />
                        
                        <div className="mt-4">
                            <Paginator 
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onNext={pagination.nextPage}
                                onPrev={pagination.prevPage}
                                hasNext={pagination.hasNext}
                                hasPrev={pagination.hasPrev}
                            />
                        </div>
                    </>
                )}

                {/* Modal de Formulario */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProd ? "Editar Producto" : "Registrar Nuevo Producto"}
                >
                     {fetchingSingle ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-sm text-gray-500">Recuperando información...</p>
                        </div>
                    ) : (
                        <ProductoForm 
                            onSubmit={handleSubmit}
                            initialData={editingProd}
                            onCancel={handleCloseModal}
                            listaLaboratorios={laboratorios}
                        />
                    )}
                </Modal>
            </div>
        </MainTemplate>   
    );
};

export default ProductosPage;