import api from '../api/axios';
import type { Laboratorio } from '../domain/models/laboratorio';
import {type Lotes,type PaginatedResponse } from '../domain/models/Lotes';


const ENDPOINT = '/lotes/';

export const loteService = {
    getAll: async (page: number = 1): Promise<PaginatedResponse<Lotes>> => {
        
        const response = await api.get<PaginatedResponse<Lotes>>(ENDPOINT,{
            params: {
                page:page
            }
        });
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