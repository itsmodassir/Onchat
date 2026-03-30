import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Send, ChevronLeft } from 'lucide-react-native';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const SOCKET_URL = 'https://api.onchat.fun';

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { recipientId, recipientName } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('register', user?.id);

    socketRef.current.on('new-private-message', (data: any) => {
      if (data.senderId === recipientId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socketRef.current.on('private-message-sent', (data: any) => {
      if (data.receiverId === recipientId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/social/history/${recipientId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === '' || !user?.id) return;

    const messageData = {
      toUserId: recipientId,
      fromUserId: user.id,
      content: inputText,
    };

    socketRef.current.emit('send-private-message', messageData);
    setInputText('');
  };

  const renderMessage = ({ item }: any) => (
    <View style={[styles.messageBubble, item.senderId === user?.id ? styles.myMessage : styles.theirMessage]}>
      <Text style={[styles.messageText, item.senderId === user?.id ? styles.myMessageText : styles.theirMessageText]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipientName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { height: 60, backgroundColor: '#00C1BB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  messageList: { padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#00C1BB' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#1E293B' },
  messageText: { fontSize: 16 },
  myMessageText: { color: '#FFF' },
  theirMessageText: { color: '#F8FAFC' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#1E293B', alignItems: 'center' },
  input: { flex: 1, height: 45, backgroundColor: '#0F172A', borderRadius: 22.5, paddingHorizontal: 20, color: '#F8FAFC', marginRight: 10 },
  sendButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#00C1BB', justifyContent: 'center', alignItems: 'center' },
});

export default ChatDetailScreen;
