import { PaginatedResponse } from '../types/api';
import { objectToQueryString } from '@/lib/queryUtils';

class HttpError extends Error {
    response: Response;
    data: any;

    constructor(response: Response, data: any) {
        super(`HTTP Error: ${response.status}`);
        this.name = "HttpError";
        this.response = response;
        this.data = data;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    // Si la respuesta es 204 No Content, devolver objeto vacío
    if (response.status === 204) {
        return {} as T;
    }
    
    const data = await response.json();

    if(!response.ok) {
        throw new HttpError(response, data);
    }

    return data;
}

// Helper to get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
            return decodeURIComponent(cookie.substring(name.length));
        }
    }
    return null;
}

function getCookie(n: string) {
    console.log('Getting cookie:', n);
  if (typeof document === 'undefined') return '';
  console.log('Document cookies:', document.cookie);
  const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
const xsrf = getCookie('XSRF-TOKEN');


// Helper to get headers with CSRF token
function getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrf,
    };
    
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return headers;
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const apiBaseURL = `${baseURL}/api/v1/`;

export const apiService = {
    getList: <T>(
        resource: string,
        queryParams: Record<string, any> = {},
    ): Promise<PaginatedResponse<T>> => {
        const { per_page, ...restParams } = queryParams;
        const apiParams = {
            ...restParams,
            per_page: per_page || 10,
        }

        const queryString = objectToQueryString(apiParams);
        const url = queryString
            ? `${apiBaseURL}${resource}?${queryString}`
            : `${apiBaseURL}${resource}`;

        return fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        })
        .then(handleResponse<PaginatedResponse<T>>);
    },
    getOne: <T>(resource: string, id: string | number): Promise<T> => {
        return fetch(`${apiBaseURL}${resource}/${id}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        })
        .then(handleResponse<T>);
    },
    getOneWithIncludes: <T>(resource: string, id: string | number, includes: string[]): Promise<T> => {
        const includeParam = includes.join(',');
        return fetch(`${apiBaseURL}${resource}/${id}?include=${includeParam}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        })
        .then(handleResponse<T>);
    },
    create: <T>(resource: string, data: T): Promise<any> => {
        return fetch(`${apiBaseURL}${resource}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    update: <T>(resource: string, id: string | number, data: T): Promise<any> => {
        return fetch(`${apiBaseURL}${resource}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    delete: (resource: string, id: string | number): Promise<any> => {
        return fetch(`${apiBaseURL}${resource}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    bulkImport: <T>(resource: string, data: T[]): Promise<any> => {
        return fetch(`${apiBaseURL}${resource}/import`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ data }),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Obtener datos de Pareto para factores de riesgo por grupo
    getParetoFactores: (grupoId: number): Promise<ParetoData[]> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/factores-pareto`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<ParetoData[]>);
    },
    // Obtener datos de Pareto para factores de riesgo por periodo (todos los grupos)
    getParetoFactoresByPeriodo: (periodoId: number, carreraId?: number, semestre?: number): Promise<ParetoData[]> => {
        const params = new URLSearchParams({ periodo_id: periodoId.toString() });
        if (carreraId) params.append('carrera_id', carreraId.toString());
        if (semestre) params.append('semestre', semestre.toString());
        
        return fetch(`${apiBaseURL}dashboard/pareto-factores?${params.toString()}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<ParetoData[]>);
    },
    // Obtener datos del Scatter Plot: Faltas vs Calificación Final por grupo
    getScatterPlotFaltas: (grupoId: number): Promise<ScatterPlotData[]> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/scatter-faltas`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<ScatterPlotData[]>);
    },
    // Obtener datos del Scatter Plot por periodo (todos los grupos)
    getScatterPlotFaltasByPeriodo: (periodoId: number, carreraId?: number, semestre?: number): Promise<ScatterPlotData[]> => {
        const params = new URLSearchParams({ periodo_id: periodoId.toString() });
        if (carreraId) params.append('carrera_id', carreraId.toString());
        if (semestre) params.append('semestre', semestre.toString());
        
        return fetch(`${apiBaseURL}dashboard/scatter-faltas?${params.toString()}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<ScatterPlotData[]>);
    },
    // Obtener datos de Ishikawa para un grupo
    getIshikawaData: (grupoId: number): Promise<IshikawaData> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/ishikawa-data`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<IshikawaData>);
    },
    // Guardar análisis de Ishikawa
    saveIshikawaAnalysis: (grupoId: number, data: { tasa_reprobacion: number; observaciones: Record<string, string> }): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/ishikawa/save`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Obtener último análisis guardado de Ishikawa
    getLatestIshikawaAnalysis: (grupoId: number): Promise<{ data: SavedIshikawaAnalysis | null }> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/ishikawa/latest`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<{ data: SavedIshikawaAnalysis | null }>)
        .catch(() => ({ data: null })); // Si no existe, retornar null
    },
    // Obtener alumnos inscritos en un grupo
    getGrupoAlumnos: (grupoId: number): Promise<GrupoAlumno[]> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/alumnos`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<GrupoAlumno[]>);
    },
    // Obtener asistencias de un grupo por fecha
    getGrupoAsistencias: (grupoId: number, fecha: string): Promise<Record<number, AsistenciaRecord>> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/asistencias?fecha=${fecha}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<Record<number, AsistenciaRecord>>);
    },
    // Guardar asistencias en lote
    saveAsistenciasBulk: (grupoId: number, data: { fecha: string; asistencias: { inscripcion_id: number; estatus: 'presente' | 'ausente' | 'retardo' }[] }): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/asistencias/bulk`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Obtener unidades de la materia del grupo
    getGrupoUnidades: (grupoId: number): Promise<Unidad[]> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/unidades`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<Unidad[]>);
    },
    // Crear unidad para la materia del grupo
    createGrupoUnidad: (grupoId: number, data: { numero_unidad: number; nombre_unidad?: string }): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/unidades`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Actualizar unidad de la materia del grupo
    updateGrupoUnidad: (grupoId: number, unidadId: number, data: { numero_unidad: number; nombre_unidad?: string }): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/unidades/${unidadId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Eliminar unidad de la materia del grupo
    deleteGrupoUnidad: (grupoId: number, unidadId: number): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/unidades/${unidadId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Agregar alumno a un grupo
    addAlumnoToGrupo: (grupoId: number, alumnoId: number): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/alumnos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ alumno_id: alumnoId }),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Remover alumno de un grupo
    removeAlumnoFromGrupo: (grupoId: number, inscripcionId: number): Promise<any> => {
        return fetch(`${apiBaseURL}grupos/${grupoId}/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Obtener alumno detallado con todas sus relaciones
    getAlumnoDetallado: (alumnoId: number): Promise<any> => {
        return fetch(`${apiBaseURL}alumnos/${alumnoId}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Actualizar calificaciones en bulk
    updateCalificacionesBulk: (inscripcionId: number, data: { calificaciones: { unidad_id: number; valor_calificacion: number }[]; calificacion_final?: number }): Promise<any> => {
        return fetch(`${apiBaseURL}inscripciones/${inscripcionId}/calificaciones-bulk`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    // Actualizar usuario (email y password)
    updateUsuario: (usuarioId: number, data: { email: string; password?: string; password_confirmation?: string }): Promise<any> => {
        return fetch(`${apiBaseURL}usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include',
        }).then(handleResponse<any>);
    },
    
    /**
     * Exporta datos a Excel o CSV
     * @param resource - Nombre del recurso (ej. 'alumnos')
     * @param format - Formato de exportación ('excel' | 'csv')
     * @param queryParams - Parámetros de filtrado actuales
     */
    exportFile: async (
        resource: string,
        format: 'excel' | 'csv',
        queryParams: Record<string, any> = {}
    ): Promise<Blob> => {
        const queryString = objectToQueryString(queryParams);
        const url = queryString
            ? `${apiBaseURL}${resource}/export/${format}?${queryString}`
            : `${apiBaseURL}${resource}/export/${format}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, application/octet-stream',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrf,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new HttpError(response, await response.text());
        }

        return response.blob();
    },
    
    // Get dashboard data
    getDashboardData: (queryParams: Record<string, any> = {}): Promise<any> => {
        const queryString = objectToQueryString(queryParams);
        const url = queryString
            ? `${apiBaseURL}dashboard?${queryString}`
            : `${apiBaseURL}dashboard`;

        return fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },

    // Work Order Photo methods
    uploadWorkOrderPhoto: (workOrderId: string, formData: FormData): Promise<any> => {
        return fetch(`${apiBaseURL}work-order-photos`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrf,
            },
            body: formData,
            credentials: 'include',
        }).then(handleResponse<any>);
    },

    getWorkOrderPhotos: (workOrderId: string): Promise<any[]> => {
        return fetch(`${apiBaseURL}work-order-photos?filter[work_order_id]=${workOrderId}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },

    deleteWorkOrderPhoto: (photoId: string): Promise<any> => {
        return fetch(`${apiBaseURL}work-order-photos/${photoId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },

    // Billing methods
    getBillingStats: (): Promise<any> => {
        return fetch(`${apiBaseURL}billing/stats`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include',
        }).then(handleResponse<any>);
    },

    getBillingList: (queryParams: Record<string, any> = {}): Promise<any> => {
        return apiService.getList('billing', {
            ...queryParams,
            include: 'client,workOrder,lineItems',
        });
    },

    getBillingById: (id: string): Promise<any> => {
        return apiService.getOne('billing', id);
    },

    createBilling: (data: any): Promise<any> => {
        return apiService.create('billing', data);
    },

    updateBilling: (id: string, data: any): Promise<any> => {
        return apiService.update('billing', id, data);
    },

    deleteBilling: (id: string): Promise<any> => {
        return apiService.delete('billing', id);
    },

    // Billing Line Items
    createBillingLineItem: (data: any): Promise<any> => {
        return apiService.create('billing-line-items', data);
    },

    updateBillingLineItem: (id: string, data: any): Promise<any> => {
        return apiService.update('billing-line-items', id, data);
    },

    deleteBillingLineItem: (id: string): Promise<any> => {
        return apiService.delete('billing-line-items', id);
    },

    // Notifications
    getNotifications: (queryParams: Record<string, any> = {}): Promise<any> => {
        return apiService.getList('notifications', queryParams);
    },

    markNotificationAsRead: (id: string): Promise<any> => {
        return apiService.update('notifications', id, { status: 'read', read_at: new Date().toISOString() });
    },

    markAllNotificationsAsRead: (userId: number): Promise<any> => {
        // This would need a custom backend endpoint, for now we'll handle individually
        return Promise.resolve();
    },

    deleteNotification: (id: string): Promise<any> => {
        return apiService.delete('notifications', id);
    },
};

// Tipo para los datos de Pareto
export interface ParetoData {
    nombre: string;
    frecuencia: number;
    porcentaje_acumulado: number;
}

// Tipos para los datos de Ishikawa
export interface CausaSecundaria {
    nombre: string;
    frecuencia: number;
}

export interface CausaPrincipal {
    categoria: string;
    causas_secundarias: CausaSecundaria[];
}

export interface IshikawaData {
    efecto: string;
    tasa_reprobacion: number;
    causas_principales: CausaPrincipal[];
}

// Tipo para el análisis guardado
export interface SavedIshikawaAnalysis {
    id: number;
    grupo_id: number;
    user_id: number;
    tasa_reprobacion: number;
    observaciones: Record<string, string>;
    created_at: string;
    updated_at: string;
}
// Tipo para los datos del Scatter Plot
export interface ScatterPlotData {
    calificacion_final: number;
    faltas: number;
    asistencias: number;
    justificados: number;
    total_asistencias: number;
    porcentaje_asistencia: number;
    num_factores_riesgo: number;
    alumno_nombre: string;
    alumno_id: number;
}

// Tipo para alumno en grupo
export interface GrupoAlumno {
    id: number;
    inscripcion_id: number;
    matricula: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    nombre_completo: string;
    semestre: number;
    carrera: string | null;
    calificacion_final: number | null;
}

// Tipo para registro de asistencia
export interface AsistenciaRecord {
    id: number;
    inscripcion_id: number;
    fecha: string;
    estatus: 'presente' | 'ausente' | 'retardo';
    created_at: string;
    updated_at: string;
}

// Tipo para unidad
export interface Unidad {
    id: number;
    materia_id: number;
    numero_unidad: number;
    nombre_unidad: string | null;
    created_at: string;
    updated_at: string;
}
