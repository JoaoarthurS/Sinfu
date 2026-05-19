/**
 * Tela de Login do Admin
 * Interface de autenticação para administradores
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
import { AdminLoginScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
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
      await signIn(email, password, 'admin');
    } catch (error: any) {
      if (isInvalidCredentialsError(error)) {
        setPassword('');
        setErrors((prev) => ({ ...prev, password: '' }));
      }

      Alert.alert(
        'Erro no Login',
        error.message || 'Não foi possível fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@dti.com');
    setPassword('password');
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
            <Text style={styles.title}>Login Admin</Text>
            <Text style={styles.subtitle}>Acesso administrativo ao sistema</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.form}>
              <CustomInput
                label="Email Administrativo"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="admin@dti.com"
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

              <CustomButton
                title="Entrar como Admin"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                style={styles.loginButton}
              />

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
    backgroundColor: theme.colors.backgroundSecondary,
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
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  demoSection: {
    marginTop: theme.spacing.xl,
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

export default AdminLoginScreen;
