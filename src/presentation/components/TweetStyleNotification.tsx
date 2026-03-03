/**
 * Componente de Notificação estilo Tweet
 * Para notificações COM imagem
 */
import React, { useState } from 'react';
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
import { AuthenticatedImage } from './AuthenticatedImage';
import { container } from '../../core/di/container';

interface TweetStyleNotificationProps {
  notification: Notification;
  onUnsave?: (notificationId: string) => void;
}

export const TweetStyleNotification: React.FC<TweetStyleNotificationProps> = ({
  notification,
  onUnsave,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(notification.saved || false);
  
  console.log('🖼️ [TweetStyleNotification] Renderizando notificação:', {
    id: notification.id,
    title: notification.title,
    hasImage: !!notification.imageUrl,
    imageUrl: notification.imageUrl ? notification.imageUrl.substring(0, 100) : null,
    imageError
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleLinkPress = () => {
    if (notification.link) {
      Linking.openURL(notification.link);
    }
  };

  const handleShare = async () => {
    try {
      let shareContent = `📢 ${notification.title}\n\n${notification.message}`;
      
      if (notification.imageUrl) {
        shareContent += `\n\n🖼️ Imagem: ${notification.imageUrl}`;
      }
      
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

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        // Desfazer salvamento
        await container.unsaveNotificationUseCase.execute(notification.id);
        setIsSaved(false);
        if (onUnsave) {
          onUnsave(notification.id);
        }
      } else {
        // Salvar
        await container.saveNotificationUseCase.execute(notification.id);
        setIsSaved(true);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a notificação');
      console.error('Erro ao salvar notificação:', error);
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

        {/* Image */}
        {notification.imageUrl && notification.imageUrl.trim().length > 0 && !imageError && (
          <AuthenticatedImage
            uri={notification.imageUrl}
            style={styles.image}
            resizeMode="cover"
            onError={() => {
              console.error('🖼️ [TweetStyleNotification] Erro ao carregar imagem');
              setImageError(true);
            }}
          />
        )}
        
        {/* Fallback se a imagem falhar */}
        {notification.imageUrl && notification.imageUrl.trim().length > 0 && imageError && (
          <View style={styles.imageFallback}>
            <Icon family="Ionicons" name="image-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.imageFallbackText}>Imagem não disponível</Text>
            <Text style={styles.imageFallbackSubtext}>Verifique sua conexão</Text>
          </View>
        )}

        {/* Link Preview */}
        {notification.link && (
          <TouchableOpacity style={styles.linkContainer} onPress={handleLinkPress}>
            <Icon family="Ionicons" name="link" size={16} color={theme.colors.primary} />
            <Text style={styles.linkText} numberOfLines={1}>
              {notification.link}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleSaveToggle}>
          <Icon 
            family="Ionicons" 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={18} 
            color={isSaved ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <Text style={[styles.footerButtonText, isSaved && styles.footerButtonTextActive]}>
            {isSaved ? 'Salvo' : 'Salvar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={handleShare}>
          <Icon family="Ionicons" name="share-social-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.footerButtonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
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
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  imageFallback: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderStyle: 'dashed',
  },
  imageFallbackText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontWeight: '600',
  },
  imageFallbackSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  linkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  footerButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
