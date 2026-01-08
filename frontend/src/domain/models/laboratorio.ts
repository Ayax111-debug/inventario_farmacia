export interface Laboratorio {
    id?: number; // Opcional al crear, obligatorio al leer
    nombre: string;
    direccion?: string;
    direccion2?: string;
    telefono?: string;
}

// Como DRF paginará por defecto (si lo tienes configurado así), 
// es bueno tener una interfaz para la respuesta paginada.
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}