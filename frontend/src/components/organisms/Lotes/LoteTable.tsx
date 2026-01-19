import { type Lotes } from '../../../domain/models/Lotes';
import { EditButton } from '../../atoms/Button/EditButton';
import { DeleteButton } from '../../atoms/Button/DeleteButton';


interface Props {
    data: Lotes[];
    onDelete: (id: number) => void;
    onEdit: (lote: Lotes) => void;
}

export const LoteTable = ({ data, onDelete, onEdit }: Props) => {

    // Función auxiliar para formatear fechas (ej: 2026-01-10 -> 10/01/2026)
    const formatDate = (date: Date | string) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para calcular el estado de vencimiento
    const getVencimientoStatus = (fechaVencimiento: Date | string) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

        if (diasRestantes < 0) {
            return <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded text-xs">VENCIDO</span>;
        } else if (diasRestantes <= 30) {
            return <span className="text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded text-xs">Por Vencer ({diasRestantes} días)</span>;
        }
        return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Vigente</span>;
    };

    if (data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center border border-gray-100">
                <p className="text-gray-500 text-lg">No hay lotes registrados en el sistema.</p>
                <p className="text-sm text-gray-400 mt-2">Registra un nuevo lote para comenzar a gestionar el stock.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                            <th className="p-4 font-semibold">Código</th>
                            <th className="p-4 font-semibold">Producto ID</th>
                            <th className="p-4 font-semibold">Cantidad</th>
                            <th className="p-4 font-semibold">Elaboración</th>
                            <th className="p-4 font-semibold">Vencimiento</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((lote) => (
                            <tr 
                                key={lote.id} 
                                className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
                            >
                                <td className="p-4 font-medium text-gray-900">
                                    {lote.codigo_lote}
                                </td>
                                <td className="p-4">
                                    #{lote.producto}
                                </td>
                                <td className="p-4 font-bold">
                                    {lote.cantidad} un.
                                </td>
                                <td className="p-4 text-gray-500">
                                    {formatDate(lote.fecha_creacion)}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span>{formatDate(lote.fecha_vencimiento)}</span>
                                        {getVencimientoStatus(lote.fecha_vencimiento)}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {/* Badge Activo/Inactivo */}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                            lote.activo 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {lote.activo ? 'Disponible' : 'Inactivo'}
                                        </span>

                                        {/* Badge Defectuoso */}
                                        {lote.defectuoso && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                Defectuoso
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <EditButton className='bg-blue-400 text-white hover:bg-blue-200 m-1' onClick={() => (onEdit(lote))}/>

                                    <DeleteButton className='bg-red-400 text-white hover:bg-red-200'  onClick={() => lote.id && onDelete(lote.id)} />
                                        
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};