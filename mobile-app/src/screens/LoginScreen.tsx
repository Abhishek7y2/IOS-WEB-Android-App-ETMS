import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Fingerprint, Phone, ArrowLeft, Sun, Moon } from '../components/Icon';
import { checkBiometricSupport, authenticateWithBiometrics } from '../services/biometricService';
import { countries } from '../constants/countries';
import { validateMobileNumber } from '../utils/phoneValidator';
import { requestLoginOtp, loginWithOtp } from '../services/authApi';

type LoginMode = 'initial' | 'email' | 'phone';
type SubTab = 'password' | 'otp';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export const LoginScreen = ({ navigation }: any) => {
  const { login, loginWithMock, loading, error, clearError, persistAuth } = useAuth();
  const { colors, mode: themeMode, toggleTheme } = useTheme();

  const [mode, setMode] = useState<LoginMode>('initial');
  const [subTab, setSubTab] = useState<SubTab>('password');

  // Input states
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Country modal search
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // OTP states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Biometrics
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric Sign In');

  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const checkBio = async () => {
      const bio = await checkBiometricSupport();
      if (bio.hasHardware && bio.isEnrolled) {
        setBiometricAvailable(true);
        setBiometricLabel(`Sign In with ${bio.biometricType}`);
      }
    };
    checkBio();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const resetState = () => {
    clearError();
    setValidationError(null);
    setOtpSuccessMsg(null);
    setIsOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleBiometricAuth = async () => {
    clearError();
    const success = await authenticateWithBiometrics();
    if (success) {
      try {
        if (email && password) {
          await login({ email, password });
        } else {
          await loginWithMock('abhishek7y2@gmail.com');
        }
      } catch {
        await loginWithMock(email || 'abhishek7y2@gmail.com');
      }
    }
  };

  const handlePasswordLogin = async () => {
    clearError();
    setValidationError(null);

    let hasErr = false;
    if (mode === 'email') {
      if (!email.trim()) {
        setValidationError('Please enter an email address.');
        hasErr = true;
      } else if (!emailRegex.test(email.trim())) {
        setValidationError('Please enter a valid email address.');
        hasErr = true;
      }
    } else {
      if (!mobileNumber.trim()) {
        setValidationError('Please enter a mobile number.');
        hasErr = true;
      } else {
        const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];
        const mobErr = validateMobileNumber(mobileNumber, selectedCountry.iso);
        if (mobErr) {
          setValidationError(mobErr);
          hasErr = true;
        }
      }
    }

    if (!password) {
      setValidationError('Please enter your password.');
      hasErr = true;
    } else if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      hasErr = true;
    }

    if (hasErr) return;

    try {
      if (mode === 'email') {
        await login({ email: email.trim(), password });
      } else {
        await login({ mobileNumber: mobileNumber.trim(), countryCode, password });
      }
    } catch {
      // Handled in AuthContext
    }
  };

  const handleRequestOtp = async () => {
    clearError();
    setValidationError(null);

    if (mode === 'email') {
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setValidationError('Please enter a valid email address for OTP.');
        return;
      }
    } else {
      const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];
      const mobErr = validateMobileNumber(mobileNumber, selectedCountry.iso);
      if (mobErr) {
        setValidationError(mobErr);
        return;
      }
    }

    setOtpSending(true);
    try {
      const payload = mode === 'email' ? { email: email.trim() } : { mobileNumber: mobileNumber.trim(), countryCode };
      const res = await requestLoginOtp(payload);
      setOtpSuccessMsg(res.message);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(120);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send OTP code.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpDigitChange = (text: string, index: number) => {
    const cleanDigit = text.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    if (cleanDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpDigitKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    setValidationError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setValidationError('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (otpTimer <= 0) {
      setValidationError('OTP code has expired. Please request a new code.');
      return;
    }

    setOtpVerifying(true);
    try {
      const payload = mode === 'email' ? { email: email.trim(), otp: fullOtp } : { mobileNumber: mobileNumber.trim(), countryCode, otp: fullOtp };
      const res = await loginWithOtp(payload);
      await persistAuth(res.user, res.token.accessToken);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid OTP code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleMockLogin = async () => {
    clearError();
    setValidationError(null);
    await loginWithMock(email.trim() || 'abhishek7y2@gmail.com');
  };

  const filteredCountries = countries.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Top Bar with Theme Toggle */}
          <View style={styles.topBar}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {themeMode === 'dark' ? <Sun color="#f59e0b" size={18} /> : <Moon color="#6366f1" size={18} />}
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={[styles.logoBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LogIn color={colors.primary} size={28} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to your Employee Task Manager workspace</Text>
          </View>

          {/* Error Banner */}
          {(error || validationError) && (
            <View style={styles.errorBox}>
              <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error || validationError}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* INITIAL MODE SELECTION */}
            {mode === 'initial' && (
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  style={[styles.choiceBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => {
                    setMode('email');
                    setSubTab('password');
                    resetState();
                  }}
                  activeOpacity={0.8}
                >
                  <Mail color={colors.primary} size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.choiceBtnText, { color: colors.text }]}>Continue with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => {
                    setMode('phone');
                    setSubTab('password');
                    resetState();
                  }}
                  activeOpacity={0.8}
                >
                  <Phone color={colors.primary} size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.choiceBtnText, { color: colors.text }]}>Continue with Phone</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* EMAIL OR PHONE SIGN IN SCREEN */}
            {mode !== 'initial' && (
              <View>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => {
                    setMode('initial');
                    resetState();
                  }}
                >
                  <ArrowLeft color={colors.textMuted} size={16} style={{ marginRight: 4 }} />
                  <Text style={[styles.backLinkText, { color: colors.textMuted }]}>Back to options</Text>
                </TouchableOpacity>

                {/* Sub-tab switcher container removed as requested */}

                {/* SUB-TAB 1: PASSWORD LOGIN */}
                {subTab === 'password' && (
                  <View>
                    {mode === 'email' ? (
                      <View>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Mail color={colors.textMuted} size={20} style={styles.inputIcon} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="name@company.com"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                          />
                        </View>
                      </View>
                    ) : (
                      <View>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Mobile Number</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                          <TouchableOpacity
                            style={[styles.countryBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => setIsCountryModalOpen(true)}
                          >
                            <Text style={[styles.countryBtnText, { color: colors.text }]}>{countryCode}</Text>
                          </TouchableOpacity>

                          <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, flex: 1, marginBottom: 0 }]}>
                            <Phone color={colors.textMuted} size={20} style={styles.inputIcon} />
                            <TextInput
                              style={[styles.input, { color: colors.text }]}
                              placeholder="10-digit number"
                              placeholderTextColor={colors.textMuted}
                              keyboardType="phone-pad"
                              value={mobileNumber}
                              onChangeText={setMobileNumber}
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Lock color={colors.textMuted} size={20} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        {showPassword ? <EyeOff color={colors.textMuted} size={20} /> : <Eye color={colors.textMuted} size={20} />}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('ForgotPassword')}
                      style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
                      onPress={handlePasswordLogin}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* SUB-TAB 2: OTP LOGIN */}
                {subTab === 'otp' && (
                  <View>
                    {!isOtpSent ? (
                      <View>
                        {mode === 'email' ? (
                          <View>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Email Address for OTP</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                              <Mail color={colors.textMuted} size={20} style={styles.inputIcon} />
                              <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="name@company.com"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                              />
                            </View>
                          </View>
                        ) : (
                          <View>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Mobile Number for OTP</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                              <TouchableOpacity
                                style={[styles.countryBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                                onPress={() => setIsCountryModalOpen(true)}
                              >
                                <Text style={[styles.countryBtnText, { color: colors.text }]}>{countryCode}</Text>
                              </TouchableOpacity>

                              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, flex: 1, marginBottom: 0 }]}>
                                <Phone color={colors.textMuted} size={20} style={styles.inputIcon} />
                                <TextInput
                                  style={[styles.input, { color: colors.text }]}
                                  placeholder="10-digit number"
                                  placeholderTextColor={colors.textMuted}
                                  keyboardType="phone-pad"
                                  value={mobileNumber}
                                  onChangeText={setMobileNumber}
                                />
                              </View>
                            </View>
                          </View>
                        )}

                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: colors.primary }, otpSending && styles.buttonDisabled]}
                          onPress={handleRequestOtp}
                          disabled={otpSending}
                          activeOpacity={0.8}
                        >
                          {otpSending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Send Code</Text>}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        {otpSuccessMsg && (
                          <View style={styles.successBox}>
                            <Text style={styles.successText}>{otpSuccessMsg}</Text>
                          </View>
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                          <Text style={[styles.label, { color: colors.textMuted }]}>Enter 6-Digit OTP</Text>
                          {otpTimer > 0 ? (
                            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
                              ⏱ {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                            </Text>
                          ) : (
                            <TouchableOpacity onPress={handleRequestOtp}>
                              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '700' }}>Resend OTP</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* 6 OTP Box Inputs */}
                        <View style={styles.otpRow}>
                          {otpDigits.map((digit, idx) => (
                            <TextInput
                              key={idx}
                              ref={(el) => {
                                otpInputsRef.current[idx] = el;
                              }}
                              style={[
                                styles.otpBox,
                                {
                                  backgroundColor: colors.background,
                                  borderColor: digit ? colors.primary : colors.border,
                                  color: colors.text,
                                },
                              ]}
                              keyboardType="numeric"
                              maxLength={1}
                              value={digit}
                              onChangeText={(val) => handleOtpDigitChange(val, idx)}
                              onKeyPress={(e) => handleOtpDigitKeyPress(e, idx)}
                            />
                          ))}
                        </View>

                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: colors.primary }, otpVerifying && styles.buttonDisabled]}
                          onPress={handleVerifyOtp}
                          disabled={otpVerifying}
                          activeOpacity={0.8}
                        >
                          {otpVerifying ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify & Sign In</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsOtpSent(false)} style={{ alignSelf: 'center', marginTop: 10 }}>
                          <Text style={{ color: colors.textMuted, fontSize: 13 }}>← Change phone / email</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Sign In with OTP / Password Action Button (Only shown inside Email or Phone flow) */}
                <TouchableOpacity
                  style={[styles.bioButton, { marginTop: 14, backgroundColor: colors.background, borderColor: colors.primary }]}
                  onPress={() => {
                    setSubTab(subTab === 'password' ? 'otp' : 'password');
                    resetState();
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LogIn color={colors.primary} size={20} style={{ marginRight: 8 }} />
                  <Text style={[styles.bioButtonText, { color: colors.primary }]}>
                    {subTab === 'password' ? 'Continue with OTP' : 'Sign In with Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Biometrics */}
            {biometricAvailable && (
              <TouchableOpacity
                style={[styles.bioButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={handleBiometricAuth}
                disabled={loading}
              >
                <Fingerprint color={colors.primary} size={22} style={{ marginRight: 8 }} />
                <Text style={[styles.bioButtonText, { color: colors.primary }]}>{biometricLabel}</Text>
              </TouchableOpacity>
            )}

            {/* Register Link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SEARCHABLE COUNTRY MODAL */}
      <Modal visible={isCountryModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country Code</Text>
            <TextInput
              style={[styles.modalSearch, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Search country name or code..."
              placeholderTextColor={colors.textMuted}
              value={countrySearch}
              onChangeText={setCountrySearch}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setIsCountryModalOpen(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.countryCodeVal, { color: colors.primary }]}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setIsCountryModalOpen(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  themeBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444440',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: '#ef4444', fontSize: 13, flex: 1 },
  successBox: {
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98140',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: { color: '#10b981', fontSize: 13 },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 52,
    borderRadius: 14,
  },
  choiceBtnText: { fontSize: 15, fontWeight: '600' },
  backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backLinkText: { fontSize: 13, fontWeight: '600' },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  eyeIcon: { padding: 6 },
  countryBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryBtnText: { fontSize: 15, fontWeight: '700' },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 50,
    borderRadius: 14,
    marginBottom: 10,
  },
  bioButtonText: { fontSize: 14, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalSearch: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  countryName: { fontSize: 15 },
  countryCodeVal: { fontSize: 15, fontWeight: '700' },
  modalCloseBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalCloseText: { fontWeight: '700' },
});
