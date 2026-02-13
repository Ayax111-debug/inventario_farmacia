import { type Lotes } from '../../../domain/models/Lotes';
import { EditButton } from '../../atoms/Button/EditButton';
import { DeleteButton } from '../../atoms/Button/DeleteButton';

interface Props {
    data: Lotes[];
    onDelete: (id: number) => void;
    onEdit: (lote: Lotes) => void;
}

export const LoteTable = ({ data, onDelete, onEdit }: Props) => {

    const formatDate = (date: Date | string) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getVencimientoStatus = (fechaVencimiento: Date | string) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

        if (diasRestantes < 0) {
            return <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-xs border border-red-200">VENCIDO</span>;
        } else if (diasRestantes <= 30) {
            return <span className="text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded text-xs border border-orange-200">Por Vencer ({diasRestantes}d)</span>;
        }
        return <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs border border-green-200">Vigente</span>;
    };

    if (data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center border border-gray-100">
                <p className="text-gray-500 text-lg">No hay lotes registrados en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                            <th className="p-4 font-semibold">Código / Producto</th>
                            <th className="p-4 font-semibold">Stock</th>
                            <th className="p-4 font-semibold">Fechas</th>
                            <th className="p-4 font-semibold">Vencimiento</th>
                            <th className="p-4 font-semibold">Condición</th> {/* Nueva Columna */}
                            <th className="p-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((lote) => (
                            <tr key={lote.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                {/* Código y Producto Combinados para ahorrar espacio horizontal */}
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{lote.codigo_lote}</span>
                                        <span className="text-xs text-gray-500">Prod ID: #{lote.producto}</span>
                                        {/* Si tienes el nombre del producto en el objeto lote, úsalo aquí */}
                                        {lote.producto_nombre && <span className="text-xs text-blue-600">{lote.producto_nombre}</span>} 
                                    </div>
                                </td>
                                
                                <td className="p-4">
                                    <span className={`font-bold ${lote.cantidad === 0 ? 'text-red-500' : 'text-gray-800'}`}>
                                        {lote.cantidad} un.
                                    </span>
                                </td>

                                <td className="p-4 text-xs text-gray-500">
                                    <div>C: {formatDate(lote.fecha_creacion)}</div>
                                    <div>V: {formatDate(lote.fecha_vencimiento)}</div>
                                </td>

                                <td className="p-4">
                                    {getVencimientoStatus(lote.fecha_vencimiento)}
                                </td>

                                {/* Columna Condición: Activo/Defectuoso */}
                                <td className="p-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        {/* Badge Activo/Inactivo */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                            lote.activo 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {lote.activo ? 'Activo' : 'Inactivo'}
                                        </span>

                                        {/* Badge Defectuoso */}
                                        {lote.defectuoso && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                                                ⚠ Defectuoso
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <EditButton onClick={() => onEdit(lote)}/>
                                        <DeleteButton onClick={() => lote.id && onDelete(lote.id)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};