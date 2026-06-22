/**
 * Tela de Perfil do Usuário
 * Permite visualizar e editar dados do perfil e foto
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { HeaderMenu } from '../components/HeaderMenu';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { launchImageLibrary } from 'react-native-image-picker';
import { container } from '../../core/di/container';
import { Group } from '../../domain/entities/Group';
import { getSessionErrorMessage } from '../../core/utils/errorHandler';

// O grupo "externo" é obrigatório e não editável pelo usuário.
const isExternalGroup = (group: { name?: string }): boolean =>
  (group.name ?? '').trim().toLowerCase() === 'externo';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, updateUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Estados para edição
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estados para grupos
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    user?.groups?.map(g => g.id) || []
  );
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Carrega o perfil atualizado (incluindo grupos) ao abrir a tela, já que a
  // resposta do login não traz os grupos do usuário.
  useEffect(() => {
    container.getProfileUseCase
      .execute()
      .then((fresh) => {
        updateUser?.(fresh);
        setSelectedGroupIds(fresh.groups?.map((g) => g.id) || []);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega grupos públicos ao entrar no modo de edição
  useEffect(() => {
    if (editing) {
      setSelectedGroupIds(user?.groups?.map(g => g.id) || []);
      setLoadingGroups(true);
      container.groupRepository.getPublicGroups()
        .then(groups => setPublicGroups(groups))
        .catch(() => {})
        .finally(() => setLoadingGroups(false));
    }
  }, [editing]);

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

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
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

      // O grupo "externo" é obrigatório: garante que ele sempre seja enviado,
      // mesmo que não esteja em selectedGroupIds.
      const externalGroup = publicGroups.find(isExternalGroup);
      const groupIds = externalGroup
        ? Array.from(new Set([...selectedGroupIds, externalGroup.id]))
        : selectedGroupIds;

      // Preparar dados para envio
      const updateData: any = {
        name,
        email,
        group_ids: groupIds,
      };

      if (password) {
        updateData.password = password;
        updateData.password_confirmation = passwordConfirmation;
      }

      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        updateData.profile_image = {
          uri: selectedImage,
          type,
          name: filename,
        };
      }

      // Chamar use case de atualização
      const updatedUser = await container.updateProfileUseCase.execute(updateData);

      // Atualizar contexto
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Limpar campos de senha
      setPassword('');
      setPasswordConfirmation('');
      setSelectedImage(null);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso', [
        {
          text: 'OK',
          onPress: () => {
            setEditing(false);
          },
        },
      ]);
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
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
    setSelectedGroupIds(user?.groups?.map(g => g.id) || []);
    setEditing(false);
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon family="Ionicons" name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <HeaderMenu
          options={[
            {
              label: 'Editar perfil',
              icon: 'create-outline',
              onPress: () => setEditing(!editing),
            },
            // Notificações Salvas apenas para usuários comuns (não admin)
            ...(user?.role !== 'admin' ? [{
              label: 'Notificações Salvas',
              icon: 'bookmark-outline',
              onPress: () => navigation.navigate('SavedNotifications'),
            }] : []),
            {
              label: 'Sair',
              icon: 'log-out-outline',
              onPress: handleLogout,
              destructive: true,
            },
          ]}
        />
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
              size={130}
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

        {/* Informações adicionais + Grupos (somente visualização) */}
        {!editing && (
          <Card>
            <View style={styles.field}>
              <Text style={styles.label}>Membro desde</Text>
              <Text style={styles.value}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                  : '-'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.label}>Grupos</Text>
              {user?.groups && user.groups.length > 0 ? (
                <View style={styles.chipsContainer}>
                  {user.groups.map(g => {
                    const fixed = isExternalGroup(g);
                    return (
                      <View key={g.id} style={[styles.chip, fixed && styles.chipFixed]}>
                        {fixed && (
                          <Icon
                            family="Ionicons"
                            name="lock-closed"
                            size={13}
                            color={theme.colors.textSecondary}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text style={[styles.chipText, fixed && styles.chipTextFixed]}>{g.name}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Nenhum grupo</Text>
              )}
            </View>
          </Card>
        )}

        {/* Seleção de grupos públicos (modo edição) */}
        {editing && (
          <Card>
            <Text style={styles.sectionTitle}>Grupos Públicos</Text>
            <Text style={styles.groupsHint}>
              Toque para entrar ou sair de um grupo público
            </Text>

            {loadingGroups ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.groupsLoader}
              />
            ) : publicGroups.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum grupo público disponível</Text>
            ) : (
              <>
              <View style={styles.chipsContainer}>
                {publicGroups.map(group => {
                  const fixed = isExternalGroup(group);
                  const selected = fixed || selectedGroupIds.includes(group.id);
                  return (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.chip,
                        selected && styles.chipSelected,
                        fixed && styles.chipFixed,
                      ]}
                      onPress={() => !fixed && toggleGroup(group.id)}
                      disabled={fixed}
                      activeOpacity={fixed ? 1 : 0.7}
                    >
                      {(fixed || selected) && (
                        <Icon
                          family="Ionicons"
                          name={fixed ? 'lock-closed' : 'checkmark'}
                          size={14}
                          color={fixed ? theme.colors.textSecondary : theme.colors.surface}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                          fixed && styles.chipTextFixed,
                        ]}
                      >
                        {group.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.fixedGroupHint}>
                O grupo "externo" é obrigatório e não pode ser removido.
              </Text>
              </>
            )}
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
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
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
    marginBottom: theme.spacing.sm,
  },
  groupsHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  groupsLoader: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipFixed: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  chipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.colors.surface,
  },
  chipTextFixed: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  fixedGroupHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
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
