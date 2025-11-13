const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const apiBaseURL = `${baseURL}/api/v1/`;

export interface Periodo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface DashboardStats {
  totalEstudiantes: number;
  reprobacionPromedio: number;
  desercionEstimada: number;
  desercionPorSemestre: Array<{
    semestre: string;
    estudiantes: number;
  }>;
  periodos: Periodo[];
  periodoSeleccionado: number | null;
}

export interface GradesData {
  rango: string;
  frecuencia: number;
}

export interface RiskFactorData {
  nombre: string;
  frecuencia: number;
}

export interface AnalyticsData {
  calificaciones_data: GradesData[];
  factores_riesgo_data: RiskFactorData[];
  promedio_general: number;
}

export interface AnalyticsFilters {
  periodo_id: number;
  carrera_id?: number;
  semestre?: number;
}

export const dashboardService = {
  getStats: async (periodoId?: number): Promise<DashboardStats> => {
    const url = periodoId 
      ? `${apiBaseURL}dashboard/stats?periodo_id=${periodoId}`
      : `${apiBaseURL}dashboard/stats`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching dashboard stats');
    }

    return response.json();
  },

  getAnalytics: async (filters: AnalyticsFilters): Promise<AnalyticsData> => {
    const params = new URLSearchParams({
      periodo_id: filters.periodo_id.toString(),
    });

    if (filters.carrera_id) {
      params.append('carrera_id', filters.carrera_id.toString());
    }

    if (filters.semestre) {
      params.append('semestre', filters.semestre.toString());
    }

    const response = await fetch(`${apiBaseURL}dashboard/analytics?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching analytics data');
    }

    return response.json();
  }
};
