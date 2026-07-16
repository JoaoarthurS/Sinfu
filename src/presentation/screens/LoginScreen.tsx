/**
 * Tela de Login Unificada
 * Autentica qualquer usuário e o direciona automaticamente conforme o perfil:
 * administradores vão para o painel administrativo e usuários comuns para o
 * feed (ver AppNavigator, que troca de stack com base no role/portal).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { getErrorMessage } from '../../core/utils/errorHandler';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const isInvalidCredentialsError = (error: any): boolean => {
    const message = (error?.message || '').toLowerCase();
    return error?.status === 401 || message.includes('credenciais') || message.includes('invalid');
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Sem portal explícito: o AuthContext identifica o perfil retornado pela
      // API e o AppNavigator direciona para o painel admin ou para o feed.
      await signIn(email.trim(), password);
    } catch (error: any) {
      if (isInvalidCredentialsError(error)) {
        setPassword('');
        setAuthError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
      } else {
        setAuthError(getErrorMessage(error));
      }
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
          {/* Identidade visual */}
          <View style={styles.header}>
            <View style={styles.brandIconContainer}>
              <Icon family="FontAwesome" name="bell" size={36} color={theme.colors.textLight} />
            </View>
            <Text style={styles.title}>UniNotes</Text>
            <Text style={styles.subtitle}>Sistema de Notificações</Text>
          </View>

          {/* Cartão do formulário */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              {authError ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Icon
                    family="FontAwesome"
                    name="exclamation-circle"
                    size={18}
                    color={theme.colors.danger}
                  />
                  <Text style={styles.errorBannerText}>{authError}</Text>
                </View>
              ) : null}

              <CustomInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                  if (authError) setAuthError('');
                }}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
                error={errors.email}
              />

              <CustomInput
                label="Senha"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                  if (authError) setAuthError('');
                }}
                placeholder="Digite sua senha"
                isPassword
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
                error={errors.password}
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Esqueci minha senha"
              >
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <CustomButton
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                style={styles.loginButton}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerLinkContainer}
                onPress={() => navigation.navigate('UserRegister')}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Criar uma nova conta"
              >
                <Text style={styles.registerLinkText}>
                  Ainda não tem conta?{' '}
                  <Text style={styles.registerLinkHighlight}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Versão 1.0.0 • © {new Date().getFullYear()} UniNotes
            </Text>
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
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl + theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  brandIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: theme.colors.textLight,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  formCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    marginTop: -theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  form: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.danger + '15',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    flex: 1,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    ...theme.typography.bodySmall,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: theme.spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  registerLinkContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  registerLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  registerLinkHighlight: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default LoginScreen;
