/**
 * Componente de Notificação estilo Tweet
 * Para notificações COM imagem
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { Notification } from '../../domain/entities/Notification';
import { AuthenticatedImage } from './AuthenticatedImage';
import { container } from '../../core/di/container';
import { shareNotification } from '../../core/utils/shareNotification';
import { formatTime } from '../../core/utils/formatTime';

interface TweetStyleNotificationProps {
  notification: Notification;
  onUnsave?: (notificationId: string) => void;
}

export const TweetStyleNotification: React.FC<TweetStyleNotificationProps> = ({
  notification,
  onUnsave,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(notification.saved || false);

  useEffect(() => {
    setIsSaved(notification.saved || false);
  }, [notification.saved]);


  console.log('🖼️ [TweetStyleNotification] Renderizando notificação:', {
    id: notification.id,
    title: notification.title,
    hasImage: !!notification.imageUrl,
    imageUrl: notification.imageUrl ? notification.imageUrl.substring(0, 100) : null,
    imageError
  });

  const handleLinkPress = () => {
    if (notification.link) {
      Linking.openURL(notification.link);
    }
  };

  const handleShare = async () => {
    try {
      await shareNotification(notification);
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

        {/* Image (toque para expandir) */}
        {notification.imageUrl && notification.imageUrl.trim().length > 0 && !imageError && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setImageExpanded(true)}>
            <AuthenticatedImage
              uri={notification.imageUrl}
              style={styles.image}
              resizeMode="cover"
              onError={() => {
                console.error('🖼️ [TweetStyleNotification] Erro ao carregar imagem');
                setImageError(true);
              }}
            />
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.footerButton} onPress={handleSaveToggle} activeOpacity={0.6}>
          <Icon
            family="Ionicons"
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isSaved ? theme.colors.primary : theme.colors.text}
          />
          <Text style={[styles.footerButtonText, isSaved && styles.footerButtonTextActive]}>
            {isSaved ? 'Salvo' : 'Salvar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.footerButton, styles.footerButtonRight]} onPress={handleShare} activeOpacity={0.6}>
          <Icon family="Ionicons" name="share-social-outline" size={20} color={theme.colors.text} />
          <Text style={styles.footerButtonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>

      {/* Visualização da imagem em tela cheia */}
      {notification.imageUrl && (
        <Modal
          visible={imageExpanded}
          transparent
          animationType="fade"
          onRequestClose={() => setImageExpanded(false)}
        >
          <View style={styles.expandedOverlay}>
            <TouchableOpacity
              style={styles.expandedCloseButton}
              onPress={() => setImageExpanded(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon family="Ionicons" name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.expandedImageArea}
              activeOpacity={1}
              onPress={() => setImageExpanded(false)}
            >
              <Image
                source={{ uri: notification.imageUrl }}
                style={styles.expandedImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
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
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 14,
  },
  footerButtonRight: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.divider,
  },
  footerButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
  },
  footerButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  expandedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  expandedCloseButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImageArea: {
    flex: 1,
    justifyContent: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
});
