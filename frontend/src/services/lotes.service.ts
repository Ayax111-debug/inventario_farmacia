import api from '../api/axios';
import {type Lotes } from '../domain/models/Lotes';


const ENDPOINT = '/lotes/';

export const loteService = {
    getAll: async () => {
        
        const response = await api.get<Lotes[]>(ENDPOINT);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Lotes>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    create: async (data: Lotes) => {
        const response = await api.post<Lotes>(ENDPOINT, data);
        return response.data;
    },

    update: async (id: number, data: Partial<Lotes>) => {
        const response = await api.patch<Lotes>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`${ENDPOINT}${id}/`);
    }
};