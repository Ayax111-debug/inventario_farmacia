import api from '../api/axios';
import {type Laboratorio,type PaginatedResponse } from '../domain/models/laboratorio';


const ENDPOINT = '/laboratorios/';

export const laboratorioService = {
    getAll: async (page:number = 1): Promise<PaginatedResponse<Laboratorio>> => {
       
        const response = await api.get<PaginatedResponse<Laboratorio>>(ENDPOINT,{
            params: {
                page:page
            }
        });
        
        return response.data;
    },
    getAllNoPagination: async(): Promise<Laboratorio[]> => {
        const response = await api.get<Laboratorio[]>(`${ENDPOINT}simple_list/`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Laboratorio>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    create: async (data: Laboratorio) => {
        const response = await api.post<Laboratorio>(ENDPOINT, data);
        return response.data;
    },

    update: async (id: number, data: Partial<Laboratorio>) => {
        const response = await api.patch<Laboratorio>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`${ENDPOINT}${id}/`);
    }
};