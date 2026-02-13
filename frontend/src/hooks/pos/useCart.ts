// src/hooks/pos/useCart.ts
import { useState, useMemo } from 'react';
import { type CartItem } from '../../domain/models/Venta';
import {type Producto } from '../../domain/models/Producto';

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Calcular el total en tiempo real
    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    }, [items]);

    // Agregar producto escaneado al carrito
    const addToCart = (producto: Producto, cantidad: number) => {
        // Validación básica de stock visual (el backend hará la validación real ACID)
       
        if (cantidad > producto.stock_total) {
             alert("¡Atención! Estás intentando vender más stock del disponible.");

        }

        const newItem: CartItem = {
            producto,
            cantidad,
            precio_congelado: producto.precio_venta,
            subtotal: producto.precio_venta * cantidad
        };

        // Por simplicidad MVP, si agregan el mismo prod, lo añadimos como fila nueva.
        // En un futuro se podría buscar si existe y sumar cantidad.
        setItems(prev => [...prev, newItem]);
    };

    // Remover un ítem (si se equivocó el cajero)
    const removeFromCart = (indexToRemove: number) => {
        setItems(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const clearCart = () => {
        setItems([]);
    };

    return {
        cartItems: items,
        cartTotal: total,
        addToCart,
        removeFromCart,
        clearCart
    };
};