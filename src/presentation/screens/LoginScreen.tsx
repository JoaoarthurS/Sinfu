/**
 * Tela de Login
 * Permite autenticação com dois perfis: User e Admin
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginScreenProps } from '../../navigation/types';
import { useAuth } from '../../core/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

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
      await signIn(email, password);
      // Navegação é automática baseada no role do usuário
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.message || 'Não foi possível fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'user' | 'admin') => {
    if (type === 'user') {
      setEmail('user@example.com');
      setPassword('user123');
    } else {
      setEmail('admin@example.com');
      setPassword('admin123');
    }
    setErrors({ email: '', password: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Icon family="FontAwesome" name="mobile" size={64} color={theme.colors.primary} />
            <Text style={styles.title}>Sinfu</Text>
            <Text style={styles.subtitle}>Sistema de Notificações</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Fazer Login</Text>

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

            <CustomButton
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Credenciais de Demonstração:</Text>
            
            <View style={styles.demoButtons}>
              <View style={styles.demoButtonContainer}>
                <Icon family="FontAwesome" name="user" size={16} color={theme.colors.primary} style={styles.buttonIcon} />
                <CustomButton
                  title="Usuário"
                  variant="secondary"
                  onPress={() => fillDemoCredentials('user')}
                  style={styles.demoButton}
                />
              </View>
              
              <View style={styles.demoButtonContainer}>
                <Icon family="FontAwesome" name="user-tie" size={16} color={theme.colors.primary} style={styles.buttonIcon} />
                <CustomButton
                  title="Admin"
                  variant="secondary"
                  onPress={() => fillDemoCredentials('admin')}
                  style={styles.demoButton}
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Icon family="FontAwesome" name="info-circle" size={16} color={theme.colors.info} />
                <Text style={styles.infoTitle}>Perfis:</Text>
              </View>
              <Text style={styles.infoText}>
                • <Text style={styles.bold}>Usuário:</Text> Recebe notificações básicas
              </Text>
              <Text style={styles.infoText}>
                • <Text style={styles.bold}>Admin:</Text> Recebe notificações administrativas
              </Text>
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
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  demoSection: {
    marginTop: theme.spacing.xl,
  },
  demoTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  demoButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  buttonIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    marginTop: -8,
    zIndex: 1,
  },
  demoButton: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  infoTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  bold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default LoginScreen;
