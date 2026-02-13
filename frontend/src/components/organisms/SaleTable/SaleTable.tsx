// src/components/organisms/SaleTable.tsx
import {type CartItem } from "../../../domain/models/Venta";

interface Props {
    items: CartItem[];
    onRemove: (index: number) => void;
}

export const SaleTable = ({ items, onRemove }: Props) => {
    if (items.length === 0) {
        return <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded">
            El carrito de ventas está vacío. Escanea un producto para comenzar.
        </div>
    }

    return (
        <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio U.</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                        <tr key={`${item.producto.id}-${index}`} className="hover:bg-blue-50">
                            <td className="p-3">
                                <p className="font-bold text-gray-800">{item.producto.nombre}</p>
                                <p className="text-xs text-gray-500">{item.producto.codigo_serie}</p>
                            </td>
                            <td className="p-3 text-center font-medium">{item.cantidad}</td>
                            <td className="p-3 text-right">${item.precio_congelado.toLocaleString()}</td>
                            <td className="p-3 text-right font-bold text-blue-600">${item.subtotal.toLocaleString()}</td>
                            <td className="p-3 text-center">
                                <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 font-bold px-2">
                                    X
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};