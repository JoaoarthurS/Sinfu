/**
 * Componente Avatar
 * Exibe a foto de perfil do usuário com fallback para iniciais
 */
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../config/theme';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  imageUrl, 
  name, 
  size = 50,
  style 
}) => {
  // Pega as iniciais do nome
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const avatarSize = { width: size, height: size, borderRadius: size / 2 };

  // Se tem imagem, exibe a imagem
  if (imageUrl && imageUrl.trim().length > 0) {
    return (
      <View style={[styles.container, avatarSize, style]}>
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.image, avatarSize]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Se não tem imagem, exibe as iniciais
  return (
    <View style={[styles.container, styles.placeholder, avatarSize, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: theme.colors.primary,
  },
  initials: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
});
