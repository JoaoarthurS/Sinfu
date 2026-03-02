/**
 * Menu de três pontos no header
 * Usado para mostrar opções do usuário
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Icon from '../../core/components/Icon';
import { theme } from '../../config/theme';

interface MenuOption {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface HeaderMenuProps {
  options: MenuOption[];
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ options }) => {
  const [visible, setVisible] = useState(false);

  const handleOptionPress = (onPress: () => void) => {
    setVisible(false);
    // Pequeno delay para fechar o modal antes de executar a ação
    setTimeout(() => {
      onPress();
    }, 100);
  };

  return (
    <>
      {/* Botão de três pontos */}
      <TouchableOpacity 
        onPress={() => setVisible(true)}
        style={styles.iconButton}
      >
        <Icon 
          family="Ionicons" 
          name="ellipsis-vertical" 
          size={26} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>

      {/* Modal do Menu */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setVisible(false)}
        >
          <View style={styles.menuContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === options.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleOptionPress(option.onPress)}
              >
                <Icon 
                  family="Ionicons" 
                  name={option.icon} 
                  size={22} 
                  color={option.destructive ? theme.colors.danger : theme.colors.text}
                />
                <Text 
                  style={[
                    styles.menuItemText,
                    option.destructive && styles.menuItemTextDestructive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingRight: theme.spacing.md,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    ...theme.typography.body,
    fontSize: 16,
    marginLeft: theme.spacing.md,
    color: theme.colors.text,
  },
  menuItemTextDestructive: {
    color: theme.colors.danger,
  },
});
