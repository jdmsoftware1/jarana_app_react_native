import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Text, FAB, Modal, Portal, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { documentService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const DocumentsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [sentDocuments, setSentDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    documentType: 'otro',
    file: null,
  });

  const fetchDocuments = useCallback(async () => {
    try {
      const [received, sent] = await Promise.all([
        documentService.getMyDocuments(),
        documentService.getMySentDocuments(),
      ]);
      setReceivedDocuments(received);
      setSentDocuments(sent);
    } catch (error) {
      console.error('Error fetching documents:', error);
      Alert.alert('Error', 'No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handleDownload = async (doc) => {
    if (doc.fileExists === false) {
      Alert.alert('Error', 'El archivo no está disponible en el servidor');
      return;
    }

    try {
      // Marcar como leído si no lo está
      if (!doc.readAt) {
        await documentService.markAsRead(doc.id);
        fetchDocuments();
      }

      // Abrir URL de descarga
      const url = documentService.getDownloadUrl(doc.id);
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'No se pudo descargar el documento');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || result.assets?.[0]) {
        const file = result.assets?.[0] || result;
        setUploadForm(prev => ({ ...prev, file }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    if (!uploadForm.file) {
      Alert.alert('Error', 'Selecciona un archivo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('documentType', uploadForm.documentType);
      formData.append('file', {
        uri: uploadForm.file.uri,
        type: uploadForm.file.mimeType || 'application/octet-stream',
        name: uploadForm.file.name,
      });

      await documentService.uploadDocument(formData);
      Alert.alert('Éxito', 'Documento subido correctamente');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', documentType: 'otro', file: null });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      nomina: 'Nómina',
      contrato: 'Contrato',
      justificante: 'Justificante',
      otro: 'Otro',
    };
    return types[type] || type;
  };

  const getStatusBadge = (doc) => {
    if (doc.direction === 'admin_to_employee') {
      return doc.readAt 
        ? { status: 'success', label: 'Leído' }
        : { status: 'warning', label: 'Nuevo' };
    }
    const statusMap = {
      pending: { status: 'warning', label: 'Pendiente' },
      approved: { status: 'success', label: 'Aprobado' },
      rejected: { status: 'error', label: 'Rechazado' },
    };
    return statusMap[doc.status] || { status: 'default', label: doc.status };
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const documents = activeTab === 'received' ? receivedDocuments : sentDocuments;
  const unreadCount = receivedDocuments.filter(d => !d.readAt).length;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Icon name="download" size={20} color={activeTab === 'received' ? colors.brandLight : colors.gray[500]} />
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Recibidos
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Icon name="upload" size={20} color={activeTab === 'sent' ? colors.brandLight : colors.gray[500]} />
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Enviados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>
              {activeTab === 'received' 
                ? 'No has recibido documentos' 
                : 'No has enviado documentos'}
            </Text>
          </View>
        ) : (
          documents.map((doc) => {
            const badge = getStatusBadge(doc);
            return (
              <TouchableOpacity
                key={doc.id}
                onPress={() => handleDownload(doc)}
                disabled={doc.fileExists === false}
              >
                <Card style={[styles.documentCard, !doc.readAt && activeTab === 'received' && styles.unreadCard]}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentIcon}>
                      <Icon 
                        name={doc.mimeType?.includes('pdf') ? 'file-pdf-box' : 'file-document'} 
                        size={32} 
                        color={doc.fileExists === false ? colors.gray[400] : colors.brandLight} 
                      />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>{doc.title}</Text>
                      <Text style={styles.documentMeta}>
                        {getDocumentTypeLabel(doc.documentType)} • {new Date(doc.createdAt || doc.created_at).toLocaleDateString('es-ES')}
                      </Text>
                      {doc.description && (
                        <Text style={styles.documentDescription} numberOfLines={2}>
                          {doc.description}
                        </Text>
                      )}
                    </View>
                    <StatusBadge status={badge.status} label={badge.label} />
                  </View>
                  {doc.fileExists === false && (
                    <View style={styles.unavailableWarning}>
                      <Icon name="alert-circle" size={16} color={colors.error} />
                      <Text style={styles.unavailableText}>Archivo no disponible</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* FAB for upload */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowUploadModal(true)}
        color={colors.white}
      />

      {/* Upload Modal */}
      <Portal>
        <Modal
          visible={showUploadModal}
          onDismiss={() => setShowUploadModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Subir Documento</Text>
          
          <TextInput
            label="Título *"
            value={uploadForm.title}
            onChangeText={(text) => setUploadForm(prev => ({ ...prev, title: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Descripción"
            value={uploadForm.description}
            onChangeText={(text) => setUploadForm(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.filePicker} onPress={handlePickDocument}>
            <Icon name="file-upload" size={24} color={colors.brandLight} />
            <Text style={styles.filePickerText}>
              {uploadForm.file ? uploadForm.file.name : 'Seleccionar archivo'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowUploadModal(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleUpload}
              loading={uploading}
              disabled={uploading}
              style={styles.modalButton}
              buttonColor={colors.brandLight}
            >
              Subir
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brandLight,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.brandLight,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray[500],
  },
  documentCard: {
    marginBottom: spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brandLight,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentIcon: {
    marginRight: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  documentDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  unavailableWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
  },
  unavailableText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: colors.error,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.brandLight,
  },
  modal: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  filePickerText: {
    marginLeft: spacing.md,
    color: colors.text.secondary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default DocumentsScreen;
