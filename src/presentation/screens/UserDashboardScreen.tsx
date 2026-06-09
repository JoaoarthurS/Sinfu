/**
 * Dashboard do Usuário Comum
 * Exibe notificações básicas e informações do perfil
 */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header estilo Instagram */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/unimontes-logo.png')}
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
              name={user?.name || 'U'}
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
        {loadingNotifications ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : notifications.length === 0 ? (
          /* Empty State - Estilo Instagram */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon 
                family="Ionicons" 
                name="notifications-outline" 
                size={80} 
                color={theme.colors.textSecondary} 
              />
            </View>
            <Text style={styles.emptyTitle}>Sem notificações</Text>
            <Text style={styles.emptySubtitle}>
              Quando você receber notificações,{'\n'}elas aparecerão aqui.
            </Text>
          </View>
        ) : (
          /* Feed de Notificações - Estilo Instagram */
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
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl, // maior
    paddingVertical: theme.spacing.md,   // maior
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    height: 64, // maior
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logo: {
    height: 100, // maior
    width: 125, // maior
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg, // maior
  },
  iconButton: {
    width: 44, // maior
    height: 44, // maior
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  feedContainer: {
    paddingBottom: theme.spacing.xxl || theme.spacing.xl * 1.5, // maior
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 4, // maior
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg, // maior
    fontSize: 16, // maior
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 5, // maior
    paddingHorizontal: theme.spacing.xxl || theme.spacing.xl * 1.5, // maior
  },
  emptyIconContainer: {
    width: 140, // maior
    height: 140, // maior
    borderRadius: 70, // maior
    borderWidth: 3,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl, // maior
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md, // maior
    fontSize: 26, // maior
    fontWeight: '700', // levemente mais forte
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22, // maior
    fontSize: 16, // maior
  },
});

export default UserDashboardScreen;

