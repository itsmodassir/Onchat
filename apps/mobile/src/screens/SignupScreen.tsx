import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { authApi } from '../utils/api';

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await authApi.signup({ name, email, password });
      Alert.alert('Success', 'Account created! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Onchat</Text>
        <Text style={styles.subtitle}>Create your profile</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
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

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
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
    backgroundColor: '#818CF8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  link: { color: '#94A3B8', textAlign: 'center', marginTop: 25, fontSize: 15 },
  linkBold: { color: '#818CF8', fontWeight: 'bold' },
});

export default SignupScreen;
