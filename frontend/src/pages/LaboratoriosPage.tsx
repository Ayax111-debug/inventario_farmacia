import { useLaboratorios } from '../hooks/inventario/useLaboratorio';
import { LaboratorioForm } from '../components/organisms/Laboratorio/LaboratorioForm';
import { LaboratorioTable } from '../components/organisms/Laboratorio/LaboratorioTable';
import { MainTemplate } from '../components/templates/MainTemplate';

const LaboratoriosPage = () => {
    // 1. Extraemos la lógica del Hook
    const { 
        laboratorios, 
        loading, 
        error, 
        crearLaboratorio, 
        eliminarLaboratorio 
    } = useLaboratorios();

    // 2. Si carga, mostramos un loader simple (puedes crear un Atom Loader luego)
    if (loading && laboratorios.length === 0) {
        return <div className="p-10 text-center text-blue-600 font-medium">Cargando inventario...</div>;
    }

    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Laboratorios</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Total: {laboratorios.length}
                </span>
            </div>
            
            {/* Manejo de Errores Visual */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error del sistema</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Inyección de Dependencias (Props) */}
            <LaboratorioForm onSubmit={crearLaboratorio} />
            
            <LaboratorioTable 
                data={laboratorios} 
                onDelete={eliminarLaboratorio} 
            />
        </div>
        </MainTemplate>
        
    );
};

export default LaboratoriosPage;