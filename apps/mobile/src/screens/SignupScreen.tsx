import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { authApi } from '../utils/api';
import { User, Mail, Lock, Key, Target } from 'lucide-react-native';

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Focus States
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Verification Error', 'Please enter your identity UID (Email).');
    try {
      await authApi.sendOtp(email, 'SIGNUP');
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

  const handleSignup = async () => {
    if (!name || !email || !password || !otp) {
      return Alert.alert('Access Denied', 'All identity fields are explicitly required.');
    }

    // Button Animation
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    try {
      await authApi.signup({ name, email, password, otp });
      Alert.alert('Clearance Granted', 'Identity successfully established. Proceeding to Secure Login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.response?.data?.error || 'Could not establish identity.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Target color="#FFFFFF" size={32} strokeWidth={2.5} />
            </View>
            <Text style={styles.logo}>Establish Origin</Text>
            <Text style={styles.subtitle}>SECURE ACCOUNT CREATION</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            
            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>IDENTIFIER ALIAS</Text>
              <View style={[styles.inputGroup, nameFocused && styles.inputGroupFocused]}>
                <User color={nameFocused ? '#818CF8' : '#64748B'} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

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

            {/* OTP & Password Row for Compact Layout */}
            <View style={styles.row}>
              {/* OTP Input */}
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.inputLabel}>VERIFY CODE</Text>
                <View style={[styles.inputGroup, otpFocused && styles.inputGroupFocused]}>
                  <Key color={otpFocused ? '#818CF8' : '#64748B'} size={20} style={[styles.inputIcon, {marginRight: 10}]} />
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
              </View>

              {/* Password Input */}
              <View style={[styles.inputWrapper, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>SECURITY KEY</Text>
                <View style={[styles.inputGroup, passwordFocused && styles.inputGroupFocused]}>
                  <Lock color={passwordFocused ? '#818CF8' : '#64748B'} size={20} style={[styles.inputIcon, {marginRight: 10}]} />
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
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, (countdown > 0 || !email) && styles.sendButtonDisabled]} 
              onPress={handleSendOtp}
              disabled={countdown > 0 || !email}
            >
              <Text style={[styles.sendButtonText, (countdown > 0 || !email) && styles.sendButtonTextDisabled]}>
                {countdown > 0 ? `RETRANSMIT IN ${countdown}s` : 'REQUEST HANDSHAKE CODE'}
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSignup} activeOpacity={0.8}>
                <Text style={styles.submitButtonText}>FINALIZE PROTOCOL</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>

          {/* Footer Area */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerRow}>
              <Text style={styles.footerText}>Already secured? </Text>
              <Text style={styles.footerTextBold}>ACCESS ORIGIN</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24, // Slightly tighter padding due to extra fields
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4F46E5', // Indigo-600
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B', // slate-500
    letterSpacing: 3,
  },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // slate-800 translucent
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 28,
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
    paddingHorizontal: 16,
    height: 60,
  },
  inputGroupFocused: {
    borderColor: '#6366F1', // indigo-500
    backgroundColor: '#1E293B', // slate-800
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
  },
  sendButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)', // indigo-600 very light
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 32,
    marginTop: -8,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent', 
  },
  sendButtonText: {
    color: '#818CF8', // indigo-400
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sendButtonTextDisabled: {
    color: '#475569',
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
    marginTop: 40,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  }
});

export default SignupScreen;
