/**
 * Tela de Seleção de Tipo de Usuário
 * Permite escolher entre entrar como Admin ou Usuário
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTypeSelectionScreenProps } from '../../navigation/types';
import { theme } from '../../config/theme';
import Icon from '../../core/components/Icon';

const { width } = Dimensions.get('window');

const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.gradient}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Icon family="FontAwesome" name="mobile" size={64} color="#fff" />
            <Text style={styles.title}>Sinfu</Text>
            <Text style={styles.subtitle}>Sistema de Notificações</Text>
          </View>

          {/* Selection Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Admin Button */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AdminLogin')}
            >
                <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon family="FontAwesome" name="shield" size={32} color="#4F8EF7" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Entrar como Admin</Text>
                  <Text style={styles.cardDescription}>
                  Gerencie usuários, grupos e envie notificações
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                </View>
            </TouchableOpacity>

            {/* User Button */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('UserLogin')}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon family="FontAwesome" name="bell" size={32} color="#4F8EF7" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Quero receber notificações</Text>
                  <Text style={styles.cardDescription}>
                    Receba notificações e gerencie suas preferências
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Versão 1.0.0 • © {new Date().getFullYear()} Sinfu
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};View

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  logo: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '300',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -theme.spacing.xxl,
  },
  questionText: {
    fontSize: 18,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },

  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default UserTypeSelectionScreen;
