/**
 * Tela de Perfil do Usuário
 * Permite visualizar e editar dados do perfil e foto
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Estados para edição
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          console.log('Usuário cancelou a seleção de imagem');
        } else if (response.errorCode) {
          Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setSelectedImage(asset.uri || null);
        }
      }
    );
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!name.trim()) {
        Alert.alert('Erro', 'O nome é obrigatório');
        return;
      }

      if (!email.trim()) {
        Alert.alert('Erro', 'O e-mail é obrigatório');
        return;
      }

      if (password && password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (password !== passwordConfirmation) {
        Alert.alert('Erro', 'As senhas não conferem');
        return;
      }

      setLoading(true);

      // Preparar dados para envio
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      if (password) {
        formData.append('password', password);
        formData.append('password_confirmation', passwordConfirmation);
      }

      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_image', {
          uri: selectedImage,
          type,
          name: filename,
        } as any);
      }

      // Aqui você chamaria o use case de atualização
      // const response = await container.updateUserUseCase.execute(user!.id, formData);
      
      // Por enquanto, atualizar apenas localmente
      if (updateUser) {
        const updatedData: Partial<typeof user> = {
          name,
          email,
        };
        
        if (selectedImage) {
          updatedData.profileImageUrl = selectedImage;
        }
        
        updateUser(updatedData);
      }
      
      // Simulação de sucesso
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso', [
        {
          text: 'OK',
          onPress: () => {
            setEditing(false);
            setPassword('');
            setPasswordConfirmation('');
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword('');
    setPasswordConfirmation('');
    setSelectedImage(null);
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon family="Ionicons" name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Icon 
            family="Ionicons" 
            name={editing ? "close" : "create-outline"} 
            size={28} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Foto de Perfil */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={editing ? handleSelectImage : undefined}
            disabled={!editing}
          >
            <Avatar
              imageUrl={selectedImage || user?.profileImageUrl}
              name={user?.name || 'U'}
              size={120}
            />
            {editing && (
              <View style={styles.editBadge}>
                <Icon family="Ionicons" name="camera" size={20} color={theme.colors.surface} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {editing ? 'Toque para alterar a foto' : user?.name}
          </Text>
        </View>

        {/* Informações do Perfil */}
        <Card>
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <Text style={styles.value}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{user?.email}</Text>
            )}
          </View>

          {editing && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Alterar Senha (opcional)</Text>
              
              <View style={styles.field}>
                <Text style={styles.label}>Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite a nova senha"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <TextInput
                  style={styles.input}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                />
              </View>
            </>
          )}
        </Card>

        {/* Informações adicionais */}
        {!editing && (
          <Card>
            <View style={styles.field}>
              <Text style={styles.label}>Tipo de Conta</Text>
              <Text style={styles.value}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Membro desde</Text>
              <Text style={styles.value}>
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('pt-BR') 
                  : '-'}
              </Text>
            </View>
          </Card>
        )}

        {/* Botões de Ação */}
        {editing && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  avatarHint: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: '600',
  },
});

export default ProfileScreen;
