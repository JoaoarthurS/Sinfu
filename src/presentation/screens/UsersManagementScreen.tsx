/**
 * Tela de gerenciamento de usuarios (admin)
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { ManagedUser, UserModal, UserModalPayload } from '../components/UserModal';
import { container } from '../../core/di/container';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';

interface UsersApiResponse {
  data: any[];
}

const mapApiUser = (apiUser: any): ManagedUser => ({
  id: String(apiUser.id),
  name: apiUser.name,
  email: apiUser.email,
  groupsCount: Array.isArray(apiUser.groups) ? apiUser.groups.length : 0,
  createdAt: apiUser.created_at ? new Date(apiUser.created_at) : undefined,
});

const extractErrorMessage = (error: any): string => {
  if (error?.errors) {
    const firstKey = Object.keys(error.errors)[0];
    if (firstKey && Array.isArray(error.errors[firstKey]) && error.errors[firstKey][0]) {
      return error.errors[firstKey][0];
    }
  }

  return error?.message || 'Operacao nao concluida.';
};

const UsersManagementScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | undefined>(undefined);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await container.apiClient.get<UsersApiResponse>('/users');
      const list = Array.isArray(response.data?.data) ? response.data.data.map(mapApiUser) : [];
      setUsers(list);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Erro', extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }, []);

  const handleCreate = () => {
    setSelectedUser(undefined);
    setModalVisible(true);
  };

  const handleEdit = (user: ManagedUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDelete = (user: ManagedUser) => {
    Alert.alert(
      'Excluir usuario',
      `Deseja realmente excluir ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await container.apiClient.delete(`/users/${user.id}`);
              await loadUsers();
              Alert.alert('Sucesso', 'Usuario excluido com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', extractErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async (payload: UserModalPayload) => {
    try {
      if (selectedUser) {
        await container.apiClient.put(`/users/${selectedUser.id}`, {
          name: payload.name,
          email: payload.email,
        });
      } else {
        await container.apiClient.post('/users', payload);
      }

      await loadUsers();
      Alert.alert('Sucesso', selectedUser ? 'Usuario atualizado com sucesso.' : 'Usuario criado com sucesso.');
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  };

  if (loading && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Usuarios</Text>
        <CustomButton title="+ Novo" onPress={handleCreate} style={styles.newButton} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {users.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum usuario encontrado</Text>
            <Text style={styles.emptySubtitle}>Crie usuarios para comecar o gerenciamento.</Text>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userMeta}>Grupos: {user.groupsCount || 0}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(user)}
                >
                  <Icon family="FontAwesome" name="edit" size={12} color="#fff" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(user)}
                >
                  <Icon family="FontAwesome" name="trash-alt" size={12} color="#fff" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <UserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: theme.colors.textSecondary || '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  newButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
  },
  userMeta: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 34,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    textAlign: 'center',
  },
});

export default UsersManagementScreen;
