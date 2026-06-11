/**
 * Tela de Gerenciamento de Grupos
 * Permite criar, editar, deletar e notificar grupos
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../core/hooks/useAuth';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { GroupModal } from '../components/GroupModal';
import { NotifyGroupModal } from '../components/NotifyGroupModal';
import { theme } from '../../config/theme';
import { container } from '../../core/di/container';
import { Group, CreateGroupDTO } from '../../domain/entities/Group';
import Icon from '../../core/components/Icon';
import { getSessionErrorMessage } from '../../core/utils/errorHandler';

export const GroupsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await container.getAllGroupsUseCase.execute();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, []);

  const handleCreateGroup = () => {
    setSelectedGroup(undefined);
    setGroupModalVisible(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupModalVisible(true);
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o grupo "${group.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await container.deleteGroupUseCase.execute(group.id);
              Alert.alert('Sucesso', 'Grupo excluído com sucesso');
              loadGroups();
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Erro', getSessionErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const handleNotifyGroup = (group: Group) => {
    setSelectedGroup(group);
    setNotifyModalVisible(true);
  };

  const handleSubmitGroup = async (groupData: CreateGroupDTO) => {
    try {
      if (selectedGroup) {
        await container.updateGroupUseCase.execute({
          id: selectedGroup.id,
          ...groupData,
        });
        Alert.alert('Sucesso', 'Grupo atualizado com sucesso');
      } else {
        await container.createGroupUseCase.execute(groupData);
        Alert.alert('Sucesso', 'Grupo criado com sucesso');
      }
      loadGroups();
    } catch (error: any) {
      console.error('Error submitting group:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
    }
  };

  const handleSubmitNotification = async (title: string, body: string, link?: string, image?: any) => {
    if (!selectedGroup) return;

    try {
      const result = await container.notifyGroupUseCase.execute({
        groupId: selectedGroup.id,
        title,
        body,
        link,
        image,
      });
      Alert.alert(
        'Sucesso',
        `Notificação enviada para ${result.users_count} usuários (${result.tokens_count} dispositivos)`
      );
    } catch (error: any) {
      console.error('Error notifying group:', error);
      Alert.alert('Erro', getSessionErrorMessage(error));
    }
  };

  const renderGroup = (group: Group) => (
    <Card key={group.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <View style={styles.groupNameRow}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={[styles.visibilityBadge, group.isPublic ? styles.badgePublic : styles.badgePrivate]}>
              <Text style={styles.badgeText}>{group.isPublic ? 'Público' : 'Privado'}</Text>
            </View>
          </View>
          {group.description && (
            <Text style={styles.groupDescription}>{group.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.groupActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.notifyButton]}
          onPress={() => handleNotifyGroup(group)}
        >
          <Icon family="FontAwesome" name="bell" size={12} color="#fff" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Notificar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditGroup(group)}
        >
          <Icon family="FontAwesome" name="edit" size={12} color="#fff" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteGroup(group)}
        >
          <Icon family="FontAwesome" name="trash" size={12} color="#fff" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading && groups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando grupos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Grupos</Text>
        <CustomButton
          title="+ Novo Grupo"
          onPress={handleCreateGroup}
          noShadow
          style={styles.newButton}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum grupo cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Crie um grupo para começar a organizar usuários
            </Text>
          </Card>
        ) : (
          groups.map(renderGroup)
        )}
      </ScrollView>

      <GroupModal
        visible={groupModalVisible}
        onClose={() => setGroupModalVisible(false)}
        onSubmit={handleSubmitGroup}
        group={selectedGroup}
      />

      <NotifyGroupModal
        visible={notifyModalVisible}
        onClose={() => setNotifyModalVisible(false)}
        onSubmit={handleSubmitNotification}
        group={selectedGroup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary || '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  newButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  groupCard: {
    marginBottom: 16,
  },
  groupHeader: {
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  visibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePublic: {
    backgroundColor: '#dcfce7',
  },
  badgePrivate: {
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  groupDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  groupUsers: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionIcon: {},
  notifyButton: {
    backgroundColor: theme.colors.primary,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    textAlign: 'center',
  },
});
