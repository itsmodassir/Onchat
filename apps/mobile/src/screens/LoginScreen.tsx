import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async () => {
    try {
      const { data } = await authApi.login({ email, password });
      setUser(data.user);
      setToken(data.token);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Onchat</Text>
        <Text style={styles.subtitle}>Join the conversation</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#818CF8', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 40 },
  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    color: '#F8FAFC',
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  link: { color: '#94A3B8', textAlign: 'center', marginTop: 25, fontSize: 15 },
  linkBold: { color: '#818CF8', fontWeight: 'bold' },
});

export default LoginScreen;
