/**
 * Campo de pesquisa reutilizável (grupos, usuários, etc.).
 */
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../../core/components/Icon';
import { theme } from '../../config/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Pesquisar...',
}) => (
  <View style={styles.container}>
    <Icon family="FontAwesome" name="search" size={15} color={theme.colors.textSecondary} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={() => onChangeText('')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon family="Ionicons" name="close-circle" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: 10,
  },
});

export default SearchBar;
