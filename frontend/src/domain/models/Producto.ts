export interface Producto{
    laboratorio: number;
    id?: number;
    nombre: string;
    descripcion: string;
    cantidad_mg: number;
    cantidad_capsulas: number;
    es_bioequivalente: boolean;
    codigo_serie: string;
    precio_venta: number;
    activo: boolean;
}