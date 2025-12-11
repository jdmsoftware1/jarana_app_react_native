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
import { Text, Searchbar, Chip, FAB, Modal, Portal, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { documentService, employeeService } from '../../services/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import colors from '../../theme/colors';
import { spacing } from '../../theme/theme';

const DocumentsAdminScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, fromEmployees
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    documentType: 'otro',
    employeeId: null,
    file: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const [docsData, employeesData] = await Promise.all([
        documentService.getAllDocuments(),
        employeeService.getAll(),
      ]);
      setDocuments(docsData);
      setEmployees(employeesData.filter(e => e.isActive));
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters();
  }, [documents, filter, searchQuery]);

  const applyFilters = () => {
    let filtered = [...documents];

    if (filter === 'pending') {
      filtered = filtered.filter(d => d.status === 'pending' && d.direction === 'employee_to_admin');
    } else if (filter === 'fromEmployees') {
      filtered = filtered.filter(d => d.direction === 'employee_to_admin');
    } else if (filter === 'toEmployees') {
      filtered = filtered.filter(d => d.direction === 'admin_to_employee');
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.Employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleDownload = async (doc) => {
    if (doc.fileExists === false) {
      Alert.alert('Error', 'El archivo no está disponible en el servidor');
      return;
    }

    try {
      const url = documentService.getDownloadUrl(doc.id);
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'No se pudo descargar el documento');
    }
  };

  const handleReview = (doc, status) => {
    Alert.alert(
      status === 'approved' ? 'Aprobar Documento' : 'Rechazar Documento',
      `¿Estás seguro de que deseas ${status === 'approved' ? 'aprobar' : 'rechazar'} este documento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await documentService.reviewDocument(doc.id, status);
              Alert.alert('Éxito', `Documento ${status === 'approved' ? 'aprobado' : 'rechazado'}`);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el documento');
            }
          },
        },
      ]
    );
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
    if (!uploadForm.employeeId) {
      Alert.alert('Error', 'Selecciona un empleado');
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
      formData.append('employeeId', uploadForm.employeeId);
      formData.append('file', {
        uri: uploadForm.file.uri,
        type: uploadForm.file.mimeType || 'application/octet-stream',
        name: uploadForm.file.name,
      });

      // Usar endpoint de admin para enviar a empleado
      await documentService.uploadDocument(formData);
      Alert.alert('Éxito', 'Documento enviado correctamente');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', documentType: 'otro', employeeId: null, file: null });
      setSelectedEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo enviar el documento');
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
        : { status: 'info', label: 'Enviado' };
    }
    const statusMap = {
      pending: { status: 'warning', label: 'Pendiente' },
      approved: { status: 'success', label: 'Aprobado' },
      rejected: { status: 'error', label: 'Rechazado' },
    };
    return statusMap[doc.status] || { status: 'default', label: doc.status };
  };

  const pendingCount = documents.filter(d => d.status === 'pending' && d.direction === 'employee_to_admin').length;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar documentos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          theme={{ colors: { primary: colors.brandLight } }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            Todos
          </Chip>
          <Chip
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
            style={styles.chip}
            selectedColor={colors.warning}
          >
            Pendientes {pendingCount > 0 && `(${pendingCount})`}
          </Chip>
          <Chip
            selected={filter === 'fromEmployees'}
            onPress={() => setFilter('fromEmployees')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            De Empleados
          </Chip>
          <Chip
            selected={filter === 'toEmployees'}
            onPress={() => setFilter('toEmployees')}
            style={styles.chip}
            selectedColor={colors.brandLight}
          >
            A Empleados
          </Chip>
        </ScrollView>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
      >
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon="file-document-outline"
            title="No hay documentos"
            message="No se encontraron documentos con los filtros aplicados"
          />
        ) : (
          filteredDocuments.map((doc) => {
            const badge = getStatusBadge(doc);
            const isFromEmployee = doc.direction === 'employee_to_admin';
            const isPending = doc.status === 'pending' && isFromEmployee;

            return (
              <Card key={doc.id} style={[styles.documentCard, isPending && styles.pendingCard]}>
                <TouchableOpacity onPress={() => handleDownload(doc)} disabled={doc.fileExists === false}>
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
                        {isFromEmployee ? 'De: ' : 'Para: '}{doc.Employee?.name || 'N/A'}
                      </Text>
                      <Text style={styles.documentMeta}>
                        {getDocumentTypeLabel(doc.documentType)} • {new Date(doc.createdAt || doc.created_at).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                    <StatusBadge status={badge.status} label={badge.label} />
                  </View>

                  {doc.fileExists === false && (
                    <View style={styles.unavailableWarning}>
                      <Icon name="alert-circle" size={16} color={colors.error} />
                      <Text style={styles.unavailableText}>Archivo no disponible</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Review Actions for pending documents from employees */}
                {isPending && (
                  <View style={styles.reviewActions}>
                    <Button
                      mode="contained"
                      onPress={() => handleReview(doc, 'approved')}
                      style={[styles.reviewButton, { backgroundColor: colors.success }]}
                      icon="check"
                      compact
                    >
                      Aprobar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleReview(doc, 'rejected')}
                      style={[styles.reviewButton, { backgroundColor: colors.error }]}
                      icon="close"
                      compact
                    >
                      Rechazar
                    </Button>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* FAB for sending document to employee */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowUploadModal(true)}
        color={colors.white}
        label="Enviar"
      />

      {/* Upload Modal */}
      <Portal>
        <Modal
          visible={showUploadModal}
          onDismiss={() => setShowUploadModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Enviar Documento a Empleado</Text>
            
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

            {/* Employee Selector */}
            <Text style={styles.inputLabel}>Empleado *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeSelector}>
              {employees.map((emp) => (
                <Chip
                  key={emp.id}
                  selected={uploadForm.employeeId === emp.id}
                  onPress={() => {
                    setUploadForm(prev => ({ ...prev, employeeId: emp.id }));
                    setSelectedEmployee(emp);
                  }}
                  style={styles.employeeChip}
                  selectedColor={colors.brandLight}
                >
                  {emp.name}
                </Chip>
              ))}
            </ScrollView>

            {/* Document Type */}
            <Text style={styles.inputLabel}>Tipo de Documento</Text>
            <View style={styles.typeSelector}>
              {['nomina', 'contrato', 'justificante', 'otro'].map((type) => (
                <Chip
                  key={type}
                  selected={uploadForm.documentType === type}
                  onPress={() => setUploadForm(prev => ({ ...prev, documentType: type }))}
                  style={styles.typeChip}
                  selectedColor={colors.brandLight}
                >
                  {getDocumentTypeLabel(type)}
                </Chip>
              ))}
            </View>

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
                Enviar
              </Button>
            </View>
          </ScrollView>
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
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    marginBottom: spacing.sm,
    elevation: 0,
  },
  chips: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  documentCard: {
    marginBottom: spacing.md,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
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
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reviewButton: {
    minWidth: 100,
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
    maxHeight: '80%',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  employeeSelector: {
    marginBottom: spacing.md,
  },
  employeeChip: {
    marginRight: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  typeChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
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

export default DocumentsAdminScreen;
