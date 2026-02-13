// src/pages/POSPage.tsx
import { useState } from 'react';
import { POSTemplate } from '../components/templates/PosTemplate';
import { ProductFinder } from '../components/molecules/ProductFinder';
import { SaleTable } from '../components/organisms/SaleTable';
import { useCart } from '../hooks/pos/useCart';
import { ventaService } from '../services/venta.service';
import {type CreateVentaPayload } from '../domain/models/Venta';

const POSPage = () => {
    const { cartItems, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO'); // Por defecto

    const handleProcessSale = async () => {
        if (cartItems.length === 0) return;
        
        setIsProcessing(true);
        try {
            // Preparamos el payload simple para el backend
            const payload: CreateVentaPayload = {
                metodo_pago: paymentMethod,
                items: cartItems.map(item => ({
                    producto_id: item.producto.id!,
                    cantidad: item.cantidad
                }))
            };

            const nuevaVenta = await ventaService.create(payload);
            
            alert(`✅ Venta registrada con éxito!\nID: ${nuevaVenta.id.substring(0,8)}\nTotal: $${nuevaVenta.total}`);
            clearCart();
            // Aquí podrías redirigir a una vista de impresión de recibo

        } catch (error) {
            console.error("Error procesando venta:", error);
            alert("❌ Error al procesar la venta. Verifica el stock o intenta nuevamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Definición de Áreas para el Template ---

    const ScannerArea = <ProductFinder onProductSelected={addToCart} />;
    const CartArea = <SaleTable items={cartItems} onRemove={removeFromCart} />;
    
    const SummarySidebar = (
        <div className="h-full flex flex-col justify-between font-bold text-gray-700">
            <div>
                <h2 className="text-2xl mb-6 uppercase tracking-wide border-b pb-2">Resumen de Venta</h2>
                
                {/* Selector Método Pago Simple */}
                <div className="mb-6">
                    <label className="block text-xs uppercase text-gray-500 mb-2">Método de Pago</label>
                    <select 
                        className="w-full p-3 border rounded bg-gray-50 text-lg font-medium"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                    >
                        <option value="EFECTIVO">💵 Efectivo</option>
                        <option value="DEBITO">💳 Tarjeta Débito</option>
                        <option value="CREDITO">💳 Tarjeta Crédito</option>
                    </select>
                </div>

                <div className="flex justify-between items-center mb-2 text-lg">
                    <span>N° Ítems:</span>
                    <span>{cartItems.length}</span>
                </div>
            </div>

            <div>
                 {/* Gran Total */}
                <div className="flex justify-between items-end mb-6 bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                    <span className="text-xl uppercase text-blue-800">Total a Pagar:</span>
                    <span className="text-5xl font-black text-blue-700">${cartTotal.toLocaleString()}</span>
                </div>

                {/* Botón de Pago */}
                <button 
                    onClick={handleProcessSale}
                    disabled={cartItems.length === 0 || isProcessing}
                    className={`w-full p-5 rounded-lg text-2xl text-white uppercase tracking-wider transition-all
                        ${cartItems.length === 0 || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'}
                    `}
                >
                    {isProcessing ? 'Procesando...' : 'Confirmar Venta (F10)'}
                </button>
                 <p className="text-center text-xs text-gray-400 mt-2">Asegúrate de haber recibido el pago antes de confirmar.</p>
            </div>
        </div>
    );

    return (
        <POSTemplate 
            scannerArea={ScannerArea}
            cartArea={CartArea}
            summarySidebar={SummarySidebar}
        />
    );
};

export default POSPage;