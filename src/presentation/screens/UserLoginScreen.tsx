/**
 * Tela de Login do Usuário
 * Interface de autenticação para usuários regulares
 */
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserLoginScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';
import { getErrorMessage } from '../../core/utils/errorHandler';

const UserLoginScreen: React.FC<UserLoginScreenProps> = ({ navigation }) => {
  const { signIn, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

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
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password, 'user');
    } catch (error: any) {
      const isCredentialError = isInvalidCredentialsError(error);
      if (isCredentialError) {
        setPassword('');
        setErrors((prev) => ({ ...prev, password: '' }));
      }
      Alert.alert(
        'Erro no Login',
        isCredentialError ? 'E-mail ou senha incorretos.' : getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Informe seu email para recuperar a senha' }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Email inválido' }));
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      Alert.alert('Recuperação de senha', 'Se o email existir, enviaremos as instruções de recuperação.');
    } catch (error: any) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('user@example.com');
    setPassword('user123');
    setErrors({ email: '', password: '' });
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
          {/* Header Gradient */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon family="FontAwesome" name="arrow-left" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Icon family="FontAwesome" name="user" size={64} color="#fff" />
            <Text style={styles.title}>Receber Notificações</Text>
            <Text style={styles.subtitle}>Mantenha-se informado com nossas notificações</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.form}>
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
                placeholder="Digite sua senha"
                isPassword
                autoCapitalize="none"
                autoComplete="password"
                error={errors.password}
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <CustomButton
                title="Começar a Receber"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                style={styles.loginButton}
              />

              <TouchableOpacity
                style={styles.registerLinkContainer}
                onPress={() => navigation.navigate('UserRegister')}
              >
                <Text style={styles.registerLinkText}>Ainda nao tem conta? Cadastre-se</Text>
              </TouchableOpacity>

              {/* Benefits */}
              <View style={styles.benefitsSection}>
                <View style={styles.benefitItem}>
                  <Icon family="FontAwesome" name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.benefitText}>Notificações importantes</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Icon family="FontAwesome" name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.benefitText}>Atualizações em tempo real</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Icon family="FontAwesome" name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.benefitText}>Controle total de preferências</Text>
                </View>
              </View>

              {/* Demo Credentials */}
              <View style={styles.demoSection}>
                <Text style={styles.demoLabel}>Ambiente de demonstração</Text>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={fillDemoCredentials}
                >
                  <View style={styles.demoButtonContent}>
                    <Icon family="FontAwesome" name="key" size={14} color={theme.colors.primary} style={styles.demoIcon} />
                    <Text style={styles.demoButtonText}>Usar credenciais de teste</Text>
                  </View>
                </TouchableOpacity>
              </View>
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
    backgroundColor: theme.colors.primary, // Fundo igual ao botão
    borderBottomLeftRadius: theme.borderRadius.xl * 2,
    borderBottomRightRadius: theme.borderRadius.xl * 2,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  title: {
    fontSize: 32,
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
  loginButton: {
    marginTop: theme.spacing.md,
  },
  forgotPasswordContainer: {
    marginTop: theme.spacing.xs,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  registerLinkContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  benefitsSection: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  demoSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  demoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  demoIcon: {
    marginRight: theme.spacing.xs,
  },
  demoButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default UserLoginScreen;
