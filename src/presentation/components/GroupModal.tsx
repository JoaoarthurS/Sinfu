/**
 * Modal para criar/editar grupos
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
import { Group, CreateGroupDTO } from '../../domain/entities/Group';

interface GroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (group: CreateGroupDTO) => void;
  group?: Group;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  visible,
  onClose,
  onSubmit,
  group,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('default');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setType(group.type || 'default');
    } else {
      setName('');
      setDescription('');
      setType('default');
    }
  }, [group, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do grupo é obrigatório');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      type: type.trim() || 'default',
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setType('default');
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
          <Text style={styles.title}>
            {group ? 'Editar Grupo' : 'Novo Grupo'}
          </Text>

          <ScrollView>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do grupo"
              maxLength={255}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição do grupo (opcional)"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Tipo</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="Tipo do grupo"
              maxLength={100}
            />
          </ScrollView>

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              onPress={handleClose}
              variant="secondary"
              style={styles.button}
            />
            <CustomButton
              title={group ? 'Atualizar' : 'Criar'}
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
    height: 80,
    textAlignVertical: 'top',
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
