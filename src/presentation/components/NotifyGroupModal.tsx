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
} from 'react-native';
import { theme } from '../../config/theme';
import { CustomButton } from './CustomButton';
import { Group } from '../../domain/entities/Group';

interface NotifyGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string) => void;
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

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setBody('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Erro', 'Mensagem é obrigatória');
      return;
    }

    onSubmit(title.trim(), body.trim());
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
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
              {group.name} ({group.users?.length || 0} usuários)
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
          </ScrollView>

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              onPress={handleClose}
              variant="secondary"
              style={styles.button}
            />
            <CustomButton
              title="Enviar"
              onPress={handleSubmit}
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
