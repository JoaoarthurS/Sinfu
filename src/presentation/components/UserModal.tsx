/**
 * Modal para criar/editar usuarios
 */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../config/theme';
import { CustomButton } from './CustomButton';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  groupsCount?: number;
  createdAt?: Date;
}

export interface UserModalPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: UserModalPayload) => Promise<void> | void;
  user?: ManagedUser;
}

export const UserModal: React.FC<UserModalProps> = ({
  visible,
  onClose,
  onSubmit,
  user,
}) => {
  const isEdit = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && user) {
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setPasswordConfirmation('');
      return;
    }

    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
  }, [isEdit, user, visible]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome e obrigatorio.');
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      Alert.alert('Erro', 'Informe um email valido.');
      return;
    }

    if (!isEdit) {
      if (!password || password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter no minimo 6 caracteres.');
        return;
      }

      if (password !== passwordConfirmation) {
        Alert.alert('Erro', 'As senhas nao conferem.');
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        ...(isEdit
          ? {}
          : {
              password,
              password_confirmation: passwordConfirmation,
            }),
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Nao foi possivel salvar o usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{isEdit ? 'Editar Usuario' : 'Novo Usuario'}</Text>

          <ScrollView>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
              maxLength={255}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@dominio.com"
              maxLength={255}
            />

            {!isEdit && (
              <>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Minimo de 6 caracteres"
                />

                <Text style={styles.label}>Confirmar senha</Text>
                <TextInput
                  style={styles.input}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  secureTextEntry
                  placeholder="Digite novamente a senha"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              onPress={onClose}
              variant="secondary"
              style={styles.actionButton}
              disabled={loading}
            />
            <CustomButton
              title={isEdit ? 'Salvar' : 'Criar'}
              onPress={handleSubmit}
              style={styles.actionButton}
              loading={loading}
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
    maxHeight: '85%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
