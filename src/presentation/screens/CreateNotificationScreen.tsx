/**
 * Tela de Criação de Notificação
 * Permite criar notificações push personalizadas para usuários e grupos
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { CreateNotificationScreenProps } from '../../navigation/types';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import { CreateNotificationDTO } from '../../domain/entities/Notification';
import { Group } from '../../domain/entities/Group';
import Icon from '../../core/components/Icon';

const CreateNotificationScreen: React.FC<CreateNotificationScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [errors, setErrors] = useState({ title: '', message: '' });
  const [link, setLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      setGroupsError(null);
      const groupsData = await container.getAllGroupsUseCase.execute();
      setGroups(groupsData);
    } catch (error: any) {
      console.error('Error loading groups:', error);
      setGroupsError(error?.message || 'Não foi possível carregar os grupos');
    } finally {
      setLoadingGroups(false);
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { title: '', message: '' };

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
      valid = false;
    } else if (title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
      valid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
      valid = false;
    } else if (message.length > 500) {
      newErrors.message = 'Mensagem deve ter no máximo 500 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Erro', 'Não foi possível selecionar a imagem');
          return;
        }
        if (response.assets && response.assets[0]) {
          setSelectedImage(response.assets[0]);
        }
      }
    );
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const notificationData: CreateNotificationDTO = {
        title: title.trim(),
        message: message.trim(),
      };

      if (selectedGroups.length > 0) {
        notificationData.groupIds = selectedGroups;
      }

      if (link.trim()) {
        notificationData.link = link.trim();
      }

      if (selectedImage) {
        notificationData.image = selectedImage;
      }

      await container.createNotificationUseCase.execute(notificationData);
      
      Alert.alert(
        'Sucesso',
        'Notificação criada e enviada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar a notificação');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getRecipientsSummary = () => {
    if (selectedGroups.length === 0) {
      return 'Todos os usuários';
    }
    const totalUsers = selectedGroups.reduce((sum, groupId) => {
      const group = groups.find((g) => g.id === groupId);
      return sum + (group?.users?.length || 0);
    }, 0);
    return `${selectedGroups.length} grupo(s) • ${totalUsers} usuário(s)`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon family="FontAwesome" name="arrow-left" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Notificação</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Conteúdo</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Digite o título da notificação"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mensagem *</Text>
              <TextInput
                style={[styles.textArea, errors.message && styles.inputError]}
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                placeholder="Digite a mensagem da notificação"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={5}
                maxLength={500}
              />
              {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
              <Text style={styles.charCount}>{message.length}/500</Text>
            </View>
          </Card>

          <Card style={styles.card}> 
            <View style={styles.formGroup}>
              <Text style={styles.label}>Link</Text>
              <TextInput
                style={styles.input}
                value={link}
                onChangeText={setLink}
                placeholder="https://example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>URL que será aberta ao clicar na notificação</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem (Opcional)</Text>
              
              {!selectedImage ? (
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={selectImage}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon family="FontAwesome" name="camera" size={18} color="#fff" />
                    <Text style={styles.imageButtonText}>Selecionar Imagem da Galeria</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>✕ Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.helperText}>A imagem será enviada para o servidor</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>👥 Destinatários</Text>
            <Text style={styles.sectionDescription}>
              Selecione os grupos que receberão a notificação ou deixe vazio para enviar a todos
            </Text>

            <TouchableOpacity
              style={[
                styles.selectAllButton,
                selectedGroups.length === 0 && styles.selectAllButtonActive,
              ]}
              onPress={() => setSelectedGroups([])}
            >
              <View style={styles.checkbox}>
                {selectedGroups.length === 0 && <View style={styles.checkboxChecked} />}
              </View>
              <Text style={styles.selectAllText}>Todos os usuários</Text>
            </TouchableOpacity>

            <View style={styles.groupsList}>
              {loadingGroups ? (
                <View style={styles.groupsStatusContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.groupsStatusText}>Carregando grupos...</Text>
                </View>
              ) : groupsError ? (
                <View style={styles.groupsStatusContainer}>
                  <Text style={styles.groupsErrorText}>{groupsError}</Text>
                  <TouchableOpacity onPress={loadGroups} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : groups.length === 0 ? (
                <View style={styles.groupsStatusContainer}>
                  <Text style={styles.groupsStatusText}>Nenhum grupo cadastrado</Text>
                </View>
              ) : (
                groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupItem,
                      selectedGroups.includes(group.id) && styles.groupItemSelected,
                    ]}
                    onPress={() => toggleGroupSelection(group.id)}
                  >
                    <View style={styles.checkbox}>
                      {selectedGroups.includes(group.id) && (
                        <View style={styles.checkboxChecked} />
                      )}
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      {group.description && (
                        <Text style={styles.groupDescription}>{group.description}</Text>
                      )}
                      <Text style={styles.groupUsers}>
                        {group.users?.length || 0} usuário(s)
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Cancelar"
            variant="secondary"
            onPress={() => navigation.goBack()}
            noShadow
            style={styles.footerButton}
            disabled={loading}
          />
          <CustomButton
            title="Enviar Notificação"
            variant="primary"
            onPress={handleCreate}
            loading={loading}
            noShadow
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'left',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary + '10',
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  textArea: {
    ...theme.typography.body,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  imageButtonText: {
    ...theme.typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  orText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  imagePreviewContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  removeImageButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  removeImageText: {
    ...theme.typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectAllButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  selectAllText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  groupsList: {
    gap: theme.spacing.sm,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  groupsStatusContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  groupsStatusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  groupsErrorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  groupDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  groupUsers: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});

export default CreateNotificationScreen;
