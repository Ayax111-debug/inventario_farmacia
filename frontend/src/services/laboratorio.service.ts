import api from '../api/axios';
import {type Laboratorio,type PaginatedResponse } from '../domain/models/laboratorio';

// Ajusta esto si tu prefijo en backend es distinto (ej: /api/v1/laboratorios/)
const ENDPOINT = '/laboratorios/';

export const laboratorioService = {
    getAll: async () => {
        // Si tu backend NO pagina por defecto, usa <Laboratorio[]>
        // Si tu backend SÍ pagina, usa <PaginatedResponse<Laboratorio>>
        // Asumiremos lista simple por ahora para facilitar, luego ajustamos paginación
        const response = await api.get<Laboratorio[]>(ENDPOINT);
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