/**
 * Dashboard do Usuário Comum
 * Exibe notificações básicas e informações do perfil
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserDashboardScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { TweetStyleNotification } from '../components/TweetStyleNotification';
import { InstagramStyleNotification } from '../components/InstagramStyleNotification';
import { Notification } from '../../domain/entities/Notification';
import { container } from '../../core/di/container';

const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({ route, navigation }) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      console.log('🔵 [UserDashboard] Iniciando carregamento de notificações...');
      setLoadingNotifications(true);
      const data = await container.getAllNotificationsUseCase.execute();
      console.log('🔵 [UserDashboard] Notificações recebidas:', data.length);
      
      // Ordenar por data mais recente
      const sortedData = data.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      console.log('🔵 [UserDashboard] Notificações ordenadas:', sortedData.length);
      setNotifications(sortedData);
    } catch (error: any) {
      console.error('🔵 [UserDashboard] Erro ao carregar notificações:', {
        message: error.message,
        status: error.status,
        full: error
      });
      Alert.alert('Erro', error.message || 'Não foi possível carregar as notificações');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);
  
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoHeader}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/unimontes-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileSection}
        >
          <Avatar
            imageUrl={user?.profileImageUrl}
            name={user?.name || 'U'}
            size={50}
          />
            <View style={styles.userInfo}>
            <Text style={styles.greeting}>{user?.name || 'Usuário'}</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} disabled={loading}>
          <Icon family="Ionicons" name="log-out-outline" size={28} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {loadingNotifications ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <Card>
            <View style={styles.emptyState}>
              <Icon 
                family="Ionicons" 
                name="notifications-off-outline" 
                size={64} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não recebeu nenhuma notificação dos seus grupos.
              </Text>
            </View>
          </Card>
        ) : (
          /* Feed de Notificações */
          <View style={styles.feedContainer}>
            {notifications.map((notification) => {
              console.log('🔍 [UserDashboard] Renderizando notificação:', {
                id: notification.id,
                title: notification.title,
                hasImageUrl: !!notification.imageUrl,
                imageUrl: notification.imageUrl,
                imageUrlType: typeof notification.imageUrl
              });
              
              // Se tem imagem válida, exibe estilo Tweet
              if (notification.imageUrl && notification.imageUrl.trim().length > 0) {
                return (
                  <TweetStyleNotification 
                    key={notification.id} 
                    notification={notification} 
                  />
                );
              }
              // Se não tem imagem, exibe estilo Instagram
              return (
                <InstagramStyleNotification 
                  key={notification.id} 
                  notification={notification} 
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  logoHeader: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  logoContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  logo: {
    height: 40,
    width: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  userInfo: {
    justifyContent: 'center',
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  role: {
    ...theme.typography.bodySmall,
    color: theme.colors.user,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  feedHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  feedTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  feedSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  feedContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});

export default UserDashboardScreen;

