import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, 
  UploadCloud, 
  Trash2, 
  HardDrive, 
  FileText, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { storageApi } from '../utils/api';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 60) / COLUMN_COUNT;

const StorageManagerScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, mediaRes] = await Promise.all([
        storageApi.getStats(),
        storageApi.getMedia()
      ]);
      setStats(statsRes.data);
      setMedia(mediaRes.data);
    } catch (error) {
      console.error('Failed to fetch storage data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const fileToUpload = {
          uri: asset.uri,
          name: asset.fileName || 'upload.jpg',
          type: asset.mimeType || 'image/jpeg',
        };

        await storageApi.upload(fileToUpload);
        Alert.alert('Success', 'Media uploaded to your virtual storage!');
        fetchData(); // Refresh
      } catch (error: any) {
        Alert.alert('Upload Failed', error.response?.data?.error || 'Something went wrong');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to remove this item from your storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await storageApi.deleteMedia(id);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete media');
            }
          } 
        }
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C1BB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Storage</Text>
        <TouchableOpacity onPress={handleUpload} disabled={uploading}>
          {uploading ? <ActivityIndicator size="small" color="#00C1BB" /> : <UploadCloud color="#00C1BB" size={26} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Storage Info Card */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.statsCard}
        >
          <View style={styles.statsHeader}>
            <View style={styles.iconCircle}>
              <HardDrive color="#00C1BB" size={24} />
            </View>
            <View style={styles.statsHeaderText}>
              <Text style={styles.statsLabel}>Total Storage</Text>
              <Text style={styles.statsValue}>10.0 GB</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#00C1BB', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${stats?.percentage || 0}%` }]}
              />
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.usageText}>{formatBytes(stats?.used || 0)} used</Text>
              <Text style={styles.percentageText}>{stats?.percentage?.toFixed(1)}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Media Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Media</Text>
          <Text style={styles.itemCount}>{media.length} items</Text>
        </View>

        {media.length === 0 ? (
          <View style={styles.emptyState}>
            <ImageIcon color="#334155" size={64} style={{ marginBottom: 15 }} />
            <Text style={styles.emptyText}>No media found</Text>
            <Text style={styles.emptySubtext}>Upload photos or moments to your private storage.</Text>
            <TouchableOpacity style={styles.uploadBtnLarge} onPress={handleUpload}>
               <Text style={styles.uploadBtnText}>Upload First File</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {media.map((item) => (
              <View key={item.id} style={styles.mediaItem}>
                <Image 
                  source={{ uri: `https://api.onchat.fun${item.path}` }} 
                  style={styles.mediaThumb}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 color="#FFF" size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.noticeCard}>
            <AlertCircle color="#64748B" size={18} />
            <Text style={styles.noticeText}>
              All files are stored in an isolated virtual filesystem exclusive to your account.
            </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155'
  },
  statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00C1BB20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  statsHeaderText: {},
  statsLabel: { color: '#94A3B8', fontSize: 14 },
  statsValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  progressContainer: {},
  progressBar: {
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: { height: '100%' },
  progressDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  usageText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  percentageText: { color: '#94A3B8', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  itemCount: { color: '#64748B', fontSize: 14 },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  emptySubtext: { color: '#64748B', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  uploadBtnLarge: { backgroundColor: '#00C1BB', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, marginTop: 25 },
  uploadBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B'
  },
  mediaThumb: { width: '100%', height: '100%' },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444CC',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E293B50',
      padding: 15,
      borderRadius: 16,
      marginTop: 30,
      borderWidth: 1,
      borderColor: '#33415550'
  },
  noticeText: { color: '#64748B', fontSize: 12, flex: 1, marginLeft: 10, lineHeight: 18 }
});

export default StorageManagerScreen;
