import api from '../api/axios';
import {type Producto } from '../domain/models/Producto';


const ENDPOINT = '/productos/';

export const productoService = {
    getAll: async () => {
       
        const response = await api.get<Producto[]>(ENDPOINT);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Producto>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    create: async (data: Producto) => {
        const response = await api.post<Producto>(ENDPOINT, data);
        return response.data;
    },

    update: async (id: number, data: Partial<Producto>) => {
        const response = await api.patch<Producto>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`${ENDPOINT}${id}/`);
    }
};