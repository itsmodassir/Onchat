import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Alert, Image, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, User, FileText, Mail, Bell, 
  Volume2, Lock, ShieldCheck, Info, LogOut, ChevronRight, CheckCircle2, Pencil 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser, logout } = useAuthStore();

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
      const updated = await authApi.updateProfile({
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

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarBlock}>
          <Image
            source={{ uri: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}` }}
            style={styles.avatar}
          />
          <Text style={styles.avatarName}>{user?.name || 'User'}</Text>
          <Text style={styles.avatarId}>ID: {user?.shortId || user?.id?.substring(0, 8)}</Text>
        </View>

        <Section title="Profile" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><User size={20} color="#00C1BB" /></View>
            <Text style={styles.rowLabel}>Display Name</Text>
            {editName ? (
              <View style={styles.inlineEdit}>
                <TextInput style={styles.inlineInput} value={nameVal} onChangeText={setNameVal} autoFocus />
                <TouchableOpacity onPress={() => saveField('name')}><CheckCircle2 size={22} color="#22c55e" /></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditName(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rowValue}>{user?.name || '—'}</Text>
                <Pencil size={14} color="#94a3b8" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><FileText size={20} color="#00C1BB" /></View>
            <Text style={styles.rowLabel}>Bio</Text>
            {editBio ? (
              <View style={styles.inlineEdit}>
                <TextInput style={styles.inlineInput} value={bioVal} onChangeText={setBioVal} autoFocus />
                <TouchableOpacity onPress={() => saveField('bio')}><CheckCircle2 size={22} color="#22c55e" /></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditBio(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rowValue} numberOfLines={1}>{user?.bio || 'Add a bio...'}</Text>
                <Pencil size={14} color="#94a3b8" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Mail size={20} color="#00C1BB" /></View>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || '—'}</Text>
          </View>
        </View>

        <Section title="Notifications" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Bell size={20} color="#00C1BB" /></View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Push Notifications</Text>
            <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: '#334155', true: '#00C1BB' }} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Volume2 size={20} color="#00C1BB" /></View>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Sound Effects</Text>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: '#334155', true: '#00C1BB' }} />
          </View>
        </View>

        <Section title="Account" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => (navigation as any).navigate('ForgotPassword')}>
             <View style={styles.rowIcon}><Lock size={20} color="#00C1BB" /></View>
             <Text style={styles.rowLabel}>Change Password</Text>
             <ChevronRight size={16} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
             <View style={styles.rowIcon}><ShieldCheck size={20} color="#00C1BB" /></View>
             <Text style={styles.rowLabel}>Privacy Policy</Text>
             <ChevronRight size={16} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.row}>
             <View style={styles.rowIcon}><Info size={20} color="#00C1BB" /></View>
             <Text style={styles.rowLabel}>App Version</Text>
             <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 20 }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
             <View style={[styles.rowIcon, { backgroundColor: '#fee2e2' }]}><LogOut size={20} color="#ef4444" /></View>
             <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#00C1BB' },
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
});

export default SettingsScreen;
