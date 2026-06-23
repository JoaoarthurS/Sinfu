/**
 * Tela de Cadastro do Usuário
 * Permite criar conta para receber notificações e selecionar grupos públicos
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserRegisterScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { container } from '../../core/di/container';
import { getErrorMessage } from '../../core/utils/errorHandler';
import { Group } from '../../domain/entities/Group';

// O grupo "externo" é o padrão de todo usuário criado e não pode ser removido.
const isExternalGroup = (group: { name?: string }): boolean =>
  (group.name ?? '').trim().toLowerCase() === 'externo';

const UserRegisterScreen: React.FC<UserRegisterScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    loadPublicGroups();
  }, []);

  const loadPublicGroups = async () => {
    try {
      setLoadingGroups(true);
      const groups = await container.groupRepository.getPublicGroups();
      setPublicGroups(groups);

      // O grupo "externo" vem selecionado por padrão e não pode ser removido.
      const external = groups.find(isExternalGroup);
      if (external) {
        setSelectedGroupIds((prev) =>
          prev.includes(external.id) ? prev : [...prev, external.id],
        );
      }
    } catch {
      // Silencioso: grupos são opcionais no cadastro
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório';
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Informe um e-mail válido';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'A senha é obrigatória';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirme a senha';
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'As senhas não conferem';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await signUp(name.trim(), email.trim(), password, selectedGroupIds);
    } catch (error: any) {
      Alert.alert('Erro no cadastro', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon family="FontAwesome" name="arrow-left" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>

            <Icon family="FontAwesome" name="user-plus" size={56} color="#fff" />
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Cadastre-se para receber notificacoes no app</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.form}>
              <CustomInput
                label="Nome completo"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Seu nome"
                autoCapitalize="words"
                error={errors.name}
              />

              <CustomInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <CustomInput
                label="Senha"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Minimo de 6 caracteres"
                isPassword
                autoCapitalize="none"
                autoComplete="password-new"
                error={errors.password}
              />

              <CustomInput
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Digite novamente sua senha"
                isPassword
                autoCapitalize="none"
                autoComplete="password-new"
                error={errors.confirmPassword}
              />

              {/* Seleção de grupos públicos */}
              {(loadingGroups || publicGroups.length > 0) && (
                <View style={styles.groupsSection}>
                  <Text style={styles.groupsTitle}>Grupos (opcional)</Text>
                  <Text style={styles.groupsSubtitle}>
                    Selecione os grupos que deseja participar
                  </Text>

                  {loadingGroups ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                      style={styles.groupsLoading}
                    />
                  ) : (
                    <View style={styles.groupsList}>
                      {publicGroups.map((group) => {
                        const fixed = isExternalGroup(group);
                        const selected = fixed || selectedGroupIds.includes(group.id);
                        return (
                          <TouchableOpacity
                            key={group.id}
                            style={[
                              styles.groupChip,
                              selected && styles.groupChipSelected,
                              fixed && styles.groupChipFixed,
                            ]}
                            onPress={() => !fixed && toggleGroup(group.id)}
                            disabled={fixed}
                            activeOpacity={fixed ? 1 : 0.7}
                          >
                            <Icon
                              family="FontAwesome"
                              name={fixed ? 'lock' : selected ? 'check-circle' : 'circle-o'}
                              size={16}
                              color={fixed ? theme.colors.textSecondary : selected ? '#fff' : theme.colors.primary}
                            />
                            <View style={styles.groupChipText}>
                              <View style={styles.groupChipNameRow}>
                                <Text
                                  style={[
                                    styles.groupChipName,
                                    selected && styles.groupChipNameSelected,
                                    fixed && styles.groupChipNameFixed,
                                  ]}
                                >
                                  {group.name}
                                </Text>
                                {fixed && (
                                  <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Padrão</Text>
                                  </View>
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.groupChipDesc,
                                  selected && styles.groupChipDescSelected,
                                  fixed && styles.groupChipDescFixed,
                                ]}
                              >
                                {fixed
                                  ? 'Tipo padrão de todos os usuários. Não pode ser removido.'
                                  : group.description || ''}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <CustomButton
                title="Criar conta"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                style={styles.registerButton}
              />

              <TouchableOpacity
                style={styles.loginLinkContainer}
                onPress={() => navigation.navigate('UserLogin')}
              >
                <Text style={styles.loginLinkText}>Ja tem conta? Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    top: theme.spacing.md,
    left: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  formCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    marginTop: -theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    ...theme.shadows.md,
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  loginLinkContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  groupsSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  groupsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  groupsSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    marginBottom: theme.spacing.sm,
  },
  groupsLoading: {
    marginVertical: theme.spacing.md,
  },
  groupsList: {
    gap: 8,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  groupChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  groupChipFixed: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  groupChipText: {
    flex: 1,
  },
  groupChipNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  groupChipNameSelected: {
    color: '#fff',
  },
  groupChipNameFixed: {
    color: theme.colors.text,
  },
  defaultBadge: {
    backgroundColor: theme.colors.textSecondary || '#666',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  groupChipDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    marginTop: 2,
  },
  groupChipDescSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  groupChipDescFixed: {
    color: theme.colors.textSecondary || '#666',
  },
});

export default UserRegisterScreen;
