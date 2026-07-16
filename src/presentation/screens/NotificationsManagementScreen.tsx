/**
 * Tela de Gerenciamento de Notificações (admin)
 * Espelha o comportamento do painel web: cria notificações direcionadas
 * (Todos / Por grupo / Por usuário), lista com status e destinatários, e
 * permite enviar/reenviar, editar e excluir.
 */
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { HeaderAddButton } from '../components/HeaderAddButton';
import { NotificationFormModal, PickableUser } from '../components/NotificationFormModal';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import Icon from '../../core/components/Icon';
import { getSessionErrorMessage } from '../../core/utils/errorHandler';
import { Notification, CreateNotificationDTO } from '../../domain/entities/Notification';
import { Group } from '../../domain/entities/Group';

const NotificationsManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<PickableUser[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Notification | undefined>(undefined);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await container.getAllNotificationsUseCase.execute();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const [groupsData, usersResponse] = await Promise.all([
        container.getAllGroupsUseCase.execute(),
        container.apiClient.get<any>('/users', { params: { per_page: 100 } }),
      ]);
      setGroups(groupsData);
      const list = Array.isArray(usersResponse.data?.data) ? usersResponse.data.data : [];
      setUsers(
        list.map((u: any) => ({ id: String(u.id), name: u.name, email: u.email })),
      );
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadTargets();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadTargets()]);
    setRefreshing(false);
  }, []);

  const handleCreate = () => {
    setSelected(undefined);
    setModalVisible(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderAddButton label="Nova" onPress={handleCreate} />,
    });
  }, [navigation]);

  const handleEdit = (notification: Notification) => {
    setSelected(notification);
    setModalVisible(true);
  };

  const handleSubmit = async (data: CreateNotificationDTO) => {
    try {
      if (selected) {
        await container.updateNotificationUseCase.execute({ id: selected.id, ...data });
        Alert.alert('Sucesso', 'Notificação atualizada.');
      } else {
        await container.createNotificationUseCase.execute(data);
        Alert.alert('Sucesso', 'Notificação criada como rascunho. Use "Enviar" para dispará-la.');
      }
      await loadNotifications();
    } catch (error: any) {
      Alert.alert('Erro', getSessionErrorMessage(error));
      throw error; // mantém o modal aberto
    }
  };

  const handleSend = (notification: Notification) => {
    const alreadySent = notification.status === 'sent';
    Alert.alert(
      alreadySent ? 'Reenviar notificação' : 'Enviar notificação',
      `Deseja ${alreadySent ? 'reenviar' : 'enviar'} "${notification.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: alreadySent ? 'Reenviar' : 'Enviar',
          onPress: async () => {
            try {
              setSendingId(notification.id);
              const result = await container.sendNotificationUseCase.execute(String(notification.id));
              Alert.alert(
                'Sucesso',
                `Enviada para ${result.usersCount} usuário(s) (${result.tokensCount} dispositivo(s)).`,
              );
              await loadNotifications();
            } catch (error: any) {
              Alert.alert('Erro', getSessionErrorMessage(error));
            } finally {
              setSendingId(null);
            }
          },
        },
      ],
    );
  };

  const handleDelete = (notification: Notification) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir a notificação "${notification.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await container.deleteNotificationUseCase.execute(String(notification.id));
              Alert.alert('Sucesso', 'Notificação excluída.');
              await loadNotifications();
            } catch (error: any) {
              Alert.alert('Erro', getSessionErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  const formatSentAt = (notification: Notification) => {
    if (!notification.sentAt) return 'Não enviada';
    return notification.sentAt.toLocaleString('pt-BR');
  };

  const formatRecipients = (notification: Notification) => {
    if (notification.groups && notification.groups.length > 0) {
      return `Grupos: ${notification.groups.map((g) => g.name).join(', ')}`;
    }
    if (notification.targetUsers && notification.targetUsers.length > 0) {
      return `Pessoas: ${notification.targetUsers.map((u) => u.name).join(', ')}`;
    }
    return 'Todos os usuários';
  };

  const renderNotification = (notification: Notification) => {
    const sent = notification.status === 'sent';
    return (
      <Card key={notification.id} style={styles.notifCard}>
        <View style={styles.notifTop}>
          {notification.imageUrl ? (
            <Image source={{ uri: notification.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Icon family="FontAwesome" name="bell" size={16} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle} numberOfLines={1}>{notification.title}</Text>
            <Text style={styles.notifMessage} numberOfLines={2}>{notification.message}</Text>
          </View>
          <View style={[styles.statusBadge, sent ? styles.badgeSent : styles.badgeDraft]}>
            <Text style={[styles.statusText, sent ? styles.statusTextSent : styles.statusTextDraft]}>
              {sent ? 'Enviada' : 'Rascunho'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon family="FontAwesome" name="users" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{notification.usersCount ?? 0} destinatário(s)</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon family="FontAwesome" name="clock-o" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{formatSentAt(notification)}</Text>
          </View>
        </View>

        <View style={styles.recipientsRow}>
          <Icon family="FontAwesome" name="bullhorn" size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.metaText, styles.recipientsText]} numberOfLines={2}>
            {formatRecipients(notification)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => handleSend(notification)}
            disabled={sendingId === notification.id}
          >
            {sendingId === notification.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon family="FontAwesome" name={sent ? 'refresh' : 'paper-plane'} size={12} color="#fff" />
                <Text style={styles.actionText}>{sent ? 'Reenviar' : 'Enviar'}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(notification)}
          >
            <Icon family="FontAwesome" name="edit" size={12} color="#fff" />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(notification)}
          >
            <Icon family="FontAwesome" name="trash" size={12} color="#fff" />
            <Text style={styles.actionText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando notificações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.subtitle}>
          {notifications.length} notificaç{notifications.length === 1 ? 'ão' : 'ões'}
        </Text>

        {notifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtext}>Crie uma notificação para começar.</Text>
          </Card>
        ) : (
          notifications.map(renderNotification)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <NotificationFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        notification={selected}
        groups={groups}
        users={users}
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
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    marginLeft: 2,
  },
  notifCard: {
    marginBottom: 14,
  },
  notifTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notifMessage: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeSent: {
    backgroundColor: theme.colors.success + '20',
  },
  badgeDraft: {
    backgroundColor: theme.colors.textSecondary + '20',
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  statusTextSent: {
    color: theme.colors.success,
  },
  statusTextDraft: {
    color: theme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  recipientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  recipientsText: {
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 34,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationsManagementScreen;
