import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Switch, Alert, Image, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, token, setUser, logout } = useAuthStore();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [editName, setEditName] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name || '');
  const [bioVal, setBioVal] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const saveField = async (field: 'name' | 'bio') => {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile(token || '', {
        [field]: field === 'name' ? nameVal : bioVal,
      });
      setUser(updated.data);
      if (field === 'name') setEditName(false);
      else setEditBio(false);
      Alert.alert('Saved', `${field === 'name' ? 'Name' : 'Bio'} updated!`);
    } catch {
      Alert.alert('Error', 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const Section = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const Row = ({
    icon, label, value, onPress, danger,
  }: {
    icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, danger && { backgroundColor: '#fee2e2' }]}>
        <Ionicons name={icon as any} size={20} color={danger ? '#ef4444' : '#00C1BB'} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: '#ef4444' }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !danger && <Ionicons name="chevron-forward" size={16} color="#94a3b8" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBlock}>
          <Image
            source={{ uri: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}` }}
            style={styles.avatar}
          />
          <Text style={styles.avatarName}>{user?.name || 'User'}</Text>
          <Text style={styles.avatarId}>ID: {user?.shortId || user?.id?.substring(0, 8)}</Text>
        </View>

        {/* Profile */}
        <Section title="Profile" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="person-outline" size={20} color="#00C1BB" />
            </View>
            <Text style={styles.rowLabel}>Display Name</Text>
            {editName ? (
              <View style={styles.inlineEdit}>
                <TextInput
                  style={styles.inlineInput}
                  value={nameVal}
                  onChangeText={setNameVal}
                  autoFocus
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => saveField('name')} disabled={saving}>
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditName(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rowValue}>{user?.name || '—'}</Text>
                <Ionicons name="pencil-outline" size={14} color="#94a3b8" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="document-text-outline" size={20} color="#00C1BB" />
            </View>
            <Text style={styles.rowLabel}>Bio</Text>
            {editBio ? (
              <View style={styles.inlineEdit}>
                <TextInput
                  style={styles.inlineInput}
                  value={bioVal}
                  onChangeText={setBioVal}
                  autoFocus
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => saveField('bio')} disabled={saving}>
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditBio(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rowValue} numberOfLines={1}>{user?.bio || 'Add a bio...'}</Text>
                <Ionicons name="pencil-outline" size={14} color="#94a3b8" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>
          <Row icon="mail-outline" label="Email" value={user?.email || '—'} />
        </View>

        {/* Notifications */}
        <Section title="Notifications" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="notifications-outline" size={20} color="#00C1BB" /></View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Push Notifications</Text>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: '#334155', true: '#00C1BB' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name="volume-high-outline" size={20} color="#00C1BB" /></View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#334155', true: '#00C1BB' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Stats */}
        <Section title="Account Stats" />
        <View style={styles.statsCard}>
          {[
            { label: 'Followers', value: user?._count?.followers ?? 0 },
            { label: 'Following', value: user?._count?.following ?? 0 },
            { label: 'Rooms', value: user?._count?.rooms ?? 0 },
            { label: 'Coins', value: user?.coins ?? 0 },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Account */}
        <Section title="Account" />
        <View style={styles.card}>
          <Row
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => (navigation as any).navigate('ForgotPassword')}
          />
          <Row
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon.')}
          />
          <Row
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />
        </View>

        <View style={styles.card}>
          <Row icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#00C1BB',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatarBlock: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#00C1BB', backgroundColor: '#1e293b' },
  avatarName: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  avatarId: { color: '#64748b', fontSize: 12, marginTop: 2 },
  sectionHeader: { color: '#64748b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginHorizontal: 16, marginTop: 20, marginBottom: 6, letterSpacing: 1 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#00C1BB20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowLabel: { flex: 1, color: '#e2e8f0', fontSize: 15 },
  rowValue: { color: '#64748b', fontSize: 14, marginRight: 6 },
  inlineEdit: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inlineInput: { flex: 1, color: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#00C1BB', marginRight: 8, paddingVertical: 2, fontSize: 14 },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1e293b', borderRadius: 12, marginHorizontal: 16, padding: 16 },
  statItem: { alignItems: 'center' },
  statVal: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold' },
  statLbl: { color: '#64748b', fontSize: 12, marginTop: 2 },
});

export default SettingsScreen;
