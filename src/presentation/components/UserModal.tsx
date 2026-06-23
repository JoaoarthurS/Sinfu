/**
 * Modal para criar/editar usuarios
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { container } from '../../core/di/container';
import Icon from '../../core/components/Icon';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  groupsCount?: number;
  groupIds?: string[];
  createdAt?: Date;
}

export interface UserModalPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  group_ids: string[];
}

interface GroupOption {
  id: string;
  name: string;
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
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && user) {
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setPasswordConfirmation('');
      setSelectedGroupIds(user.groupIds ?? []);
      return;
    }

    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setSelectedGroupIds([]);
  }, [isEdit, user, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let active = true;
    (async () => {
      try {
        setLoadingGroups(true);
        const data = await container.getAllGroupsUseCase.execute();
        if (active) {
          setGroups(data.map((g) => ({ id: String(g.id), name: g.name })));
        }
      } catch (error) {
        console.error('Error loading groups:', error);
        if (active) {
          setGroups([]);
        }
      } finally {
        if (active) {
          setLoadingGroups(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [visible]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

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
        group_ids: selectedGroupIds,
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

            <Text style={styles.label}>Grupos</Text>
            {loadingGroups ? (
              <View style={styles.groupsLoading}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.groupsLoadingText}>Carregando grupos...</Text>
              </View>
            ) : groups.length === 0 ? (
              <Text style={styles.groupsEmpty}>Nenhum grupo cadastrado</Text>
            ) : (
              <View style={styles.groupsList}>
                {groups.map((g) => {
                  const checked = selectedGroupIds.includes(g.id);
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={styles.groupRow}
                      onPress={() => toggleGroup(g.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.groupName}>{g.name}</Text>
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && (
                          <Icon family="FontAwesome" name="check" size={11} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {!loadingGroups && groups.length > 0 && (
              <Text style={styles.groupsCount}>
                {selectedGroupIds.length} grupo{selectedGroupIds.length === 1 ? '' : 's'} selecionado
                {selectedGroupIds.length === 1 ? '' : 's'}
              </Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <CustomButton
              title="Cancelar"
              onPress={onClose}
              variant="secondary"
              noShadow
              style={styles.actionButton}
              disabled={loading}
            />
            <CustomButton
              title={isEdit ? 'Salvar' : 'Criar'}
              onPress={handleSubmit}
              noShadow
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
  groupsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  groupsLoadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
  },
  groupsEmpty: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    paddingVertical: 8,
  },
  groupsList: {
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border || '#e0e0e0',
  },
  groupName: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border || '#cbd5e1',
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  groupsCount: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    marginTop: 6,
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
