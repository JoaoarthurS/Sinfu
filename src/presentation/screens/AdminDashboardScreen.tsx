/**
 * Dashboard do Administrador
 * Exibe notificações administrativas com CRUD completo
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminDashboardScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { CustomButton } from '../components/CustomButton';
import { NotificationModal } from '../components/NotificationModal';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import { Notification, NotificationPriority, CreateNotificationDTO } from '../../domain/entities/Notification';
import Icon from '../../core/components/Icon';

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ route, navigation }) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | undefined>(undefined);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await container.getAllNotificationsUseCase.execute();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Em caso de erro, usar dados mockados
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const getMockNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        title: 'Alerta de Sistema',
        message: 'Servidor principal com alta utilização de CPU (85%)',
        priority: NotificationPriority.HIGH,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Novo usuário registrado',
        message: '5 novos usuários se registraram hoje',
        priority: NotificationPriority.MEDIUM,
        read: false,
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: '3',
        title: 'Backup concluído',
        message: 'Backup automático diário realizado com sucesso',
        priority: NotificationPriority.LOW,
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000),
        updatedAt: new Date(Date.now() - 2 * 3600000),
      },
    ];
  };

  const handleCreateNotification = () => {
    setSelectedNotification(undefined);
    setModalVisible(true);
  };

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleDeleteNotification = (notification: Notification) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a notificação "${notification.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await container.deleteNotificationUseCase.execute(notification.id);
              Alert.alert('Sucesso', 'Notificação excluída com sucesso');
              await loadNotifications();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir a notificação');
            }
          },
        },
      ]
    );
  };

  const handleSaveNotification = async (data: CreateNotificationDTO) => {
    try {
      if (selectedNotification) {
        // Atualizar
        await container.updateNotificationUseCase.execute({
          id: selectedNotification.id,
          ...data,
        });
        Alert.alert('Sucesso', 'Notificação atualizada com sucesso');
      } else {
        // Criar
        await container.createNotificationUseCase.execute(data);
        Alert.alert('Sucesso', 'Notificação criada com sucesso');
      }
      await loadNotifications();
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta de administrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return theme.colors.danger;
      case NotificationPriority.MEDIUM:
        return theme.colors.warning;
      case NotificationPriority.LOW:
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 'Alta';
      case NotificationPriority.MEDIUM:
        return 'Média';
      case NotificationPriority.LOW:
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === NotificationPriority.HIGH && !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar
            imageUrl={user?.profileImageUrl}
            name={user?.name || 'A'}
            size={40}
            style={{ marginRight: theme.spacing.sm }}
          />
          <View>
            <Text style={styles.greeting}>Painel Admin</Text>
            <Text style={styles.userName}>{user?.name || 'Administrador'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} disabled={loading}>
          <Icon family="FontAwesome" name="sign-out-alt" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Alertas Críticos */}
        {highPriorityCount > 0 && (
          <View style={styles.alertBanner}>
            <Icon family="FontAwesome" name="exclamation-triangle" size={24} color={theme.colors.danger} style={styles.alertIcon} />
            <Text style={styles.alertText}>
              {highPriorityCount} {highPriorityCount === 1 ? 'alerta crítico' : 'alertas críticos'} requer atenção
            </Text>
          </View>
        )}

        {/* Estatísticas Administrativas */}
        <Card title="Painel de Controle">
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Icon family="FontAwesome" name="clipboard-list" size={32} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{notifications.length}</Text>
              <Text style={styles.statText}>Notificações</Text>
            </View>
            <View style={styles.statBox}>
              <Icon family="FontAwesome" name="circle" size={32} color={theme.colors.danger} />
              <Text style={[styles.statNumber, styles.criticalStat]}>
                {highPriorityCount}
              </Text>
              <Text style={styles.statText}>Críticas</Text>
            </View>
          </View>
        </Card>

        {/* Botão Criar Notificação */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="bullhorn" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Criar Notificação</Text>
            </View>
          </View>
          <Text style={styles.groupDescription}>
            Envie notificações push personalizadas para usuários e grupos específicos
          </Text>
          <CustomButton
            title="Criar Nova Notificação"
            onPress={() => navigation.navigate('CreateNotification')}
            style={styles.groupsButton}
          />
        </Card>

        {/* Botão Gerenciar Grupos */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="users" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Gerenciamento de Grupos</Text>
            </View>
          </View>
          <Text style={styles.groupDescription}>
            Crie e gerencie grupos de usuários para enviar notificações direcionadas
          </Text>
          <CustomButton
            title="Gerenciar Grupos"
            onPress={() => navigation.navigate('Groups')}
            style={styles.groupsButton}
          />
        </Card>

        {/* Gerenciar Notificações */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Gerenciar Notificações ({notifications.length})
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateNotification}
            >
              <Text style={styles.createButtonText}>+ Nova</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma notificação encontrada</Text>
          ) : (
            notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationUnread,
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <View 
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(notification.priority) + '20' }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(notification.priority) }
                        ]}
                      >
                        {getPriorityLabel(notification.priority)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <View style={styles.notificationTimeContainer}>
                    <Icon family="FontAwesome" name="clock" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.notificationTime}>
                      {getTimeAgo(notification.createdAt)}
                    </Text>
                  </View>

                  {/* Botões de Ação */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditNotification(notification)}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteNotification(notification)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
            ))
          )}
        </Card>
        <View style={{ height: 50 }} />

       
      </ScrollView>

      {/* Modal de Criar/Editar Notificação */}
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveNotification}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.admin,
    ...theme.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  adminIcon: {
    marginRight: theme.spacing.xs,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.textLight,
  },
  userName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
    opacity: 0.9,
  },
  content: {
    padding: theme.spacing.lg,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger + '20',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  alertIcon: {},
  alertText: {
    ...theme.typography.body,
    color: theme.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  profileInfo: {
    gap: theme.spacing.md,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  profileValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  adminBadge: {
    backgroundColor: theme.colors.admin + '20',
  },
  badgeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.admin,
    fontWeight: '600',
  },
  accessText: {
    ...theme.typography.bodySmall,
    color: theme.colors.success,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  criticalStat: {
    color: theme.colors.danger,
  },
  successStat: {
    color: theme.colors.success,
  },
  statText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardTitleIcon: {},
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationUnread: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  notificationTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  priorityText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  notificationMessage: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notificationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  notificationTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.info + '20',
    borderWidth: 1,
    borderColor: theme.colors.info,
  },
  editButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.info,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: theme.colors.danger + '20',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  deleteButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  adminButton: {
    marginBottom: theme.spacing.sm,
  },
  groupDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  groupsButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default AdminDashboardScreen;
