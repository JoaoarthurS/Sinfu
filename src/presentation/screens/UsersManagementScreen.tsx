/**
 * Tela de gerenciamento de usuarios (admin)
 */
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { HeaderAddButton } from '../components/HeaderAddButton';
import { SearchBar } from '../components/SearchBar';
import { ManagedUser, UserModal, UserModalPayload } from '../components/UserModal';
import { container } from '../../core/di/container';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { getSessionErrorMessage } from '../../core/utils/errorHandler';

interface UsersApiResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
}

const mapApiUser = (apiUser: any): ManagedUser => ({
  id: String(apiUser.id),
  name: apiUser.name,
  email: apiUser.email,
  groupsCount: Array.isArray(apiUser.groups) ? apiUser.groups.length : 0,
  groupIds: Array.isArray(apiUser.groups) ? apiUser.groups.map((g: any) => String(g.id)) : [],
  createdAt: apiUser.created_at ? new Date(apiUser.created_at) : undefined,
});

const UsersManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | undefined>(undefined);
  const [search, setSearch] = useState('');

  const loadUsers = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page: targetPage, per_page: 10 };
      if (search.trim()) {
        params.search = search.trim();
      }
      const response = await container.apiClient.get<UsersApiResponse>('/users', { params });
      const list = Array.isArray(response.data?.data) ? response.data.data.map(mapApiUser) : [];
      setUsers(list);
      setPage(response.data?.current_page ?? targetPage);
      setLastPage(response.data?.last_page ?? 1);
      setTotal(response.data?.total ?? list.length);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Carrega na montagem e recarrega ao pesquisar (debounce). A busca é
  // server-side, então procura em todos os usuários, não só na página atual.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers(1);
    setRefreshing(false);
  }, []);

  const goToPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > lastPage || targetPage === page || loading) return;
    loadUsers(targetPage);
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setModalVisible(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderAddButton label="Novo" onPress={handleCreate} />,
    });
  }, [navigation]);

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
              const isLastItemOnPage = users.length === 1 && page > 1;
              await loadUsers(isLastItemOnPage ? page - 1 : page);
              Alert.alert('Sucesso', 'Usuario excluido com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', getSessionErrorMessage(error));
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
          group_ids: payload.group_ids,
        });
        await loadUsers(page);
      } else {
        await container.apiClient.post('/users', payload);
        await loadUsers(1);
      }

      Alert.alert('Sucesso', selectedUser ? 'Usuario atualizado com sucesso.' : 'Usuario criado com sucesso.');
    } catch (error: any) {
      throw new Error(getSessionErrorMessage(error));
    }
  };

  if (loading && users.length === 0 && !search.trim()) {
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar por nome ou e-mail..."
        />
        <Text style={styles.subtitle}>
          {total} usuário{total === 1 ? '' : 's'}
        </Text>
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
                  <Icon family="Feather" name="trash-2" size={12} color="#fff" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {lastPage > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
            onPress={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
          >
            <Icon family="FontAwesome" name="chevron-left" size={12} color={page <= 1 ? theme.colors.textSecondary || '#999' : '#fff'} />
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Página {page} de {lastPage} • {total} usuário{total !== 1 ? 's' : ''}
          </Text>

          <TouchableOpacity
            style={[styles.pageButton, page >= lastPage && styles.pageButtonDisabled]}
            onPress={() => goToPage(page + 1)}
            disabled={page >= lastPage || loading}
          >
            <Icon family="FontAwesome" name="chevron-right" size={12} color={page >= lastPage ? theme.colors.textSecondary || '#999' : '#fff'} />
          </TouchableOpacity>
        </View>
      )}

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary || '#666',
    marginBottom: 12,
    marginLeft: 2,
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || '#e0e0e0',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary || '#e0e0e0',
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
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
