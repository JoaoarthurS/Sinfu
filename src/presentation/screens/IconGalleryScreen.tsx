import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from '../../core/components/Icon';

/**
 * Tela de galeria de ícones - exemplos de uso das bibliotecas disponíveis
 */
export const IconGalleryScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Galeria de Ícones</Text>

        {/* Ionicons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ionicons</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon family="Ionicons" name="home-outline" size={32} color="#4F8EF7" />
              <Text style={styles.iconLabel}>home-outline</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Ionicons" name="notifications-outline" size={32} color="#4F8EF7" />
              <Text style={styles.iconLabel}>notifications</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Ionicons" name="settings-outline" size={32} color="#4F8EF7" />
              <Text style={styles.iconLabel}>settings</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Ionicons" name="person-outline" size={32} color="#4F8EF7" />
              <Text style={styles.iconLabel}>person</Text>
            </View>
          </View>
        </View>

        {/* FontAwesome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FontAwesome</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon family="FontAwesome" name="bell" size={32} color="#FF6B6B" />
              <Text style={styles.iconLabel}>bell</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="FontAwesome" name="user" size={32} color="#FF6B6B" />
              <Text style={styles.iconLabel}>user</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="FontAwesome" name="heart" size={32} color="#FF6B6B" />
              <Text style={styles.iconLabel}>heart</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="FontAwesome" name="star" size={32} color="#FF6B6B" />
              <Text style={styles.iconLabel}>star</Text>
            </View>
          </View>
        </View>

        {/* Material Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material Icons</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon family="MaterialIcons" name="notifications" size={32} color="#51CF66" />
              <Text style={styles.iconLabel}>notifications</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="MaterialIcons" name="home" size={32} color="#51CF66" />
              <Text style={styles.iconLabel}>home</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="MaterialIcons" name="send" size={32} color="#51CF66" />
              <Text style={styles.iconLabel}>send</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="MaterialIcons" name="check-circle" size={32} color="#51CF66" />
              <Text style={styles.iconLabel}>check-circle</Text>
            </View>
          </View>
        </View>

        {/* Feather */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feather Icons</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon family="Feather" name="bell" size={32} color="#FAB005" />
              <Text style={styles.iconLabel}>bell</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Feather" name="message-circle" size={32} color="#FAB005" />
              <Text style={styles.iconLabel}>message-circle</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Feather" name="user" size={32} color="#FAB005" />
              <Text style={styles.iconLabel}>user</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="Feather" name="heart" size={32} color="#FAB005" />
              <Text style={styles.iconLabel}>heart</Text>
            </View>
          </View>
        </View>

        {/* AntDesign */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ant Design Icons</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon family="AntDesign" name="notification" size={32} color="#9775FA" />
              <Text style={styles.iconLabel}>notification</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="AntDesign" name="home" size={32} color="#9775FA" />
              <Text style={styles.iconLabel}>home</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="AntDesign" name="user" size={32} color="#9775FA" />
              <Text style={styles.iconLabel}>user</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon family="AntDesign" name="setting" size={32} color="#9775FA" />
              <Text style={styles.iconLabel}>setting</Text>
            </View>
          </View>
        </View>

        {/* Exemplo de uso em botões */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exemplo em Botões</Text>
          <View style={styles.buttonRow}>
            <View style={[styles.button, styles.primaryButton]}>
              <Icon family="Ionicons" name="send" size={20} color="#fff" />
              <Text style={styles.buttonText}>Enviar</Text>
            </View>
            <View style={[styles.button, styles.successButton]}>
              <Icon family="MaterialIcons" name="check" size={20} color="#fff" />
              <Text style={styles.buttonText}>Confirmar</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '22%',
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
  },
  successButton: {
    backgroundColor: '#51CF66',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IconGalleryScreen;
