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