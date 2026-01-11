export interface Lotes{
    producto: number;
    id?: number;
    codigo_lote: string;
    fecha_creacion: Date;
    fecha_vencimiento: Date;
    cantidad: number;
    defectuoso: boolean;
    activo: boolean;
}
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}