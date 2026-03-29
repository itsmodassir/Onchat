import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { socialApi } from '../utils/api';
import { Check, ChevronLeft } from 'lucide-react-native';

const INTERESTS = [
  'Music', 'Games', 'Dating', 'Chat', 'Spiritual', 
  'Politics', 'Education', 'Technology', 'Sports', 
  'Movies', 'Anime', 'Travel', 'Food', 'Fitness'
];

const InterestsScreen = ({ navigation }: any) => {
  const { token, user, setUser } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(user?.interests || []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else {
      setSelected([...selected, interest]);
    }
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const { data } = await socialApi.updateInterests(token!, selected);
      setUser(data);
      Alert.alert('Success', 'Interests updated!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interests</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What do you like?</Text>
        <Text style={styles.subtitle}>Select your interests to get better room recommendations.</Text>

        <View style={styles.tagContainer}>
          {INTERESTS.map(interest => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.tag, isSelected && styles.selectedTag]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>{interest}</Text>
                {isSelected && <Check size={14} color="#FFF" style={{ marginLeft: 5 }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Preferences'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 25 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#94A3B8', fontSize: 16, marginBottom: 30 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  selectedTag: { backgroundColor: '#00C1BB', borderColor: '#00C1BB' },
  tagText: { color: '#94A3B8', fontSize: 16 },
  selectedTagText: { color: '#FFF', fontWeight: 'bold' },
  footer: { padding: 25, borderTopWidth: 1, borderTopColor: '#1E293B' },
  saveBtn: {
    backgroundColor: '#00C1BB',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default InterestsScreen;
