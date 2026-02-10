import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { useLotes } from '../hooks/inventario/useLotes';
import { LoteForm } from '../components/organisms/Lotes/LoteForm';
import { LoteTable } from '../components/organisms/Lotes/LoteTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { Paginator } from '../components/molecules/Paginator';
import { type Lotes } from '../domain/models/Lotes';
// IMPORTANTE: Traemos el servicio directo para búsquedas individuales
import { loteService } from '../services/lotes.service'; 
import { AddButton } from '../components/atoms/Button/AddButton';
import { useProductoSelect } from '../hooks/inventario/useProductoSelect';

const LotesPage = () => {
    // 1. Hook para manipular la URL
    const [searchParams, setSearchParams] = useSearchParams();

    // 2. Hooks de lógica de negocio
    const { 
        lotes, 
        loading, 
        error, 
        pagination, 
        crearLote, 
        eliminarLote, 
        actualizarLote 
    } = useLotes();

    // Necesitamos los productos para el select del formulario
    const { productos } = useProductoSelect(); 

    // 3. Estados locales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLote, setEditingLote] = useState<Lotes | null>(null);
    const [fetchingSingle, setFetchingSingle] = useState(false); // Nuevo estado de carga individual

    // ---------------------------------------------
    // 4. EL EFECTO ESPÍA (Lógica de Auto-Apertura)
    // ---------------------------------------------
    useEffect(() => {
        const editId = searchParams.get('editar');

        if (!editId) return; // Si no hay param, no hacemos nada

        const idToFind = Number(editId);
        const loteEnLista = lotes.find(l => l.id === idToFind);

        if (loteEnLista) {
            setEditingLote(loteEnLista);
            setIsModalOpen(true);
        } else {
            // B. Fallback: Si no está visible (ej. está en pag 5), lo busco al servidor
            setFetchingSingle(true);
            loteService.getById(idToFind)
                .then((loteDesdeApi) => {
                    setEditingLote(loteDesdeApi);
                    setIsModalOpen(true);
                })
                .catch((err) => {
                    console.error("Error recuperando lote individual:", err);
                    setSearchParams({}); // Limpiamos URL si falla
                })
                .finally(() => {
                    setFetchingSingle(false);
                });
        }
    }, [searchParams]); // Solo depende de la URL

    // ---------------------------------------------
    // 5. HANDLERS
    // ---------------------------------------------
    const handleCreate = () => {
        setEditingLote(null);
        setIsModalOpen(true);
        setSearchParams({});
    };

    const handleEdit = (lote: Lotes) => {
        if (!lote.id) return; // Guardia de seguridad
        
        setEditingLote(lote);
        setIsModalOpen(true);
        // Actualizamos URL para que sea compartible
        setSearchParams({ editar: lote.id.toString() });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLote(null);
        setSearchParams({}); // Limpiamos la URL al cerrar
    };

    const handleSubmit = async (formData: Lotes) => {
    // Ya no usamos try/catch aquí, porque LoteForm se encarga de atrapar el error
    // para mostrar los mensajes rojos.
    
    if (editingLote && editingLote.id) {
        await actualizarLote(editingLote.id, formData);
    } else {
        await crearLote(formData);
    }

    // Si la línea de arriba NO lanzó error, significa que todo salió bien.
    // Cerramos el modal inmediatamente.
    handleCloseModal();
    
    // Retornamos una promesa vacía para cumplir con la firma
    return Promise.resolve();
    };

    // ---------------------------------------------
    // 6. RENDER
    // ---------------------------------------------
    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                
                {/* Header */}
                <div className="flex bg-white p-5 rounded-xl shadow-sm justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Lotes</h1>
                    <AddButton label='Agregar Lote' onClick={handleCreate}/>
                </div>
                
                {/* Feedback de carga individual (Opcional pero recomendado UX) */}
                {fetchingSingle && (
                    <div className="fixed top-20 right-6 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg shadow-lg border border-yellow-200 text-sm animate-pulse z-50">
                        ⏳ Cargando datos del lote...
                    </div>
                )}

                {/* Mensaje de Error General */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">
                        {error}
                    </div>
                )}

                {/* Tabla y Paginación */}
                {loading && lotes.length === 0 ? (
                   <div className="p-10 text-center text-gray-600">Cargando lotes...</div>
                ) : (
                    <>
                        <LoteTable 
                            data={lotes} 
                            onDelete={eliminarLote}
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
                    </>
                )}

                {/* Modal Inteligente */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingLote ? "Editar Lote" : "Nuevo Lote"}
                >
                    {fetchingSingle ? (
                        // Loader interno del modal
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Recuperando información...</p>
                        </div>
                    ) : (
                        <LoteForm 
                            onSubmit={handleSubmit}
                            initialData={editingLote}
                            onCancel={handleCloseModal}
                            
                           
                        />
                    )}
                </Modal>
            </div>
        </MainTemplate>
    );
};

export default LotesPage;