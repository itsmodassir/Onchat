import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { authApi } from '../utils/api';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email first.');
    try {
      await authApi.sendOtp(email, 'RESET_PASSWORD');
      setOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      Alert.alert('Success', 'Verification code sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert('Error', 'OTP and New Password are required.');
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      Alert.alert('Success', 'Password updated! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Onchat</Text>
        <Text style={styles.subtitle}>Reset your password</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <View style={styles.emailContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Verification Code"
              placeholderTextColor="#888"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (countdown > 0) && styles.buttonDisabled]} 
              onPress={handleSendOtp}
              disabled={countdown > 0}
            >
              <Text style={styles.sendButtonText}>
                {countdown > 0 ? `${countdown}s` : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#888"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to Login</Text>
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#818CF8',
    borderRadius: 8,
    marginRight: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
  button: {
    backgroundColor: '#818CF8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  link: { color: '#818CF8', textAlign: 'center', marginTop: 25, fontSize: 15, fontWeight: '500' },
});

export default ForgotPasswordScreen;
