import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus, Phone, Check, ChevronDown, Camera, Sun, Moon } from '../components/Icon';
import { countries } from '../constants/countries';
import { validateMobileNumber } from '../utils/phoneValidator';
import { getPasswordValidationError, calculatePasswordStrength } from '../utils/passwordValidator';
import {
  requestRegistrationOtpApi,
  verifyRegistrationOtpApi,
  requestRegistrationEmailOtpApi,
  verifyRegistrationEmailOtpApi,
} from '../services/authApi';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const qualifications = ["10th", "12th", "Bachelor's", "Master's", "PhD", "Other"];

export const RegisterScreen = ({ navigation }: any) => {
  const { register, loading, error, clearError } = useAuth();
  const { colors, mode: themeMode, toggleTheme } = useTheme();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [qualification, setQualification] = useState("Bachelor's");
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // UI Modals
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isQualModalOpen, setIsQualModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtpModal, setPhoneOtpModal] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtpModal, setEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);

  // Errors & Success
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength
  const strengthScore = calculatePasswordStrength(password);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setValidationError('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
          setValidationError('Image size must be less than 20MB');
          return;
        }
        const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setProfilePicture(base64Uri);
        setValidationError(null);
      }
    } catch {
      setValidationError('Failed to select profile picture.');
    }
  };

  const handleSendPhoneOtp = async () => {
    setValidationError(null);
    const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];
    const mobErr = validateMobileNumber(mobileNumber, selectedCountry.iso);
    if (mobErr) {
      setValidationError(mobErr);
      return;
    }

    setPhoneOtpSending(true);
    try {
      await requestRegistrationOtpApi({ mobileNumber: mobileNumber.trim(), countryCode });
      setPhoneOtpModal(true);
      setPhoneOtp('');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send SMS OTP.');
    } finally {
      setPhoneOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setValidationError(null);
    if (phoneOtp.length !== 6) {
      setValidationError('Please enter the 6-digit SMS OTP.');
      return;
    }

    setPhoneOtpVerifying(true);
    try {
      await verifyRegistrationOtpApi({ mobileNumber: mobileNumber.trim(), countryCode, otp: phoneOtp });
      setIsPhoneVerified(true);
      setPhoneOtpModal(false);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid SMS OTP.');
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setValidationError(null);
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setEmailOtpSending(true);
    try {
      await requestRegistrationEmailOtpApi({ email: email.trim() });
      setEmailOtpModal(true);
      setEmailOtp('');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send Email OTP.');
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setValidationError(null);
    if (emailOtp.length !== 6) {
      setValidationError('Please enter the 6-digit Email OTP.');
      return;
    }

    setEmailOtpVerifying(true);
    try {
      await verifyRegistrationEmailOtpApi({ email: email.trim(), otp: emailOtp });
      setIsEmailVerified(true);
      setEmailOtpModal(false);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid Email OTP.');
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  const handleRegisterSubmit = async () => {
    clearError();
    setValidationError(null);

    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setValidationError('Please enter your last name.');
      return;
    }

    const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];
    const mobErr = validateMobileNumber(mobileNumber, selectedCountry.iso);
    if (mobErr) {
      setValidationError(mobErr);
      return;
    }
    if (!isPhoneVerified) {
      setValidationError('Please verify your mobile number via OTP before continuing.');
      return;
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!isEmailVerified) {
      setValidationError('Please verify your email address via OTP before continuing.');
      return;
    }

    const passErr = getPasswordValidationError(password);
    if (passErr) {
      setValidationError(passErr);
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        qualification,
        mobileNumber: mobileNumber.trim(),
        countryCode,
        email: email.trim().toLowerCase(),
        password,
        profilePicture,
      });
      setSuccessMessage('Registration successful! Redirecting to workspace...');
    } catch (err: any) {
      setValidationError(err.message || 'Registration failed.');
    }
  };

  const filteredCountries = countries.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Top Bar */}
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
              <UserPlus color={colors.primary} size={28} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Join the Employee Task Manager platform</Text>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Error Banner */}
          {(error || validationError) && (
            <View style={styles.errorBox}>
              <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error || validationError}</Text>
            </View>
          )}

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            {/* Avatar Picker */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.avatarCircle, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={handlePickImage}
              >
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.avatarImg} />
                ) : (
                  <Camera color={colors.textMuted} size={32} />
                )}
              </TouchableOpacity>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                {profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture (JPG/PNG <= 20MB)'}
              </Text>
            </View>

            {/* First Name & Last Name */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted }]}>First Name *</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <User color={colors.textMuted} size={18} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="John"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={(val) => setFirstName(val.replace(/[^a-zA-Z]/g, ''))}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Last Name *</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <User color={colors.textMuted} size={18} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Doe"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Gender Radio Group */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Gender *</Text>
            <View style={styles.radioRow}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioItem}
                  onPress={() => setGender(g)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: colors.border },
                      gender === g && { borderColor: colors.primary },
                    ]}
                  >
                    {gender === g && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.radioText, { color: colors.text }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Qualification Select */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Highest Qualification</Text>
            <TouchableOpacity
              style={[styles.selectBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setIsQualModalOpen(true)}
            >
              <Text style={[styles.selectBtnText, { color: colors.text }]}>{qualification}</Text>
              <ChevronDown color={colors.textMuted} size={18} />
            </TouchableOpacity>

            {/* Mobile Number & SMS OTP */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Mobile Number *</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity
                style={[styles.countryBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setIsCountryModalOpen(true)}
              >
                <Text style={[styles.countryBtnText, { color: colors.text }]}>{countryCode}</Text>
              </TouchableOpacity>

              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, flex: 1, marginBottom: 0 }]}>
                <Phone color={colors.textMuted} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="10-digit number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={(val) => {
                    setMobileNumber(val);
                    setIsPhoneVerified(false);
                  }}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyBadgeBtn,
                  { backgroundColor: isPhoneVerified ? colors.success : colors.primary },
                ]}
                onPress={handleSendPhoneOtp}
                disabled={isPhoneVerified || phoneOtpSending}
              >
                {phoneOtpSending ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.verifyBadgeText}>{isPhoneVerified ? 'Verified ✓' : 'Verify OTP'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Email Address & Email OTP */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Email Address *</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, flex: 1, marginBottom: 0 }]}>
                <Mail color={colors.textMuted} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="john@company.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setIsEmailVerified(false);
                  }}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyBadgeBtn,
                  { backgroundColor: isEmailVerified ? colors.success : colors.primary },
                ]}
                onPress={handleSendEmailOtp}
                disabled={isEmailVerified || emailOtpSending}
              >
                {emailOtpSending ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.verifyBadgeText}>{isEmailVerified ? 'Verified ✓' : 'Verify OTP'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Password */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Password (8+ chars, A-Z, a-z, 0-9, !@#$) *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Lock color={colors.textMuted} size={18} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Strong Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeOff color={colors.textMuted} size={18} /> : <Eye color={colors.textMuted} size={18} />}
              </TouchableOpacity>
            </View>

            {/* Strength Meter Bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={[styles.strengthBar, { backgroundColor: strengthScore >= 1 ? '#ef4444' : colors.border }]} />
                <View style={[styles.strengthBar, { backgroundColor: strengthScore >= 2 ? '#eab308' : colors.border }]} />
                <View style={[styles.strengthBar, { backgroundColor: strengthScore >= 3 ? '#10b981' : colors.border }]} />
              </View>
            )}

            {/* Confirm Password */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Confirm Password *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Lock color={colors.textMuted} size={18} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                {showConfirmPassword ? <EyeOff color={colors.textMuted} size={18} /> : <Eye color={colors.textMuted} size={18} />}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleRegisterSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SMS OTP MODAL */}
      <Modal visible={phoneOtpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Verify Mobile SMS OTP</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
              Enter the 6-digit code sent to {countryCode} {mobileNumber}
            </Text>

            <TextInput
              style={[styles.otpModalInput, { backgroundColor: colors.background, borderColor: colors.primary, color: colors.text }]}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              value={phoneOtp}
              onChangeText={setPhoneOtp}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleVerifyPhoneOtp}
              disabled={phoneOtpVerifying}
            >
              {phoneOtpVerifying ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify Mobile OTP</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setPhoneOtpModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EMAIL OTP MODAL */}
      <Modal visible={emailOtpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Verify Email OTP</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
              Enter the 6-digit code sent to {email}
            </Text>

            <TextInput
              style={[styles.otpModalInput, { backgroundColor: colors.background, borderColor: colors.primary, color: colors.text }]}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              value={emailOtp}
              onChangeText={setEmailOtp}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleVerifyEmailOtp}
              disabled={emailOtpVerifying}
            >
              {emailOtpVerifying ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify Email OTP</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setEmailOtpModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* COUNTRY MODAL */}
      <Modal visible={isCountryModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country Code</Text>
            <TextInput
              style={[styles.modalSearch, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Search country..."
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

      {/* QUALIFICATION MODAL */}
      <Modal visible={isQualModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Qualification</Text>
            {qualifications.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.countryRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setQualification(q);
                  setIsQualModalOpen(false);
                }}
              >
                <Text style={[styles.countryName, { color: colors.text }]}>{q}</Text>
                {qualification === q && <Check color={colors.primary} size={18} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setIsQualModalOpen(false)}
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  themeBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: 'center' },
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
  successBox: { backgroundColor: '#10b98115', borderWidth: 1, borderColor: '#10b98140', borderRadius: 12, padding: 12, marginBottom: 16 },
  successText: { color: '#10b981', fontSize: 13, textAlign: 'center' },
  formCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14 },
  eyeIcon: { padding: 4 },
  radioRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5 },
  radioText: { fontSize: 14 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  selectBtnText: { fontSize: 14 },
  countryBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryBtnText: { fontSize: 14, fontWeight: '700' },
  verifyBadgeBtn: {
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  strengthRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  modalSearch: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  otpModalInput: { borderRadius: 14, borderWidth: 1, fontSize: 24, fontWeight: '800', textAlign: 'center', height: 56, marginBottom: 16 },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  countryName: { fontSize: 15 },
  countryCodeVal: { fontSize: 15, fontWeight: '700' },
  modalCloseBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  modalCloseText: { fontWeight: '700' },
});
