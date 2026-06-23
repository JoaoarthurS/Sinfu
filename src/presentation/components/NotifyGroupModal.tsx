/**
 * Modal para notificar grupos
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { theme } from '../../config/theme';
import { CustomButton } from './CustomButton';
import Icon from '../../core/components/Icon';
import { Group } from '../../domain/entities/Group';

interface NotifyGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string, link?: string, image?: any) => void;
  group?: Group;
}

export const NotifyGroupModal: React.FC<NotifyGroupModalProps> = ({
  visible,
  onClose,
  onSubmit,
  group,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setBody('');
      setLink('');
      setSelectedImage(null);
    }
  }, [visible]);

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

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Erro', 'Mensagem é obrigatória');
      return;
    }

    onSubmit(title.trim(), body.trim(), link.trim() || undefined, selectedImage ?? undefined);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
    setLink('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Notificar Grupo</Text>
          {group && (
            <Text style={styles.groupName}>
              {group.name} ({group.usersCount ?? group.users?.length ?? 0} usuários)
            </Text>
          )}

          <ScrollView>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título da notificação"
              maxLength={100}
            />

            <Text style={styles.label}>Mensagem *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Mensagem da notificação"
              multiline
              numberOfLines={5}
              maxLength={500}
            />
            <Text style={styles.charCount}>{body.length}/500</Text>

            <View style={styles.labelRow}>
              <Text style={[styles.label, styles.labelInRow]}>Link (opcional)</Text>
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
              placeholder="https://example.com"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            <Text style={styles.label}>Imagem (opcional)</Text>
            {!selectedImage ? (
              <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
                <Icon family="FontAwesome" name="image" size={16} color="#fff" />
                <Text style={styles.imageButtonText}>Selecionar imagem</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Text style={styles.removeImageText}>✕ Remover</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              onPress={handleClose}
              variant="secondary"
              noShadow
              style={styles.button}
            />
            <CustomButton
              title="Enviar"
              onPress={handleSubmit}
              noShadow
              style={styles.button}
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
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    color: theme.colors.textSecondary || '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  labelInRow: {
    marginTop: 0,
    marginBottom: 0,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.danger || '#dc2626',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  imagePreviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.card,
  },
  removeImageButton: {
    backgroundColor: theme.colors.danger || '#dc2626',
    paddingVertical: 8,
    alignItems: 'center',
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
