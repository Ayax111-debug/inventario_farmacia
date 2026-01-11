import { useState } from 'react';
import { useLaboratorios } from '../hooks/inventario/useLaboratorio';
import { LaboratorioForm } from '../components/organisms/Laboratorio/LaboratorioForm';
import { LaboratorioTable } from '../components/organisms/Laboratorio/LaboratorioTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { Paginator } from '../components/molecules/Paginator'; 
import { type Laboratorio } from '../domain/models/laboratorio';

const LaboratoriosPage = () => {
    const { 
        laboratorios, 
        loading, 
        error, 
        pagination, 
        crearLaboratorio, 
        eliminarLaboratorio, 
        actualizarLaboratorio 
    } = useLaboratorios();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Laboratorio | null>(null);

    const handleCreate = () => {
        setEditingLab(null);
        setIsModalOpen(true);
    };

    const handleEdit = (lab: Laboratorio) => {
        setEditingLab(lab);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLab(null);
    };

    const handleSubmit = async (formData: Laboratorio) => {
        let success = false;
        if (editingLab && editingLab.id) {
            success = await actualizarLaboratorio(editingLab.id, formData);
        } else {
            success = await crearLaboratorio(formData);
        }
        if (success) handleCloseModal();
        return success;
    };

    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Laboratorios</h1>
                    <button 
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                    >
                        + Nuevo
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">
                        {error}
                    </div>
                )}

                {loading && laboratorios.length === 0 ? (
                   <div className="p-10 text-center text-blue-600 font-medium">Cargando...</div>
                ) : (
                    <>
                        <LaboratorioTable 
                            data={laboratorios} 
                            onDelete={eliminarLaboratorio}
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

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingLab ? "Editar Laboratorio" : "Nuevo Laboratorio"}
                >
                    <LaboratorioForm 
                        onSubmit={handleSubmit}
                        initialData={editingLab}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            </div>
        </MainTemplate>
    );
};

export default LaboratoriosPage;