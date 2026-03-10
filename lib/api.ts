const API_BASE_URL = 'http://localhost:3333/api/v1';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  pipelineStatus: 'novo_lead' | 'agendado' | 'confirmado' | 'atendido' | 'retorno' | 'perdido';
  source: 'ai_agent' | 'whatsapp' | 'manual';
  professional?: string | null;
  notes?: string | null;
  createdAt: string;
  lastInteraction: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: { name: string };
  professional: string;
  date: string;
  time: string;
  duration: number;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'falta';
  type?: string | null;
  notes?: string | null;
  aiScheduled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalPatients: number;
  totalPatientsChange: number;
  appointmentsToday: number;
  appointmentsTodayChange: number;
  confirmationRate: number;
  confirmationRateChange: number;
  aiConversions: number;
  aiConversionsChange: number;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.error || error.message || 'API Error');
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const api = {
  // Patients
  getPatients: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchApi<{ data: Patient[]; pagination: any }>(`/patients${query}`);
  },
  getPatient: (id: string) => fetchApi<Patient>(`/patients/${id}`),
  createPatient: (data: any) => fetchApi<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) => fetchApi<Patient>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePatient: (id: string) => fetchApi<void>(`/patients/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchApi<Appointment[]>(`/appointments${query}`);
  },
  createAppointment: (data: any) => fetchApi<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: any) => fetchApi<Appointment>(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAppointment: (id: string) => fetchApi<void>(`/appointments/${id}`, { method: 'DELETE' }),

  // Pipeline
  getPipeline: () => fetchApi<{ columns: any }>('/pipeline'),
  movePatient: (patientId: string, newStatus: string) => 
    fetchApi<Patient>('/pipeline/move', { method: 'POST', body: JSON.stringify({ patientId, newStatus }) }),

  // Metrics
  getDashboardMetrics: () => fetchApi<DashboardMetrics>('/metrics/dashboard'),
  getWeeklyMetrics: () => fetchApi<any[]>('/metrics/weekly'),
  getSourceMetrics: () => fetchApi<any[]>('/metrics/sources'),
  getAIActivity: () => fetchApi<any[]>('/ai/activity'),
};
