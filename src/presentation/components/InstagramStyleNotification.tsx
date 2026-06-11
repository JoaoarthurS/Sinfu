/**
 * Componente de Notificação estilo Instagram Feed
 * Para notificações SEM imagem
 */
import React, { useState, useEffect } from 'react';
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
import { container } from '../../core/di/container';

interface InstagramStyleNotificationProps {
  notification: Notification;
  onUnsave?: (notificationId: string) => void;
}

export const InstagramStyleNotification: React.FC<InstagramStyleNotificationProps> = ({
  notification,
  onUnsave,
}) => {
  const [isSaved, setIsSaved] = useState(notification.saved || false);

  useEffect(() => {
    setIsSaved(notification.saved || false);
  }, [notification.saved]);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
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
        <TouchableOpacity style={styles.actionButton} onPress={handleSaveToggle}>
          <Icon
            family="Ionicons"
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isSaved ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
            {isSaved ? 'Salvo' : 'Salvar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon family="Ionicons" name="share-social-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.actionButtonText}>Compartilhar</Text>
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
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  actionButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
