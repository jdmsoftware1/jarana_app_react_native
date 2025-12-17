import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Inicializar el servicio de notificaciones
   * Debe llamarse después del login
   */
  async initialize() {
    try {
      // Verificar si es un dispositivo físico
      if (!Device.isDevice) {
        console.log('⚠️ Notificaciones push solo funcionan en dispositivos físicos');
        return null;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permiso de notificaciones denegado');
        return null;
      }

      // Obtener token de Expo Push
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '1a1c4754-cb66-417b-970f-59ac0531b54a', // Tu projectId de EAS
      });
      
      this.expoPushToken = tokenData.data;
      console.log('📱 Expo Push Token:', this.expoPushToken);

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1B3A4B',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
      return null;
    }
  }

  /**
   * Registrar token en el backend
   */
  async registerTokenWithBackend() {
    try {
      if (!this.expoPushToken) {
        await this.initialize();
      }

      if (!this.expoPushToken) {
        console.log('⚠️ No hay token para registrar');
        return false;
      }

      const response = await api.post('/notifications/register-token', {
        token: this.expoPushToken,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      });

      console.log('✅ Token registrado en backend:', response.data);
      
      // Guardar token localmente
      await AsyncStorage.setItem('pushToken', this.expoPushToken);
      
      return true;
    } catch (error) {
      console.error('Error registrando token:', error);
      return false;
    }
  }

  /**
   * Desregistrar token (llamar en logout)
   */
  async unregisterToken() {
    try {
      const token = await AsyncStorage.getItem('pushToken');
      
      if (token) {
        await api.post('/notifications/unregister-token', { token });
        await AsyncStorage.removeItem('pushToken');
        console.log('✅ Token desregistrado');
      }
      
      this.expoPushToken = null;
    } catch (error) {
      console.error('Error desregistrando token:', error);
    }
  }

  /**
   * Configurar listeners para notificaciones
   */
  setupListeners(onNotificationReceived, onNotificationResponse) {
    // Listener para notificaciones recibidas (app en primer plano)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notificación recibida:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener para cuando el usuario toca la notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Usuario tocó notificación:', response);
        const data = response.notification.request.content.data;
        
        if (onNotificationResponse) {
          onNotificationResponse(data);
        }
      }
    );
  }

  /**
   * Remover listeners (llamar en cleanup)
   */
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Obtener notificaciones del backend
   */
  async getNotifications(limit = 50, offset = 0) {
    try {
      const response = await api.get('/notifications', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Obtener conteo de no leídas
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error obteniendo conteo:', error);
      return 0;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marcando como leída:', error);
      return false;
    }
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      return false;
    }
  }

  /**
   * Programar notificación local (para recordatorios)
   */
  async scheduleLocalNotification(title, body, triggerSeconds = 5) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        seconds: triggerSeconds,
      },
    });
  }
}

export default new NotificationService();
