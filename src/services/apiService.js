import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl, handleAuthError } from '../config/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await handleAuthError(401);
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authService = {
  // Login admin
  loginAdmin: async (employeeCode, pin) => {
    const response = await api.post('/auth/login', { employeeCode, pin });
    return response.data;
  },

  // Login empleado con TOTP
  loginEmployee: async (employeeCode, totpCode) => {
    const response = await api.post('/auth/login/totp', { employeeCode, totpCode });
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// ==================== EMPLOYEES ====================
export const employeeService = {
  // Obtener todos los empleados
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Obtener empleado por ID
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Crear empleado
  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Actualizar empleado
  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Toggle activo/inactivo
  toggleActive: async (id) => {
    const response = await api.patch(`/employees/${id}/toggle-active`);
    return response.data;
  },

  // Regenerar TOTP
  regenerateTotp: async (id) => {
    const response = await api.post(`/employees/${id}/regenerate-totp`);
    return response.data;
  },
};

// ==================== RECORDS ====================
export const recordService = {
  // Checkin
  checkin: async (device = 'mobile', location = null, notes = '') => {
    const response = await api.post('/records/checkin', { device, location, notes });
    return response.data;
  },

  // Checkout
  checkout: async (device = 'mobile', location = null, notes = '') => {
    const response = await api.post('/records/checkout', { device, location, notes });
    return response.data;
  },

  // Obtener estado actual
  getStatus: async () => {
    const response = await api.get('/records/status');
    return response.data;
  },

  // Obtener registros del empleado
  getMyRecords: async (params = {}) => {
    const response = await api.get('/records', { params });
    return response.data;
  },

  // Obtener todos los registros (admin)
  getAllRecords: async (params = {}) => {
    const response = await api.get('/records/all', { params });
    return response.data;
  },

  // Obtener registros por empleado
  getEmployeeRecords: async (employeeId, params = {}) => {
    const response = await api.get(`/records/employee/${employeeId}`, { params });
    return response.data;
  },

  // Estadísticas de horas
  getHoursStats: async (employeeId) => {
    const response = await api.get(`/records/employee/${employeeId}/hours-stats`);
    return response.data;
  },

  // Comparación de horas
  getHoursComparison: async (employeeId) => {
    const response = await api.get(`/records/employee/${employeeId}/hours-comparison`);
    return response.data;
  },
};

// ==================== SCHEDULES ====================
export const scheduleService = {
  // Obtener horario del empleado
  getMySchedule: async () => {
    const response = await api.get('/schedules/my-schedule');
    return response.data;
  },

  // Obtener horario por empleado
  getEmployeeSchedule: async (employeeId) => {
    const response = await api.get(`/schedules/employee/${employeeId}`);
    return response.data;
  },

  // Actualizar horario
  updateSchedule: async (employeeId, scheduleData) => {
    const response = await api.put(`/schedules/employee/${employeeId}`, scheduleData);
    return response.data;
  },
};

// ==================== SCHEDULE TEMPLATES ====================
export const templateService = {
  // Obtener todas las plantillas
  getAll: async () => {
    const response = await api.get('/schedule-templates');
    return response.data;
  },

  // Crear plantilla
  create: async (templateData) => {
    const response = await api.post('/schedule-templates', templateData);
    return response.data;
  },

  // Actualizar plantilla
  update: async (id, templateData) => {
    const response = await api.put(`/schedule-templates/${id}`, templateData);
    return response.data;
  },

  // Eliminar plantilla
  delete: async (id) => {
    const response = await api.delete(`/schedule-templates/${id}`);
    return response.data;
  },

  // Asignar plantilla a empleado
  assignToEmployee: async (templateId, employeeId, startDate) => {
    const response = await api.post(`/schedule-templates/${templateId}/assign`, {
      employeeId,
      startDate,
    });
    return response.data;
  },
};

// ==================== WEEKLY SCHEDULES ====================
export const weeklyScheduleService = {
  // Obtener horarios semanales
  getWeeklySchedules: async (params = {}) => {
    const response = await api.get('/weekly-schedules', { params });
    return response.data;
  },

  // Crear horario semanal
  create: async (scheduleData) => {
    const response = await api.post('/weekly-schedules', scheduleData);
    return response.data;
  },

  // Actualizar horario semanal
  update: async (id, scheduleData) => {
    const response = await api.put(`/weekly-schedules/${id}`, scheduleData);
    return response.data;
  },

  // Copiar horario semanal
  copy: async (sourceWeek, sourceYear, targetWeek, targetYear, employeeIds) => {
    const response = await api.post('/weekly-schedules/copy', {
      sourceWeek,
      sourceYear,
      targetWeek,
      targetYear,
      employeeIds,
    });
    return response.data;
  },
};

// ==================== VACATIONS ====================
export const vacationService = {
  // Obtener vacaciones
  getAll: async (params = {}) => {
    const response = await api.get('/vacations', { params });
    return response.data;
  },

  // Crear solicitud de vacaciones
  create: async (vacationData) => {
    const response = await api.post('/vacations', vacationData);
    return response.data;
  },

  // Actualizar vacaciones
  update: async (id, vacationData) => {
    const response = await api.put(`/vacations/${id}`, vacationData);
    return response.data;
  },

  // Aprobar/rechazar vacaciones
  updateStatus: async (id, status, notes = '') => {
    const response = await api.patch(`/vacations/${id}/status`, { status, notes });
    return response.data;
  },
};

// ==================== AI ====================
export const aiService = {
  // Chat con IA
  chat: async (message, conversationHistory = []) => {
    const response = await api.post('/ai/chat', { message, conversationHistory });
    return response.data;
  },

  // Análisis de patrones de trabajo
  analyzePatterns: async (employeeId = null, days = 30) => {
    const params = { days };
    if (employeeId) params.employeeId = employeeId;
    const response = await api.get('/ai/analyze-patterns', { params });
    return response.data;
  },

  // Resumen de anomalías
  getAnomaliesSummary: async (days = 7) => {
    const response = await api.get('/ai/anomalies-summary', { params: { days } });
    return response.data;
  },

  // Insights de empleado específico
  getEmployeeInsights: async (employeeId, days = 30) => {
    const response = await api.get(`/ai/employee-insights/${employeeId}`, { params: { days } });
    return response.data;
  },

  // Predicción de carga de trabajo
  predictWorkload: async (weeks = 4) => {
    const response = await api.get('/ai/predict-workload', { params: { weeks } });
    return response.data;
  },

  // Alertas inteligentes
  getSmartAlerts: async () => {
    const response = await api.get('/ai/smart-alerts');
    return response.data;
  },

  // Estadísticas de la base de conocimiento
  getKnowledgeStats: async () => {
    const response = await api.get('/ai/knowledge-stats');
    return response.data;
  },

  // Recargar base de conocimiento
  reloadKnowledge: async () => {
    const response = await api.post('/ai/reload-knowledge');
    return response.data;
  },
};

export default api;
