import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Share,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { updateProfileApi, purgeAccountApi, exportPersonalDataApi } from '../services/profileApi';
import { AppHeader } from '../components/AppHeader';
import { QrCodeModal } from '../components/QrCodeModal';
import { ProfileTabsSection, ProfileTabKey } from '../components/ProfileTabsSection';
import {
  User,
  Mail,
  Shield,
  LogOut,
  AlertCircle,
  Camera,
  CheckCircle2,
  Briefcase,
  Phone,
  Save,
  Trash2,
  Sparkles,
  Lock,
  KeyRound,
  Download,
  Edit2,
  QrCode,
  Share2,
  ShieldCheck,
  Building2,
  CalendarDays,
  Award,
  Check,
  ChevronRight,
  MapPin,
  Users,
  Edit,
} from '../components/Icon';
import { pickPhotoFromGallery, capturePhotoWithCamera } from '../services/imageService';
import {
  requestEmailChangeOtpApi,
  verifyEmailChangeOtpApi,
  requestPhoneChangeOtpApi,
  verifyPhoneChangeOtpApi,
} from '../services/authApi';
import { getPasswordValidationError } from '../utils/passwordValidator';

export const ProfileSettingsScreen = ({ navigation }: any) => {
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const { mode, colors, toggleTheme, isDark } = useTheme();
  const { showSuccess, showInfo } = useNotifications();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('personal');

  // Editable Profile States
  const [name, setName] = useState(user?.name || 'Abhishek Sharma');
  const [designation, setDesignation] = useState(user?.designation || 'Employee');
  const [department, setDepartment] = useState(user?.department || 'Development');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '+91 98765 43210');
  const [location, setLocation] = useState('India');
  const [biography, setBiography] = useState(user?.biography || 'Work Today, Build a Better Tomorrow');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.profilePicture || null);
  const [coverUri, setCoverUri] = useState<string | null>(user?.coverPicture || null);

  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Email Change OTP Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone Change OTP Modal
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'request' | 'verify'>('request');
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [exportingData, setExportingData] = useState(false);

  // Photo Selectors
  const handleSelectAvatarPhoto = () => {
    Alert.alert('Update Profile Picture', 'Choose photo source:', [
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await capturePhotoWithCamera();
          if (uri) setAvatarUri(uri);
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const uri = await pickPhotoFromGallery();
          if (uri) setAvatarUri(uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSelectCoverPhoto = () => {
    Alert.alert('Update Cover Photo', 'Choose banner image source:', [
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await capturePhotoWithCamera();
          if (uri) {
            setCoverUri(uri);
            if (user?.id) {
              await updateProfileApi(user.id, { coverPicture: uri });
              await updateUser({ coverPicture: uri });
            }
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const uri = await pickPhotoFromGallery();
          if (uri) {
            setCoverUri(uri);
            if (user?.id) {
              await updateProfileApi(user.id, { coverPicture: uri });
              await updateUser({ coverPicture: uri });
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Save Profile Details
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setErrorMsg('Full Name must be between 2 and 50 characters.');
      return;
    }
    if (!/^[a-zA-Z\s.-]+$/.test(trimmedName)) {
      setErrorMsg('Full Name should contain letters and spaces only.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateProfileApi(user.id, {
        name: trimmedName,
        designation: designation.trim(),
        department: department.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        profilePicture: avatarUri || undefined,
        coverPicture: coverUri || undefined,
        biography: biography.trim() || undefined,
      });
      await updateUser({
        name: trimmedName,
        designation: designation.trim(),
        department: department.trim(),
        profilePicture: avatarUri || undefined,
        coverPicture: coverUri || undefined,
        biography: biography.trim() || undefined,
      });
      setSuccessMsg('Profile details updated successfully!');
      setIsEditingProfile(false);
      showSuccess('Profile updated successfully!', 'Saved');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Share Profile
  const handleShareProfile = async () => {
    try {
      const empId = user?.employeeId || `ETM-${(user?.id || '2026').slice(-4).toUpperCase()}`;
      const shareText = `📌 ${user?.name || name}\n💼 ${designation} | ${department}\n📧 Email: ${user?.email}\n🆔 ID: ${empId}\n📍 ${location}\n\nSmart Employee Management Suite`;
      await Share.share({
        title: `${user?.name || name} - Profile`,
        message: shareText,
      });
    } catch (error: any) {
      console.log('Share error:', error.message);
    }
  };

  // OTP Email/Phone handlers
  const handleRequestEmailOtp = async () => {
    if (!newEmailInput.trim()) return;
    setEmailLoading(true);
    try {
      await requestEmailChangeOtpApi(newEmailInput.trim());
      setEmailStep('verify');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) return;
    setEmailLoading(true);
    try {
      await verifyEmailChangeOtpApi(emailOtp);
      await updateUser({ email: newEmailInput.trim() });
      setIsEmailModalOpen(false);
      Alert.alert('Success', 'Email address updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid Email OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    if (!newPhoneInput.trim()) return;
    setPhoneLoading(true);
    try {
      await requestPhoneChangeOtpApi({ mobileNumber: newPhoneInput.trim(), countryCode });
      setPhoneStep('verify');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send SMS OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) return;
    setPhoneLoading(true);
    try {
      await verifyPhoneChangeOtpApi(phoneOtp);
      await updateUser({ mobileNumber: newPhoneInput.trim(), countryCode });
      setMobileNumber(newPhoneInput.trim());
      setIsPhoneModalOpen(false);
      Alert.alert('Success', 'Mobile phone number updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid SMS OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Password Security Flow
  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    const passErr = getPasswordValidationError(newPassword);
    if (passErr) {
      Alert.alert('Invalid Password', passErr);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setPasswordUpdating(true);
    try {
      if (user?.id) {
        await updateProfileApi(user.id, { password: newPassword });
        Alert.alert('Success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const data = await exportPersonalDataApi();
      Alert.alert(
        'Personal Data Archive Ready',
        'Your profile, tasks, leaves, and activity audit log archive (DPDP Act 2023 Compliant) has been generated successfully.\n\nData JSON summary:\n' + JSON.stringify(data, null, 2).slice(0, 250) + '...'
      );
    } catch {
      Alert.alert('Error', 'Failed to generate personal data export archive.');
    } finally {
      setExportingData(false);
    }
  };

  const handlePurgeAccount = () => {
    Alert.alert(
      'Purge Account Data',
      'Are you sure you want to permanently erase your profile data in compliance with DPDP Right to Erasure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Erase',
          style: 'destructive',
          onPress: async () => {
            try {
              await purgeAccountApi();
              await logout();
            } catch {
              await logout();
            }
          },
        },
      ]
    );
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Sign Out Confirmation',
      'Are you sure you want to sign out from your mobile account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            showInfo('You have signed out successfully.', 'Signed Out');
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const empId = user?.employeeId || `ETM-2026-${(user?.id || '1432').slice(-4)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />
      <AppHeader title="ETM" subtitle="Profile & Settings" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Header Banner */}
        <View style={styles.coverHeaderContainer}>
          <View style={styles.coverImageWrapper}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={[styles.coverGradient, { backgroundColor: isDark ? '#0f766e' : '#0d9488' }]} />
            )}
            <TouchableOpacity
              style={styles.coverCameraBadge}
              onPress={handleSelectCoverPhoto}
              activeOpacity={0.8}
            >
              <Camera color="#ffffff" size={14} />
              <Text style={styles.coverCameraText}>Edit Cover</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Header Side-by-Side Section (Matching Image 1) */}
          <View style={styles.profileHeaderRow}>
            {/* LEFT SIDE: Large Avatar + Active Now Pill */}
            <View style={styles.avatarLeftCol}>
              <TouchableOpacity onPress={handleSelectAvatarPhoto} activeOpacity={0.85} style={styles.avatarTouch}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={[styles.avatarImage, { borderColor: isDark ? '#1e293b' : '#ffffff' }]} />
                ) : (
                  <View style={[styles.avatarCircle, { backgroundColor: '#0d9488', borderColor: isDark ? '#1e293b' : '#ffffff' }]}>
                    <Text style={styles.avatarCircleText}>{(name || user?.name || 'A').charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={[styles.avatarCameraBadge, { backgroundColor: '#0d9488', borderColor: isDark ? '#1e293b' : '#ffffff' }]}>
                  <Camera color="#ffffff" size={12} />
                </View>
              </TouchableOpacity>

              {/* Active Now Pill directly under Avatar */}
              <View style={styles.activeStatusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.activeStatusText}>Active Now</Text>
              </View>
            </View>

            {/* RIGHT SIDE: User Name, Superadmin Badge, Email, Designation, Location */}
            <View style={styles.detailsRightCol}>
              <View style={styles.nameBadgeLine}>
                <Text style={[styles.userNameText, { color: colors.textPrimary }]}>{name || user?.name}</Text>
                <View style={styles.verifiedCheckPill}>
                  <Check size={10} color="#ffffff" />
                </View>

                {/* Role Crown Pill Badge */}
                <View style={styles.roleCrownPill}>
                  <Text style={styles.roleCrownText}>
                    👑 {(user?.role || 'Superadmin').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Subtitle Rows */}
              <View style={styles.metaDetailRow}>
                <Briefcase size={14} color={colors.textSecondary} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>
                  {designation} | {department}
                </Text>
              </View>

              <View style={styles.metaDetailRow}>
                <Mail size={14} color={colors.textSecondary} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>
                  {user?.email || 'abhishek7y2@gmail.com'}
                </Text>
              </View>

              <View style={styles.metaDetailRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>{location}</Text>
                <CalendarDays size={14} color={colors.textSecondary} style={{ marginLeft: 10 }} />
                <Text style={[styles.metaDetailText, { color: colors.textSecondary }]}>Joined Aug 2026</Text>
              </View>

              {biography ? (
                <Text style={[styles.bioQuoteText, { color: colors.textSecondary }]}>
                  "{biography}"
                </Text>
              ) : null}
            </View>
          </View>

          {/* Quick Action Button Bar */}
          <View style={styles.quickActionsBar}>
            <TouchableOpacity
              style={[
                styles.actionPillBtn,
                styles.primaryActionBtn,
                isEditingProfile ? { backgroundColor: '#0f766e' } : { backgroundColor: '#0d9488' },
              ]}
              onPress={() => setIsEditingProfile(!isEditingProfile)}
              activeOpacity={0.8}
            >
              <Edit2 size={14} color="#ffffff" />
              <Text style={styles.primaryActionBtnText}>
                {isEditingProfile ? 'Lock Profile' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionPillBtn,
                styles.secondaryActionBtn,
                { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' },
              ]}
              onPress={() => setIsQrModalOpen(true)}
              activeOpacity={0.8}
            >
              <QrCode size={14} color={isDark ? '#38bdf8' : '#0284c7'} />
              <Text style={[styles.secondaryActionBtnText, { color: isDark ? '#f8fafc' : '#334155' }]}>View QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionPillBtn,
                styles.secondaryActionBtn,
                { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' },
              ]}
              onPress={handleShareProfile}
              activeOpacity={0.8}
            >
              <Share2 size={14} color="#10b981" />
              <Text style={[styles.secondaryActionBtnText, { color: isDark ? '#f8fafc' : '#334155' }]}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Banners */}
        {successMsg && (
          <View style={styles.successBox}>
            <CheckCircle2 color="#22c55e" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorBox}>
            <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Segmented Horizontal Tabs Bar */}
        <ProfileTabsSection activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <View style={{ gap: 16 }}>
            {/* Card 1: Personal Information */}
            <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <View style={styles.cardTitleHeader}>
                <View style={styles.titleWithIcon}>
                  <View style={styles.headerIconCircle}>
                    <User size={18} color="#0d9488" />
                  </View>
                  <View>
                    <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>Personal Information</Text>
                    <Text style={styles.cardHeaderSub}>Manage your personal details and contact information</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.cardEditPill}
                  onPress={() => setIsEditingProfile(!isEditingProfile)}
                >
                  <Edit size={12} color="#0d9488" style={{ marginRight: 4 }} />
                  <Text style={styles.cardEditPillText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {!isEditingProfile ? (
                /* Enterprise Clean Row List */
                <View style={styles.rowListContainer}>
                  {/* Full Name */}
                  <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                    <User size={18} color={colors.textSecondary} style={styles.rowIcon} />
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Full Name</Text>
                    <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{name || user?.name}</Text>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </View>

                  {/* Email Address */}
                  <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                    <Mail size={18} color={colors.textSecondary} style={styles.rowIcon} />
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Email Address</Text>
                    <Text style={[styles.rowValueText, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {user?.email || 'abhishek7y2@gmail.com'}
                    </Text>
                    <TouchableOpacity onPress={() => { setNewEmailInput(''); setEmailStep('request'); setIsEmailModalOpen(true); }}>
                      <Text style={styles.actionHighlightText}>Change via OTP</Text>
                    </TouchableOpacity>
                    <ChevronRight size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                  </View>

                  {/* Phone Number */}
                  <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                    <Phone size={18} color={colors.textSecondary} style={styles.rowIcon} />
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                    <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{mobileNumber}</Text>
                    <TouchableOpacity onPress={() => { setNewPhoneInput(''); setPhoneStep('request'); setIsPhoneModalOpen(true); }}>
                      <Text style={styles.actionHighlightText}>Change via OTP</Text>
                    </TouchableOpacity>
                    <ChevronRight size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                  </View>

                  {/* Location */}
                  <View style={styles.listRowItemLast}>
                    <MapPin size={18} color={colors.textSecondary} style={styles.rowIcon} />
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{location}</Text>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </View>
                </View>
              ) : (
                /* Unlocked Editing Inputs */
                <View style={{ gap: 8, marginTop: 8 }}>
                  <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Full Name *</Text>
                  <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: '#0d9488' }]}>
                    <User color="#0d9488" size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputText, { color: colors.textPrimary }]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Full Name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Designation</Text>
                  <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: '#0d9488' }]}>
                    <Briefcase color="#0d9488" size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputText, { color: colors.textPrimary }]}
                      value={designation}
                      onChangeText={setDesignation}
                      placeholder="Designation"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Location</Text>
                  <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: '#0d9488' }]}>
                    <MapPin color="#0d9488" size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputText, { color: colors.textPrimary }]}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Location"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.formBtnRow}>
                    <TouchableOpacity
                      style={[styles.saveBtn, { flex: 1, backgroundColor: '#0d9488' }, updating && { opacity: 0.7 }]}
                      onPress={handleSaveProfile}
                      disabled={updating}
                    >
                      {updating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, { backgroundColor: colors.bg, borderColor: colors.borderColor, borderWidth: 1, paddingHorizontal: 20 }]}
                      onPress={() => setIsEditingProfile(false)}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* TAB 2: WORK PROFILE */}
        {activeTab === 'work' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <View style={styles.cardTitleHeader}>
              <View style={styles.titleWithIcon}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                  <Briefcase size={18} color="#0284c7" />
                </View>
                <View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>Work Information</Text>
                  <Text style={styles.cardHeaderSub}>Your professional details in the organization</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cardEditPill}
                onPress={() => setIsEditingProfile(!isEditingProfile)}
              >
                <Edit size={12} color="#0d9488" style={{ marginRight: 4 }} />
                <Text style={styles.cardEditPillText}>{isEditingProfile ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {!isEditingProfile ? (
              <View style={styles.rowListContainer}>
                {/* Job Title / Designation */}
                <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                  <Briefcase size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Job Title / Designation</Text>
                  <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{designation}</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {/* Department */}
                <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                  <Building2 size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Department</Text>
                  <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{department}</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {/* Employee ID */}
                <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                  <ShieldCheck size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Employee ID</Text>
                  <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>{empId}</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {/* Reporting Manager */}
                <View style={[styles.listRowItem, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
                  <Users size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Reporting Manager</Text>
                  <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>Admin</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {/* Joining Date */}
                <View style={styles.listRowItemLast}>
                  <CalendarDays size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Joining Date</Text>
                  <Text style={[styles.rowValueText, { color: colors.textPrimary }]}>Aug 2026</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </View>
              </View>
            ) : (
              /* Editable Inputs for Work Information */
              <View style={{ gap: 8, marginTop: 8 }}>
                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Job Title / Designation *</Text>
                <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: '#0d9488' }]}>
                  <Briefcase color="#0d9488" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputText, { color: colors.textPrimary }]}
                    value={designation}
                    onChangeText={setDesignation}
                    placeholder="Software Engineer"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Department *</Text>
                <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: '#0d9488' }]}>
                  <Building2 color="#0d9488" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputText, { color: colors.textPrimary }]}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Development"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { flex: 1, backgroundColor: '#0d9488' }, updating && { opacity: 0.7 }]}
                    onPress={handleSaveProfile}
                    disabled={updating}
                  >
                    {updating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Save Work Details</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.bg, borderColor: colors.borderColor, borderWidth: 1, paddingHorizontal: 20 }]}
                    onPress={() => setIsEditingProfile(false)}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
          <View style={{ gap: 16 }}>
            <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Password Security Management</Text>

              <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Current Password</Text>
              <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                <Lock color={colors.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { color: colors.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>New Password (8+ chars, A-Z, 0-9, symbol)</Text>
              <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                <KeyRound color={colors.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { color: colors.textPrimary }]}
                  placeholder="New Strong Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Confirm New Password</Text>
              <View style={[styles.inputContainerActive, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                <KeyRound color={colors.textSecondary} size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { color: colors.textPrimary }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                />
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0d9488' }]} onPress={handleChangePassword} disabled={passwordUpdating}>
                {passwordUpdating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary, marginBottom: 12 }]}>DPDP Act 2023 Data Rights</Text>

              <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 1, borderBottomColor: colors.borderColor, paddingBottom: 12, marginBottom: 12 }]} onPress={handleExportData} disabled={exportingData}>
                <Download color="#0d9488" size={20} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                    {exportingData ? 'Generating Archive...' : 'Download Personal Data Archive'}
                  </Text>
                  <Text style={[styles.purgeSub, { color: colors.textSecondary }]}>Export personal data & activity logs as JSON</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={handlePurgeAccount}>
                <Trash2 color="#ef4444" size={20} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.purgeText}>Right to Erasure (Purge Account)</Text>
                  <Text style={[styles.purgeSub, { color: colors.textSecondary }]}>Permanently erase personal record entries</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: PREFERENCES */}
        {activeTab === 'preferences' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Appearance Customization</Text>

            <TouchableOpacity style={styles.actionRow} onPress={toggleTheme} activeOpacity={0.8}>
              <Sparkles color="#0d9488" size={22} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                  Active Theme: {mode.toUpperCase()} MODE
                </Text>
                <Text style={[styles.purgeSub, { color: colors.textSecondary }]}>
                  Switch between Slate Dark and Modern Light Interface
                </Text>
              </View>
              <View style={[styles.themeBadgePill, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <Text style={[styles.themeBadgeText, { color: colors.textPrimary }]}>{mode.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 5: ACTIVITY */}
        {activeTab === 'activity' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Account Activity & Logins</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>System Active Session Verified via Mobile Token</Text>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutConfirm} disabled={authLoading} activeOpacity={0.85}>
          <LogOut color="#ef4444" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.logoutBtnText}>Sign Out From Mobile App</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* QR CODE DIGITAL IDENTITY MODAL */}
      <QrCodeModal
        visible={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        user={{
          name: name || user?.name || 'Abhishek Sharma',
          email: user?.email || 'abhishek7y2@gmail.com',
          role: user?.role || 'Superadmin',
          designation,
          department,
          profilePicture: avatarUri || undefined,
          id: user?.id,
          employeeId: user?.employeeId,
        }}
      />

      {/* EMAIL CHANGE OTP MODAL */}
      <Modal visible={isEmailModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Change Email Address</Text>
            {emailStep === 'request' ? (
              <View>
                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>New Email Address</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="newname@company.com"
                  placeholderTextColor={colors.textSecondary}
                  value={newEmailInput}
                  onChangeText={setNewEmailInput}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0d9488' }]} onPress={handleRequestEmailOtp} disabled={emailLoading}>
                  {emailLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Send Verification OTP</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Enter 6-Digit Email OTP</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="123456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0d9488' }]} onPress={handleVerifyEmailOtp} disabled={emailLoading}>
                  {emailLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Verify & Update Email</Text>}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.bg }]} onPress={() => setIsEmailModalOpen(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PHONE CHANGE OTP MODAL */}
      <Modal visible={isPhoneModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Change Mobile Phone Number</Text>
            {phoneStep === 'request' ? (
              <View>
                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>New 10-Digit Mobile Number</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="9876543210"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={newPhoneInput}
                  onChangeText={setNewPhoneInput}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0d9488' }]} onPress={handleRequestPhoneOtp} disabled={phoneLoading}>
                  {phoneLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Send SMS OTP</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.fieldInputLabel, { color: colors.textPrimary }]}>Enter 6-Digit SMS OTP</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="123456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                  value={phoneOtp}
                  onChangeText={setPhoneOtp}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0d9488' }]} onPress={handleVerifyPhoneOtp} disabled={phoneLoading}>
                  {phoneLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Verify & Update Phone</Text>}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.bg }]} onPress={() => setIsPhoneModalOpen(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  /* Cover Header Section */
  coverHeaderContainer: {
    marginBottom: 8,
  },
  coverImageWrapper: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0d9488',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
  },
  coverCameraBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  coverCameraText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Side-by-Side Profile Header (Matching Image 1) */
  profileHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -40,
    gap: 14,
  },
  avatarLeftCol: {
    alignItems: 'center',
  },
  avatarTouch: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  activeStatusText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Right Side Details Column */
  detailsRightCol: {
    flex: 1,
    paddingTop: 44,
  },
  nameBadgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
  },
  verifiedCheckPill: {
    backgroundColor: '#0284c7',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCrownPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  roleCrownText: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: '800',
  },
  metaDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  metaDetailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bioQuoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },

  /* Quick Actions Bar */
  quickActionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  primaryActionBtn: {
    flex: 1.2,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Feedback Banners */
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  successText: { color: '#34d399', fontSize: 13 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451a1a',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },

  /* Card Container */
  sectionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  cardEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  cardEditPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488',
  },

  /* List Row Items (Matching Image 1) */
  rowListContainer: {
    marginTop: 4,
  },
  listRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 10,
  },
  listRowItemLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 10,
  },
  rowIcon: {
    width: 20,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 125,
  },
  rowValueText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  actionHighlightText: {
    color: '#0d9488',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Editable Input Form */
  fieldInputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 4 },
  inputContainerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
  },
  inputIcon: { marginRight: 10 },
  inputText: { flex: 1, fontSize: 14 },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  /* Info Card Items */
  infoCardList: { gap: 10 },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  infoCardLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  infoCardValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  verifiedBadgeMini: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadgeText: { color: '#10b981', fontSize: 10, fontWeight: '800' },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  purgeText: { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  purgeSub: { fontSize: 12, marginTop: 2 },
  themeBadgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  themeBadgeText: { fontSize: 11, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#451a1a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  logoutBtnText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    fontSize: 15,
  },
  modalCloseBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalCloseText: { fontSize: 14, fontWeight: '600' },
});
