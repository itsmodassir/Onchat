import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const FamilyScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [family, setFamily] = useState<any>(null);

  useEffect(() => {
    if (user?.familyId) {
      fetchFamily(user.familyId);
    }
  }, [user?.familyId]);

  const fetchFamily = async (id: string) => {
    try {
      const response = await api.get(`/shop/family/${id}`);
      setFamily(response.data);
    } catch (error) {
      console.error('Fetch family error:', error);
      // Fallback state is handled by the initial null
    }
  };

  if (!family) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Family</Text>
            <TouchableOpacity>
                <Ionicons name="search" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
        <View style={styles.emptyFamily}>
           <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1189/1189132.png' }} style={styles.emptyIcon} />
           <Text style={styles.emptyText}>You are not in a family yet</Text>
           <TouchableOpacity style={styles.createButton}>
             <Text style={styles.createButtonText}>Create Family</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: family.image || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800' }} 
        style={styles.coverImage} 
      />
      <View style={styles.familyInfo}>
        <View style={styles.familyMain}>
           <Image source={{ uri: family.image || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400' }} style={styles.familyLogo} />
           <View style={styles.familyDetail}>
             <Text style={styles.familyName}>{family.name}</Text>
             <Text style={styles.familyId}>ID:{family.id.slice(0, 8)}</Text>
           </View>
           <TouchableOpacity style={styles.rankBadge}>
              <Text style={styles.rankText}>Gold III</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Members: <Text style={styles.statsValue}>{family.members.length}/450</Text></Text>
        </View>

        <View style={styles.levelCard}>
           <View style={styles.levelHeader}>
             <Text style={styles.levelTitle}>Gold III</Text>
             <Text style={styles.expText}>{family.exp}/6630000</Text>
           </View>
           <View style={styles.progressBar}>
              <View style={[styles.progress, { width: '52%' }]} />
           </View>
           <Text style={styles.rankLabel}>Last Month Rank: <Text style={styles.rankValue}>Top 2</Text></Text>
        </View>

        <View style={styles.leaderRow}>
           <Image source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' }} style={styles.leaderAvatar} />
           <Text style={styles.leaderName}>Family Leader</Text>
        </View>

        <View style={styles.checkInCard}>
           <View style={styles.checkInHeader}>
             <View style={styles.checkInLeft}>
               <Ionicons name="calendar" size={20} color="#FF6F00" />
               <Text style={styles.checkInTitle}>Check In</Text>
             </View>
             <TouchableOpacity>
               <Text style={styles.taskLabel}>Task rewards {'>'}</Text>
             </TouchableOpacity>
           </View>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysList}>
              {[9, 10, 11, 12, 13, 14].map((day) => (
                <View key={day} style={styles.dayItem}>
                   <View style={[styles.checkCircle, day < 13 && styles.checkedCircle]}>
                      {day < 14 ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Ionicons name="gift" size={16} color="#FF6F00" />}
                   </View>
                   <Text style={styles.dayText}>day {day}</Text>
                </View>
              ))}
           </ScrollView>
           <TouchableOpacity style={styles.checkInButton}>
             <Text style={styles.checkInButtonText}>Checked In</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Family Star</Text>
        <View style={styles.starsRow}>
           {[1, 2, 3].map((pos) => (
             <View key={pos} style={[styles.starCard, { backgroundColor: pos === 1 ? '#FFB74D' : pos === 2 ? '#64B5F6' : '#FFD54F' }]}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' }} style={styles.starAvatar} />
                <Text style={styles.starName}>User {pos}</Text>
             </View>
           ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  familyInfo: {
    marginTop: -40,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  familyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  familyDetail: {
    flex: 1,
    marginLeft: 12,
  },
  familyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  familyId: {
    fontSize: 12,
    color: '#666',
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsRow: {
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  levelCard: {
    backgroundColor: '#BBDEFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  expText: {
    fontSize: 12,
    color: '#1565C0',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(21, 101, 192, 0.2)',
    borderRadius: 5,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#1565C0',
    borderRadius: 5,
  },
  rankLabel: {
    fontSize: 12,
    color: '#1565C0',
  },
  rankValue: {
    fontWeight: 'bold',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  leaderName: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
  checkInCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  taskLabel: {
    color: '#F57C00',
    fontSize: 12,
  },
  daysList: {
    marginBottom: 16,
  },
  dayItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkedCircle: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFD54F',
  },
  dayText: {
    fontSize: 10,
    color: '#666',
  },
  checkInButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  starCard: {
    width: (width - 48) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  starAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  starName: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyFamily: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FamilyScreen;
