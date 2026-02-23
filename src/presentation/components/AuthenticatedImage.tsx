/**
 * Componente de Imagem com Autenticação
 * Carrega imagens que requerem token de autenticação
 * Compatível com React Native (não usa FileReader)
 */
import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from '../../core/components/Icon';
import { theme } from '../../config/theme';

interface AuthenticatedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  onError?: () => void;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  uri,
  style,
  onError,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  console.log('🖼️ [AuthenticatedImage] Renderizando imagem:', uri);

  const handleLoadStart = () => {
    console.log('🖼️ [AuthenticatedImage] Iniciando carregamento');
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    console.log('🖼️ [AuthenticatedImage] Carregamento finalizado');
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('🖼️ [AuthenticatedImage] Imagem carregada com sucesso');
    setLoading(false);
    setError(false);
  };

  const handleError = (e: any) => {
    console.error('🖼️ [AuthenticatedImage] Erro ao carregar imagem:', e?.nativeEvent);
    setError(true);
    setLoading(false);
    onError?.();
  };

  return (
    <View style={style}>
      {loading && !error && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      
      {error && (
        <View style={[styles.errorContainer, style]}>
          <Icon 
            family="Ionicons" 
            name="image-outline" 
            size={48} 
            color={theme.colors.textSecondary} 
          />
        </View>
      )}

      {!error && (
        <Image
          {...rest}
          source={{ uri }}
          style={style}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
});
