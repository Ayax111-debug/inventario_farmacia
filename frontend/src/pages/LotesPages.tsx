import { useState } from 'react';
import { useLotes } from '../hooks/inventario/useLotes';
import { useProductos } from '../hooks/inventario/useProducto';
import { LoteForm } from '../components/organisms/Lotes/LoteForm';
import { LoteTable } from '../components/organisms/Lotes/LoteTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { type Lotes } from '../domain/models/Lotes';

const LotesPage = () => {
    const { 
        lotes, 
        loading: loadingLotes, 
        error: errorLotes, 
        crearLote, 
        eliminarLote, 
        actualizarLote 
    } = useLotes();

    const { 
        productos, 
        loading: loadingProductos 
    } = useProductos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLote, setEditingLote] = useState<Lotes | null>(null);

    const handleCreate = () => {
        setEditingLote(null);
        setIsModalOpen(true);
    };

    const handleEdit = (lote: Lotes) => {
        setEditingLote(lote);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLote(null);
    };

    const handleSubmit = async (formData: Lotes) => {
        let success = false;

        if (editingLote && editingLote.id) {
            success = await actualizarLote(editingLote.id, formData);
        } else {
            success = await crearLote(formData);
        }

        if (success) {
            handleCloseModal();
        }
        return success;
    };

    const isLoading = loadingLotes || (loadingProductos && lotes.length === 0);

    if (isLoading && lotes.length === 0) {
        return <div className="p-10 text-center text-blue-600 font-medium">Cargando gestión de lotes...</div>;
    }

    return (
        <MainTemplate>
            <div className="max-w-7xl mx-auto p-6">
                
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">Control de Lotes y Vencimientos</h1>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            Total: {lotes.length}
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                    >
                        <span>+</span> Registrar Lote
                    </button>
                </div>

                {errorLotes && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                        <p className="font-bold">Error</p>
                        <p>{errorLotes}</p>
                    </div>
                )}

                <LoteTable 
                    data={lotes} 
                    onDelete={eliminarLote}
                    onEdit={handleEdit}
                />

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingLote ? "Editar Lote / Vencimiento" : "Entrada de Nuevo Lote"}
                >
                    <LoteForm 
                        onSubmit={handleSubmit}
                        initialData={editingLote}
                        onCancel={handleCloseModal}
                        listaProductos={productos}
                    />
                </Modal>

            </div>
        </MainTemplate>
    );
};

export default LotesPage;