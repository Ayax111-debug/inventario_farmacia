import api from '../api/axios';

// Definimos la interfaz aquí o en domain/models/Search.ts
export interface SearchResultItem {
    id: number;
    titulo: string;
    subtitulo: string;
    extra: string;
}

export interface GlobalSearchResponse {
    productos: SearchResultItem[];
    lotes: SearchResultItem[];
    laboratorios: SearchResultItem[];
}

export const globalSearchService = {
    search: async (query: string) => {
        const response = await api.get<GlobalSearchResponse>('/global-search/', {
            params: { q: query }
        });
        return response.data;
    }
};