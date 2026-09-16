import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Employee } from '../types/task';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  X,
  Users,
  AlertCircle,
} from '../components/Icon';
import { blockUserAPI, unblockUserAPI, removeUser } from '../services/authApi';
import { AppHeader } from '../components/AppHeader';
import { AddMemberModal } from '../components/AddMemberModal';
import { EmployeeProfileModal } from '../components/EmployeeProfileModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';

export const EmployeesScreen = ({ navigation }: any) => {
  const { employees, loading, refreshTasks } = useTasks();
  const { user: currentUser } = useAuth();
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfileEmp, setSelectedProfileEmp] = useState<Employee | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEditEmp, setSelectedEditEmp] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || isSuperAdmin;

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        (emp.designation && emp.designation.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  // Actions
  const handleViewProfile = (emp: Employee) => {
    setSelectedProfileEmp(emp);
    setIsProfileModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEditEmp(emp);
    setIsEditModalOpen(true);
  };

  const handleToggleBlock = (emp: Employee) => {
    const isBlocked = emp.isBlocked;
    const actionText = isBlocked ? 'Unblock' : 'Block';
    const message = isBlocked
      ? `Are you sure you want to unblock ${emp.name}? They will regain access.`
      : `Are you sure you want to block ${emp.name}? They will lose access.`;

    Alert.alert(`${actionText} Team Member`, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: actionText,
        style: isBlocked ? 'default' : 'destructive',
        onPress: async () => {
          try {
            if (isBlocked) {
              await unblockUserAPI(emp.id);
            } else {
              await blockUserAPI(emp.id);
            }
            await refreshTasks();
          } catch (err: any) {
            Alert.alert('Action Failed', err.message || 'Unable to update status.');
          }
        },
      },
    ]);
  };

  const handleRemoveUser = (emp: Employee) => {
    Alert.alert('Remove Member', `Are you sure you want to remove ${emp.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeUser(emp.id);
            await refreshTasks();
          } catch (err: any) {
            Alert.alert('Removal Failed', err.message || 'Unable to remove member.');
          }
        },
      },
    ]);
  };

  const renderEmployeeCard = ({ item }: { item: Employee }) => {
    const targetIsAdminOrSuper = item.role === 'admin' || item.role === 'superadmin';
    const canEdit = isAdmin && (item.role !== 'superadmin' || item.id === currentUser?.id);
    const canRemove = item.id !== currentUser?.id && (isSuperAdmin || (isAdmin && !targetIsAdminOrSuper));
    const canBlock = canRemove;

    const designationText =
      item.designation ||
      (item.role === 'superadmin' ? 'CEO' : item.role === 'admin' ? 'Admin' : 'Employee');

    const roleTypeText =
      item.role === 'user' || item.role === 'member' ? 'Employee' : item.role === 'superadmin' ? 'Superadmin' : item.role?.toUpperCase();

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
          item.isBlocked && styles.cardBlocked,
        ]}
      >
        {/* Card Top: Avatar + Name + Email */}
        <View style={styles.cardTop}>
          <TouchableOpacity onPress={() => handleViewProfile(item)} activeOpacity={0.7} style={styles.avatarWrap}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarBubble, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}>
                <Text style={styles.avatarText}>
                  {item.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.nameEmailCol}>
            <TouchableOpacity onPress={() => handleViewProfile(item)} activeOpacity={0.7}>
              <Text style={[styles.empName, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.empEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.email}
            </Text>
            {item.mobileNumber && (
              <View style={styles.phoneRow}>
                <Phone color={colors.textSecondary} size={11} style={{ marginRight: 4 }} />
                <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{item.mobileNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card Middle: Designation & Role Badges (Exact Web Parity) */}
        <View style={[styles.badgesSection, { borderTopColor: colors.borderColor, borderBottomColor: colors.borderColor }]}>
          {/* Designation Badge (Purple) */}
          <View style={styles.badgeColumn}>
            <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>DESIGNATION</Text>
            <View
              style={[
                styles.designationPill,
                {
                  backgroundColor: isDark ? '#581c8730' : '#f3e8ff',
                  borderColor: isDark ? '#7e22ce' : '#d8b4fe',
                },
              ]}
            >
              <Text style={[styles.designationText, { color: isDark ? '#c084fc' : '#7e22ce' }]} numberOfLines={1}>
                {designationText}
              </Text>
            </View>
          </View>

          {/* Role Type Badge (Amber) */}
          <View style={styles.badgeColumn}>
            <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>ROLE TYPE</Text>
            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor: isDark ? '#78350f30' : '#fef3c7',
                  borderColor: isDark ? '#b45309' : '#fde68a',
                },
              ]}
            >
              <Text style={[styles.roleText, { color: isDark ? '#fbbf24' : '#b45309' }]} numberOfLines={1}>
                {roleTypeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Bottom: 4 Action Buttons (Exact Web Parity) */}
        <View style={styles.actionsRow}>
          {/* 1. View Profile (Eye - Emerald) */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? '#064e3b25' : '#ecfdf5', borderColor: '#10b98150' }]}
            onPress={() => handleViewProfile(item)}
            activeOpacity={0.7}
          >
            <Eye color={isDark ? '#34d399' : '#059669'} size={15} style={{ marginRight: 4 }} />
            <Text style={[styles.actionText, { color: isDark ? '#34d399' : '#059669' }]}>View</Text>
          </TouchableOpacity>

          {/* 2. Edit (Pencil - Blue) */}
          {isAdmin && canEdit && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? '#1e3a8a25' : '#eff6ff', borderColor: '#3b82f650' }]}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.7}
            >
              <Pencil color={isDark ? '#60a5fa' : '#2563eb'} size={15} style={{ marginRight: 4 }} />
              <Text style={[styles.actionText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>Edit</Text>
            </TouchableOpacity>
          )}

          {/* 3. Block / Unblock (Ban / CheckCircle2 - Red/Green) */}
          {isAdmin && canBlock && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                item.isBlocked
                  ? { backgroundColor: isDark ? '#064e3b25' : '#ecfdf5', borderColor: '#10b98150' }
                  : { backgroundColor: isDark ? '#450a0a25' : '#fef2f2', borderColor: '#ef444450' },
              ]}
              onPress={() => handleToggleBlock(item)}
              activeOpacity={0.7}
            >
              {item.isBlocked ? (
                <>
                  <CheckCircle2 color="#10b981" size={15} style={{ marginRight: 4 }} />
                  <Text style={[styles.actionText, { color: '#10b981' }]}>Unblock</Text>
                </>
              ) : (
                <>
                  <Ban color="#ef4444" size={15} style={{ marginRight: 4 }} />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Block</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* 4. Remove / Delete (Trash - Red) */}
          {isAdmin && canRemove && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? '#450a0a25' : '#fef2f2', borderColor: '#ef444450' }]}
              onPress={() => handleRemoveUser(item)}
              activeOpacity={0.7}
            >
              <Trash2 color="#ef4444" size={15} style={{ marginRight: 4 }} />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader title="ETM" subtitle="Workspace" navigation={navigation} />

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        renderItem={renderEmployeeCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshTasks} tintColor={colors.accent} />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* ── 1. TITLE BANNER & + ADD MEMBER BUTTON (Exact Web Parity) ── */}
            <View style={styles.titleBannerRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>Team Members</Text>
                <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
                  Manage designations, workspace roles, and employee records.
                </Text>
              </View>
            </View>

            {/* Top Action Button (+ Add Member) */}
            {isAdmin && (
              <View style={styles.topActionRow}>
                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => setIsAddModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Plus color="#ffffff" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.addMemberText}>+ Add Member</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── 2. SEARCH BAR & SHOWING COUNT (Exact Web Parity) ── */}
            <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Search color={colors.textSecondary} size={18} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search team members..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <X color={colors.textSecondary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* Showing Count Row */}
            <View style={styles.countRow}>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                Showing <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{filteredEmployees.length}</Text> of{' '}
                <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{employees.length}</Text> members
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Users color={colors.textSecondary} size={40} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Team Members Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No employees match your search query. Try typing a different name or email.
            </Text>
          </View>
        }
      />

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refreshTasks()}
      />

      {/* Profile Details Modal */}
      <EmployeeProfileModal
        visible={isProfileModalOpen}
        employee={selectedProfileEmp}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileEmp(null);
        }}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        visible={isEditModalOpen}
        employee={selectedEditEmp}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditEmp(null);
        }}
        onSuccess={() => refreshTasks()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  titleBannerRow: {
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addMemberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  countRow: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  countText: {
    fontSize: 11,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardBlocked: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    marginRight: 10,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  nameEmailCol: {
    flex: 1,
  },
  empName: {
    fontSize: 15,
    fontWeight: '800',
  },
  empEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  badgeColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  badgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  designationPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '100%',
  },
  designationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '100%',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
