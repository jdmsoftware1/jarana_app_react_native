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
  // Obtener horario del empleado (semana actual)
  getMySchedule: async () => {
    // Obtener el usuario guardado para obtener el employeeId
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) throw new Error('No user found');
    
    const user = JSON.parse(userStr);
    const employeeId = user.id;
    
    // Calcular semana ISO y año actual (ISO 8601 - semana empieza en lunes)
    const now = new Date();
    const year = now.getFullYear();
    
    // Calcular número de semana ISO
    const tempDate = new Date(now.getTime());
    tempDate.setHours(0, 0, 0, 0);
    // Jueves de la semana actual determina el año de la semana
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    // Semana 1 es la semana con el primer jueves de enero
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    
    console.log(`📅 Fetching schedule for employee ${employeeId}, year ${year}, week ${weekNumber}`);
    
    // Obtener horario de la semana actual
    const response = await api.get(`/weekly-schedules/employee/${employeeId}/week/${year}/${weekNumber}`);
    
    console.log('📅 Schedule response:', JSON.stringify(response.data, null, 2));
    
    // El backend devuelve { data: { weeklySchedule, dailyExceptions, weekDates } }
    const responseData = response.data?.data || response.data;
    const weeklySchedule = responseData?.weeklySchedule || responseData;
    
    // Transformar la respuesta al formato esperado por MyScheduleScreen
    if (weeklySchedule && weeklySchedule.template && weeklySchedule.template.templateDays) {
      return {
        templateName: weeklySchedule.template.name,
        weekNumber: weeklySchedule.weekNumber,
        year: weeklySchedule.year,
        scheduleDays: weeklySchedule.template.templateDays.map(day => ({
          id: day.id,
          dayOfWeek: day.dayOfWeek || day.day_of_week,
          isWorkingDay: day.isWorkingDay ?? day.is_working_day ?? true,
          isSplitSchedule: day.isSplitSchedule ?? day.is_split_schedule ?? false,
          startTime: day.startTime || day.start_time,
          endTime: day.endTime || day.end_time,
          morningStart: day.morningStart || day.morning_start,
          morningEnd: day.morningEnd || day.morning_end,
          afternoonStart: day.afternoonStart || day.afternoon_start,
          afternoonEnd: day.afternoonEnd || day.afternoon_end,
          breaks: day.breaks || [],
          notes: day.notes,
        })),
      };
    }
    
    console.log('⚠️ No schedule found or invalid format');
    return null;
  },

  // Obtener horario por empleado
  getEmployeeSchedule: async (employeeId) => {
    const response = await api.get(`/weekly-schedules/employee/${employeeId}`);
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

  // Obtener horario semanal por empleado y semana
  getByEmployeeWeek: async (employeeId, year, weekNumber) => {
    const response = await api.get(`/weekly-schedules/employee/${employeeId}/week/${year}/${weekNumber}`);
    return response.data;
  },

  // Obtener todos los horarios de un empleado por año
  getByEmployeeYear: async (employeeId, year) => {
    const response = await api.get(`/weekly-schedules/employee/${employeeId}/year/${year}`);
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

  // Obtener vacaciones por empleado
  getByEmployee: async (employeeId, params = {}) => {
    const response = await api.get(`/vacations/employee/${employeeId}`, { params });
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
    const response = await api.put(`/vacations/${id}/status`, { status, notes });
    return response.data;
  },

  // Eliminar solicitud
  delete: async (id) => {
    const response = await api.delete(`/vacations/${id}`);
    return response.data;
  },
};

// ==================== ABSENCE CATEGORIES ====================
export const absenceCategoryService = {
  // Obtener categorías activas
  getActive: async () => {
    const response = await api.get('/absence-categories/active');
    return response.data;
  },

  // Obtener todas las categorías
  getAll: async () => {
    const response = await api.get('/absence-categories');
    return response.data;
  },
};

// ==================== DOCUMENTS ====================
export const documentService = {
  // Obtener documentos recibidos (empleado)
  getMyDocuments: async () => {
    const response = await api.get('/documents/admin-to-employee/my-documents');
    return response.data;
  },

  // Obtener documentos enviados por mí (empleado)
  getMySentDocuments: async () => {
    const response = await api.get('/documents/employee-to-admin/my-documents');
    return response.data;
  },

  // Subir documento (empleado a admin)
  uploadDocument: async (formData) => {
    const response = await api.post('/documents/employee-to-admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Marcar como leído
  markAsRead: async (documentId) => {
    const response = await api.post(`/documents/${documentId}/mark-read`);
    return response.data;
  },

  // Descargar documento (retorna URL)
  getDownloadUrl: (documentId) => {
    return `${getApiUrl()}/documents/${documentId}/download`;
  },

  // Admin: obtener todos los documentos
  getAllDocuments: async (params = {}) => {
    const response = await api.get('/documents/all', { params });
    return response.data;
  },

  // Admin: obtener documentos pendientes
  getPendingDocuments: async () => {
    const response = await api.get('/documents/pending-from-employees');
    return response.data;
  },

  // Admin: revisar documento
  reviewDocument: async (documentId, status, notes = '') => {
    const response = await api.patch(`/documents/${documentId}/review`, { status, notes });
    return response.data;
  },
};

// ==================== EXPORT (CSV) ====================
export const exportService = {
  // Exportar auditoría
  getAuditExportUrl: (startDate, endDate, employeeId = null) => {
    let url = `${getApiUrl()}/records/export/audit?startDate=${startDate}&endDate=${endDate}`;
    if (employeeId) url += `&employeeId=${employeeId}`;
    return url;
  },

  // Exportar resumen mensual
  getSummaryExportUrl: (month, year) => {
    return `${getApiUrl()}/records/export/summary?month=${month}&year=${year}`;
  },

  // Exportar vacaciones
  getVacationsExportUrl: (year, status = null) => {
    let url = `${getApiUrl()}/records/export/vacations?year=${year}`;
    if (status) url += `&status=${status}`;
    return url;
  },

  // Descargar con autenticación
  downloadWithAuth: async (url) => {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
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
