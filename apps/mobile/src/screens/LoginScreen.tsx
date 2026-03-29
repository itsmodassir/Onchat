import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';
import { Mail, Lock, Key, ShieldCheck } from 'lucide-react-native';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Focus States
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const { setUser, setToken } = useAuthStore();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Verification Error', 'Please enter your identity UID (Email).');
    try {
      await authApi.sendOtp(email, 'LOGIN');
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
      Alert.alert('Protocol Handshake', 'Verification code initiated. Check your inbox.');
    } catch (error: any) {
      Alert.alert('Network Rejection', error.response?.data?.error || 'Failed to send verification code');
    }
  };

  const handleLogin = async () => {
    // Button Animation
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    try {
      const payload: any = { email };
      if (useOtp) {
        if (!otp) return Alert.alert('Access Denied', 'Please enter the verification code.');
        payload.otp = otp;
      } else {
        if (!password) return Alert.alert('Access Denied', 'Please enter your secure key.');
        payload.password = password;
      }

      const { data } = await authApi.login(payload);
      setUser(data.user);
      setToken(data.token);
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck color="#FFFFFF" size={32} strokeWidth={2.5} />
            </View>
            <Text style={styles.logo}>Platform Access</Text>
            <Text style={styles.subtitle}>SECURE INTERNAL CONSOLE</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>IDENTITY UID</Text>
              <View style={[styles.inputGroup, emailFocused && styles.inputGroupFocused]}>
                <Mail color={emailFocused ? '#818CF8' : '#64748B'} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="admin@onchat.fun"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {useOtp ? (
              /* OTP Input */
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
                <View style={styles.otpRow}>
                  <View style={[styles.inputGroup, { flex: 1 }, otpFocused && styles.inputGroupFocused]}>
                    <Key color={otpFocused ? '#818CF8' : '#64748B'} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor="#475569"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      onFocus={() => setOtpFocused(true)}
                      onBlur={() => setOtpFocused(false)}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.sendButton, (countdown > 0 || !email) && styles.sendButtonDisabled]} 
                    onPress={handleSendOtp}
                    disabled={countdown > 0 || !email}
                  >
                    <Text style={[styles.sendButtonText, (countdown > 0 || !email) && styles.sendButtonTextDisabled]}>
                      {countdown > 0 ? `${countdown}s` : 'SEND OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Password Input */
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>SECURITY KEY</Text>
                <View style={[styles.inputGroup, passwordFocused && styles.inputGroupFocused]}>
                  <Lock color={passwordFocused ? '#818CF8' : '#64748B'} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity onPress={() => setUseOtp(!useOtp)} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>
                {useOtp ? 'SWITCH TO KEY AUTHENTICATION' : 'SWITCH TO OTP AUTHENTICATION'}
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity style={styles.submitButton} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.submitButtonText}>INITIALIZE HANDSHAKE</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>

          {/* Footer Area */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerRow}>
              <Text style={styles.footerText}>Not authorized? </Text>
              <Text style={styles.footerTextBold}>REQUEST ACCESS</Text>
            </TouchableOpacity>
            {!useOtp && (
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.footerRowAuth}>
                <Text style={styles.footerTextLight}>Reset Security Key</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Deep slate-950, matches admin console
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#4F46E5', // Indigo-600
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B', // slate-500
    letterSpacing: 3,
  },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // slate-800 translucent
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8', // slate-400
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    height: 64,
  },
  inputGroupFocused: {
    borderColor: '#6366F1', // indigo-500
    backgroundColor: '#1E293B', // slate-800
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  sendButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600 very light
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#0F172A',
    borderColor: '#334155', // slate-700
  },
  sendButtonText: {
    color: '#818CF8', // indigo-400
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sendButtonTextDisabled: {
    color: '#475569',
  },
  toggleBtn: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  toggleText: {
    color: '#818CF8', // indigo-400
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  submitButton: {
    backgroundColor: '#4F46E5', // indigo-600
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRowAuth: {
    opacity: 0.8,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  footerTextBold: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerTextLight: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
