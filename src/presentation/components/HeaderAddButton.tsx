/**
 * Botão de ação "adicionar" para o cabeçalho nativo de navegação.
 * Usado nas telas de gerenciamento (grupos, usuários, notificações) para
 * evitar um título/ação redundante dentro do conteúdo.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from '../../core/components/Icon';
import { theme } from '../../config/theme';

interface HeaderAddButtonProps {
  onPress: () => void;
  label?: string;
}

export const HeaderAddButton: React.FC<HeaderAddButtonProps> = ({ onPress, label = 'Novo' }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.button}
    activeOpacity={0.8}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Icon family="FontAwesome" name="plus" size={13} color="#fff" />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    // leve elevação para destacar no header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HeaderAddButton;
