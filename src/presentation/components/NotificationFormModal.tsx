/**
 * Modal de Criar/Editar Notificação
 * - Criar: permite escolher o alvo (Todos os usuários / Por grupo / Por usuário)
 *   espelhando o comportamento do painel web.
 * - Editar: altera apenas conteúdo (título, mensagem, link, imagem); o alvo é
 *   definido na criação.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { theme } from '../../config/theme';
import { CustomButton } from './CustomButton';
import Icon from '../../core/components/Icon';
import { Notification, CreateNotificationDTO } from '../../domain/entities/Notification';
import { Group } from '../../domain/entities/Group';

export type NotificationTarget = 'all' | 'group' | 'user';

export interface PickableUser {
  id: string;
  name: string;
  email: string;
}

interface NotificationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNotificationDTO) => Promise<void>;
  notification?: Notification; // presente = modo edição
  groups: Group[];
  users: PickableUser[];
}

const TARGET_OPTIONS: { value: NotificationTarget; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'group', label: 'Por grupo' },
  { value: 'user', label: 'Por usuário' },
];

export const NotificationFormModal: React.FC<NotificationFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  notification,
  groups,
  users,
}) => {
  const isEditing = !!notification;

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [target, setTarget] = useState<NotificationTarget>('all');
  const [groupId, setGroupId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(notification?.title ?? '');
      setMessage(notification?.message ?? '');
      setLink(notification?.link ?? '');
      setSelectedImage(null);
      setRemoveImage(false);
      setTarget('all');
      setGroupId('');
      setUserId('');
      setErrors({});
      setSubmitting(false);
    }
  }, [visible, notification]);

  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', maxWidth: 1024, maxHeight: 1024, quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        if (response.assets && response.assets[0]) {
          setSelectedImage(response.assets[0]);
        }
      },
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Título é obrigatório';
    else if (title.length > 100) errs.title = 'Máximo de 100 caracteres';
    if (!message.trim()) errs.message = 'Mensagem é obrigatória';
    else if (message.length > 500) errs.message = 'Máximo de 500 caracteres';
    if (!isEditing && target === 'group' && !groupId) errs.target = 'Selecione um grupo';
    if (!isEditing && target === 'user' && !userId) errs.target = 'Selecione um usuário';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: CreateNotificationDTO = {
      title: title.trim(),
      message: message.trim(),
      // Sempre envia o link: string vazia remove o link existente.
      link: link.trim(),
    };
    if (selectedImage) {
      data.image = selectedImage;
    } else if (removeImage) {
      // Edição: remover a imagem já vinculada (sem enviar uma nova).
      data.removeImage = true;
    }

    if (!isEditing) {
      if (target === 'group') data.groupIds = [groupId];
      if (target === 'user') data.targetUserId = userId;
    }

    try {
      setSubmitting(true);
      await onSubmit(data);
      onClose();
    } catch {
      // Erro tratado pela tela (Alert); apenas mantém o modal aberto.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Notificação' : 'Nova Notificação'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon family="FontAwesome" name="times" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Seletor de alvo (apenas na criação) */}
            {!isEditing && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Enviar para</Text>
                <View style={styles.segment}>
                  {TARGET_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.segmentItem, target === opt.value && styles.segmentItemActive]}
                      onPress={() => {
                        setTarget(opt.value);
                        setErrors((e) => ({ ...e, target: '' }));
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          target === opt.value && styles.segmentTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {target === 'group' && (
                  <View style={styles.pickerList}>
                    {groups.length === 0 ? (
                      <Text style={styles.pickerEmpty}>Nenhum grupo cadastrado</Text>
                    ) : (
                      groups.map((g) => (
                        <TouchableOpacity
                          key={g.id}
                          style={[styles.pickerItem, groupId === g.id && styles.pickerItemActive]}
                          onPress={() => setGroupId(g.id)}
                        >
                          <View style={styles.radio}>
                            {groupId === g.id && <View style={styles.radioDot} />}
                          </View>
                          <Text style={styles.pickerItemText}>{g.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {target === 'user' && (
                  <View style={styles.pickerList}>
                    {users.length === 0 ? (
                      <Text style={styles.pickerEmpty}>Nenhum usuário encontrado</Text>
                    ) : (
                      users.map((u) => (
                        <TouchableOpacity
                          key={u.id}
                          style={[styles.pickerItem, userId === u.id && styles.pickerItemActive]}
                          onPress={() => setUserId(u.id)}
                        >
                          <View style={styles.radio}>
                            {userId === u.id && <View style={styles.radioDot} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pickerItemText}>{u.name}</Text>
                            <Text style={styles.pickerItemSubtext}>{u.email}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {!!errors.target && <Text style={styles.errorText}>{errors.target}</Text>}
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors((e) => ({ ...e, title: '' }));
                }}
                placeholder="Título da notificação"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
              {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mensagem *</Text>
              <TextInput
                style={[styles.textArea, errors.message && styles.inputError]}
                value={message}
                onChangeText={(t) => {
                  setMessage(t);
                  if (errors.message) setErrors((e) => ({ ...e, message: '' }));
                }}
                placeholder="Corpo da notificação"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              {!!errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Link (opcional)</Text>
                {link.length > 0 && (
                  <TouchableOpacity onPress={() => setLink('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearLink}>Remover link</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                value={link}
                onChangeText={setLink}
                placeholder="https://..."
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem (opcional)</Text>
              {selectedImage ? (
                // Nova imagem selecionada
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                    <Text style={styles.removeImageText}>✕ Remover</Text>
                  </TouchableOpacity>
                </View>
              ) : isEditing && notification?.imageUrl && !removeImage ? (
                // Imagem já vinculada à notificação (pode ser removida)
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: notification.imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setRemoveImage(true)}>
                    <Text style={styles.removeImageText}>✕ Remover imagem</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
                  <Icon family="FontAwesome" name="image" size={16} color="#fff" />
                  <Text style={styles.imageButtonText}>
                    {isEditing && notification?.imageUrl && removeImage
                      ? 'Selecionar nova imagem'
                      : 'Selecionar imagem'}
                  </Text>
                </TouchableOpacity>
              )}
              {isEditing && removeImage && !selectedImage && (
                <Text style={styles.helperText}>A imagem será removida ao salvar.</Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              noShadow
              style={styles.footerButton}
              disabled={submitting}
            />
            <CustomButton
              title={isEditing ? 'Salvar' : 'Criar'}
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
              noShadow
              style={styles.footerButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: theme.spacing.lg,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  pickerList: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  pickerItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  pickerItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  pickerItemSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  pickerEmpty: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
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
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
    height: 180,
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
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerButton: {
    flex: 1,
  },
});

export default NotificationFormModal;
