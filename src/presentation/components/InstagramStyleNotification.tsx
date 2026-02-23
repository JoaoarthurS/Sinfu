/**
 * Componente de Notificação estilo Instagram Feed
 * Para notificações SEM imagem
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { Notification } from '../../domain/entities/Notification';

interface InstagramStyleNotificationProps {
  notification: Notification;
}

export const InstagramStyleNotification: React.FC<InstagramStyleNotificationProps> = ({
  notification,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes}m`;
    if (hours < 24) return `Há ${hours}h`;
    if (days === 1) return 'Há 1 dia';
    return `Há ${days} dias`;
  };

  const handleLinkPress = () => {
    if (notification.link) {
      Linking.openURL(notification.link);
    }
  };

  const handleShare = async () => {
    try {
      let shareContent = `📢 ${notification.title}\n\n${notification.message}`;
      
      if (notification.link) {
        shareContent += `\n\n🔗 Link: ${notification.link}`;
      }
      
      shareContent += `\n\n⏰ ${formatTime(notification.createdAt)}`;

      const result = await Share.share({
        message: shareContent,
        title: notification.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Compartilhado via:', result.activityType);
        } else {
          console.log('Conteúdo compartilhado');
        }
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível compartilhar o conteúdo');
      console.error('Erro ao compartilhar:', error);
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return theme.colors.danger;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { borderColor: getPriorityColor() }]}>
          <Icon 
            family="Ionicons" 
            name="notifications" 
            size={20} 
            color={getPriorityColor()} 
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message}>{notification.message}</Text>

        {notification.link && (
          <TouchableOpacity style={styles.linkButton} onPress={handleLinkPress}>
            <Icon family="Ionicons" name="open-outline" size={16} color={theme.colors.surface} />
            <Text style={styles.linkButtonText}>Abrir Link</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon family="Ionicons" name="paper-plane-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon family="Ionicons" name="bookmark-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  linkButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
});
