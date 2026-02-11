import axios from 'axios';
import { type Lotes } from '../domain/models/Lotes';

const API_URL = 'http://localhost:8000/api/lotes/'; // Ajusta tu URL

export const loteService = {
    // MODIFICADO: Ahora acepta 'filters' como segundo argumento
    getAll: async (page: number = 1, filters: Record<string, any> = {}) => {
        
        // Axios es inteligente: le pasamos el objeto 'params' y él arma la URL
        // Ej: ?page=1&activo=true&search=L-001
        const response = await axios.get(API_URL, {
            params: {
                page,
                ...filters // Aquí expandimos los filtros que vienen del SmartFilter
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<Lotes> => {
        const response = await axios.get(`${API_URL}${id}/`);
        return response.data;
    },

    create: async (lote: Lotes): Promise<Lotes> => {
        const response = await axios.post(API_URL, lote);
        return response.data;
    },

    update: async (id: number, lote: Lotes): Promise<Lotes> => {
        const response = await axios.put(`${API_URL}${id}/`, lote);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}${id}/`);
    }
};