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
  Switch,
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
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setIsPublic(group.isPublic ?? true);
    } else {
      setName('');
      setDescription('');
      setIsPublic(true);
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
      is_public: isPublic,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
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

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.label}>
                  {isPublic ? 'Público' : 'Privado'}
                </Text>
                <Text style={styles.switchDesc}>
                  {isPublic
                    ? 'Visível no cadastro de usuários'
                    : 'Vinculação apenas por administradores'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: '#ccc', true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
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
              title={group ? 'Atualizar' : 'Criar'}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
    backgroundColor: theme.colors.card,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    marginTop: 2,
  },
});
