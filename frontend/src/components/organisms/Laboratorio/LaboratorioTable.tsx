import { type Laboratorio } from '../../../domain/models/laboratorio';
import { EditButton } from '../../atoms/Button/EditButton';
import { DeleteButton } from '../../atoms/Button/DeleteButton';



interface Props {
    data: Laboratorio[];
    onDelete: (id: number) => void;
    onEdit: (lab: Laboratorio) => void;
}

export const LaboratorioTable = ({ data, onDelete, onEdit}: Props) => {
    
    if (data.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay laboratorios registrados en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className=" px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((lab) => (
                            <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{lab.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {lab.nombre}
                                </td>
                               
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                    <EditButton className='bg-blue-400 text-white hover:bg-blue-200 m-1' onClick={() => (onEdit(lab))}/>

                                    <DeleteButton className='bg-red-400 text-white hover:bg-red-200'  onClick={() => lab.id && onDelete(lab.id)} />

                                </td>
                            </tr>
                        ))} 
                    </tbody>
                </table>
            </div>
        </div>
    );
};