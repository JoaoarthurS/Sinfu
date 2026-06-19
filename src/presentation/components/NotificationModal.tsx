/**
 * Modal para Criar/Editar Notificação
 * Componente reutilizável que segue o princípio SRP
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Notification, CreateNotificationDTO } from '../../domain/entities/Notification';
import { Group } from '../../domain/entities/Group';
import { CustomButton } from './CustomButton';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import Icon from '../../core/components/Icon';

interface NotificationModalProps {
  visible: boolean;
  notification?: Notification;
  onClose: () => void;
  onSave: (data: CreateNotificationDTO) => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notification,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ title: '', message: '' });
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupSelection, setShowGroupSelection] = useState(false);
  const [link, setLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      loadGroups();
      if (notification) {
        setTitle(notification.title);
        setMessage(notification.message);
        setLink(notification.link || '');
        setCurrentImageUrl(notification.imageUrl);
      } else {
        resetForm();
      }
    }
  }, [notification, visible]);

  const loadGroups = async () => {
    try {
      const groupsData = await container.getAllGroupsUseCase.execute();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setLink('');
    setSelectedImage(null);
    setCurrentImageUrl(undefined);
    setErrors({ title: '', message: '' });
    setSelectedGroups([]);
    setShowGroupSelection(false);
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
          setCurrentImageUrl(undefined); // Remove a URL da imagem atual
        }
      }
    );
  };

  const removeImage = () => {
    setSelectedImage(null);
    setCurrentImageUrl(undefined);
  };

  const removeLink = () => {
    setLink('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const notificationData: CreateNotificationDTO = {
        title: title.trim(),
        message: message.trim(),
        // Sempre enviar o link (mesmo vazio) para que o backend consiga
        // detectar a remoção/alteração ao editar uma notificação existente.
        link: link.trim(),
      };

      if (selectedGroups.length > 0) {
        notificationData.groupIds = selectedGroups;
      }

      if (selectedImage) {
        notificationData.image = selectedImage;
      }

      await onSave(notificationData);
      resetForm();
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getGroupSelectionText = () => {
    if (selectedGroups.length === 0) {
      return 'Todos os usuários';
    }
    if (selectedGroups.length === 1) {
      const group = groups.find((g) => g.id === selectedGroups[0]);
      return group ? group.name : '1 grupo selecionado';
    }
    return `${selectedGroups.length} grupos selecionados`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {notification ? 'Editar Notificação' : 'Nova Notificação'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                numberOfLines={4}
                maxLength={500}
              />
              {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
              <Text style={styles.charCount}>{message.length}/500</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Link (Opcional)</Text>
              <View style={styles.linkInputRow}>
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  value={link}
                  onChangeText={setLink}
                  placeholder="https://example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
                {link.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.removeLinkButton}
                    onPress={removeLink}
                    accessibilityLabel="Remover link"
                  >
                    <Text style={styles.removeLinkText}>✕ Remover</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.helperText}>URL que será aberta ao clicar na notificação</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem (Opcional)</Text>
              
              {!selectedImage && !currentImageUrl ? (
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
                    source={{ uri: selectedImage ? selectedImage.uri : currentImageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>✕ Remover</Text>
                  </TouchableOpacity>
                  {!selectedImage && currentImageUrl && (
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={selectImage}
                    >
                      <Text style={styles.changeImageText}>📷 Trocar Imagem</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text style={styles.helperText}>A imagem será enviada para o servidor</Text>
            </View>

            {/* Destinatários - Apenas visível ao criar nova notificação */}
            {!notification && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Destinatários</Text>
                <TouchableOpacity
                  style={styles.groupSelector}
                  onPress={() => setShowGroupSelection(!showGroupSelection)}
                >
                  <Text style={styles.groupSelectorText}>
                    {getGroupSelectionText()}
                  </Text>
                  <Text style={styles.groupSelectorIcon}>
                    {showGroupSelection ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showGroupSelection && (
                  <View style={styles.groupList}>
                    <TouchableOpacity
                      style={styles.groupItem}
                      onPress={() => setSelectedGroups([])}
                    >
                      <View style={styles.checkbox}>
                        {selectedGroups.length === 0 && <View style={styles.checkboxChecked} />}
                      </View>
                      <Text style={styles.groupItemText}>Todos os usuários</Text>
                    </TouchableOpacity>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.groupItem}
                        onPress={() => toggleGroupSelection(group.id)}
                      >
                        <View style={styles.checkbox}>
                          {selectedGroups.includes(group.id) && (
                            <View style={styles.checkboxChecked} />
                          )}
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.groupItemText}>{group.name}</Text>
                          {group.description && (
                            <Text style={styles.groupItemDescription}>
                              {group.description}
                            </Text>
                          )}
                          <Text style={styles.groupItemUsers}>
                            {group.users?.length || 0} usuário(s)
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton
              title="Cancelar"
              variant="secondary"
              onPress={handleClose}
              noShadow
              style={styles.footerButton}
              disabled={loading}
            />
            <CustomButton
              title={notification ? 'Atualizar' : 'Criar'}
              variant="primary"
              onPress={handleSave}
              loading={loading}
              noShadow
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
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
    minHeight: 100,
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
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  linkInput: {
    flex: 1,
  },
  removeLinkButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLinkText: {
    ...theme.typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
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
  changeImageButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  changeImageText: {
    ...theme.typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  groupSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  groupSelectorText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  groupSelectorIcon: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  groupList: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 250,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
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
  groupItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  groupItemDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  groupItemUsers: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
