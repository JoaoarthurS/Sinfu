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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminDashboardScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import { Notification } from '../../domain/entities/Notification';
import Icon from '../../core/components/Icon';

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user, switchPortal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Novo usuário registrado',
        message: '5 novos usuários se registraram hoje',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: '3',
        title: 'Backup concluído',
        message: 'Backup automático diário realizado com sucesso',
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000),
        updatedAt: new Date(Date.now() - 2 * 3600000),
      },
    ];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo_branca_unimontes_hor.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.iconButton}
          >
            <Avatar
              imageUrl={user?.profileImageUrl}
              name={user?.name || 'A'}
              size={44}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas Administrativas */}
        <Card title="Painel de Controle">
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Icon family="FontAwesome" name="bell" size={32} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{notifications.length}</Text>
              <Text style={styles.statText}>Notificações</Text>
            </View>
          </View>
        </Card>

        {/* Acesso ao feed dos usuários */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="newspaper-o" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Feed de Notificações</Text>
            </View>
          </View>
          <Text style={styles.groupDescription}>
            Visualize o feed de notificações da mesma forma que os usuários comuns
          </Text>
          <CustomButton
            title="Ir para o Feed"
            onPress={() => switchPortal('user')}
            style={styles.groupsButton}
          />
        </Card>

        {/* Gerenciamento de Notificações */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="bullhorn" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Notificações</Text>
            </View>
          </View>
          <Text style={styles.groupDescription}>
            Crie notificações para todos, por grupo ou por usuário, e gerencie envios, edições e exclusões
          </Text>
          <CustomButton
            title="Gerenciar Notificações"
            onPress={() => navigation.navigate('NotificationsManagement')}
            style={styles.groupsButton}
          />
        </Card>

        {/* Botão Gerenciar Grupos */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="users" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Grupos</Text>
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

        {/* Botão Gerenciar Usuários */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon family="FontAwesome" name="user-circle" size={20} color={theme.colors.primary} style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Usuários</Text>
            </View>
          </View>
          <Text style={styles.groupDescription}>
            Cadastre, edite e exclua usuários diretamente pelo aplicativo
          </Text>
          <CustomButton
            title="Gerenciar Usuários"
            onPress={() => navigation.navigate('UsersManagement')}
            style={styles.groupsButton}
          />
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>
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
    alignItems: 'center', // já centraliza verticalmente
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.admin,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    height: 64,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center', // centraliza verticalmente
    alignItems: 'flex-start', // mantém alinhamento à esquerda horizontalmente
    height: '100%',
  },
  logo: {
    height: 100,
    width: 200,
    marginTop: 9,
    marginLeft: -35,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
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
  sendButton: {
    backgroundColor: theme.colors.primary,
    minHeight: 32,
    justifyContent: 'center',
  },
  sendButtonText: {
    ...theme.typography.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  statusBadgeSent: {
    backgroundColor: theme.colors.success + '20',
  },
  statusBadgeDraft: {
    backgroundColor: theme.colors.textSecondary + '20',
  },
  statusBadgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
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
