import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from 'react-native-paper';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';
import { aiService } from '../../services/apiService';

const AIInsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const insights = [
    {
      id: 1,
      title: 'Análisis de Asistencia',
      description: summary ? `${summary.totalAnomalies} anomalías detectadas` : 'Cargando...',
      icon: 'chart-line',
      color: colors.success,
      value: summary?.totalAnomalies || 0,
    },
    {
      id: 2,
      title: 'Horas Extras',
      description: summary ? `${summary.byType?.overtime || 0} casos de horas extras` : 'Cargando...',
      icon: 'clock-alert',
      color: colors.warning,
      value: summary?.byType?.overtime || 0,
    },
    {
      id: 3,
      title: 'Ausencias',
      description: summary ? `${summary.byType?.missing_checkout || 0} registros faltantes` : 'Cargando...',
      icon: 'account-off',
      color: colors.error,
      value: summary?.byType?.missing_checkout || 0,
    },
    {
      id: 4,
      title: 'Productividad',
      description: summary ? `${summary.highSeverity} alertas de alta prioridad` : 'Cargando...',
      icon: 'trending-up',
      color: colors.brandLight,
      value: summary?.highSeverity || 0,
    },
  ];

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener resumen de anomalías y alertas inteligentes
      const [summaryData, alertsData] = await Promise.all([
        aiService.getAnomaliesSummary(7),
        aiService.getSmartAlerts(),
      ]);
      
      setSummary(summaryData);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Error al cargar los insights. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandLight} />
        <Text style={styles.loadingText}>Analizando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Icon name="lightbulb-on" size={48} color={colors.brandLight} />
        <Text style={styles.headerTitle}>Insights con IA</Text>
        <Text style={styles.headerSubtitle}>
          Análisis inteligente de los últimos 7 días
        </Text>
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Icon name="alert-circle" size={24} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      )}

      <View style={styles.content}>
        {/* Insights Cards */}
        {insights.map((insight) => (
          <TouchableOpacity key={insight.id} activeOpacity={0.7}>
            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${insight.color}20` }]}>
                  <Icon name={insight.icon} size={32} color={insight.color} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={[styles.valueText, { color: insight.color }]}>
                    {insight.value}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Alertas Inteligentes */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alertas Inteligentes</Text>
            {alerts.map((alert, index) => (
              <Card key={index} style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <Icon 
                    name={alert.type === 'critical' ? 'alert' : alert.type === 'positive' ? 'check-circle' : 'information'} 
                    size={24} 
                    color={alert.priority === 'high' ? colors.error : alert.priority === 'medium' ? colors.warning : colors.success} 
                  />
                  <View style={styles.alertText}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Recomendaciones */}
        {summary?.recommendations && summary.recommendations.length > 0 && (
          <Card style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>Recomendaciones</Text>
            {summary.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="lightbulb-outline" size={16} color={colors.brandLight} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Icon name="information" size={24} color={colors.brandLight} />
            <Text style={styles.infoText}>
              Los insights se generan automáticamente usando IA basándose en los datos de tu sistema.
              Actualiza regularmente para obtener análisis más precisos.
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  errorCard: {
    margin: spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: 12,
  },
  errorContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.error,
  },
  content: {
    padding: spacing.md,
  },
  insightCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  valueContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  alertsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  alertCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 1,
  },
  alertContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recommendationsCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  infoCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandCream,
    borderRadius: 12,
  },
  infoContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default AIInsightsScreen;
