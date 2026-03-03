/**
 * Tela de Notificações Salvas
 * Exibe apenas as notificações que o usuário salvou
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SavedNotificationsScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { TweetStyleNotification } from '../components/TweetStyleNotification';
import { InstagramStyleNotification } from '../components/InstagramStyleNotification';
import { Notification } from '../../domain/entities/Notification';
import { container } from '../../core/di/container';

const SavedNotificationsScreen: React.FC<SavedNotificationsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    loadSavedNotifications();
  }, []);

  const loadSavedNotifications = async () => {
    try {
      console.log('🔵 [SavedNotifications] Iniciando carregamento de notificações salvas...');
      setLoadingNotifications(true);
      const data = await container.getSavedNotificationsUseCase.execute();
      console.log('🔵 [SavedNotifications] Notificações salvas recebidas:', data.length);
      
      // Ordenar por data mais recente
      const sortedData = data.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      setNotifications(sortedData);
    } catch (error: any) {
      console.error('🔵 [SavedNotifications] Erro ao carregar notificações salvas:', {
        message: error.message,
        status: error.status,
        full: error
      });
      Alert.alert('Erro', error.message || 'Não foi possível carregar as notificações salvas');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedNotifications();
    setRefreshing(false);
  }, []);

  const handleUnsave = useCallback(async (notificationId: string) => {
    // Remover da lista localmente
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon family="Ionicons" name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações Salvas</Text>
        <View style={styles.placeholder} />
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
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon 
                family="Ionicons" 
                name="bookmark-outline" 
                size={80} 
                color={theme.colors.textSecondary} 
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma notificação salva</Text>
            <Text style={styles.emptySubtitle}>
              Salve notificações importantes para{'\n'}acessá-las rapidamente depois.
            </Text>
          </View>
        ) : (
          /* Feed de Notificações Salvas */
          <View style={styles.feedContainer}>
            {notifications.map((notification) => {
              // Se tem imagem válida, exibe estilo Tweet
              if (notification.imageUrl && notification.imageUrl.trim().length > 0) {
                return (
                  <TweetStyleNotification 
                    key={notification.id} 
                    notification={notification}
                    onUnsave={handleUnsave}
                  />
                );
              }
              // Se não tem imagem, exibe estilo Instagram
              return (
                <InstagramStyleNotification 
                  key={notification.id} 
                  notification={notification}
                  onUnsave={handleUnsave}
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    height: 64,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  feedContainer: {
    paddingBottom: theme.spacing.xxl || theme.spacing.xl * 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 4,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 5,
    paddingHorizontal: theme.spacing.xxl || theme.spacing.xl * 1.5,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontSize: 26,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 16,
  },
});

export default SavedNotificationsScreen;
