# 📱 Enterprise React Native (Expo) Mobile App Architectural Specification & Reference Manual

> **Purpose & Directive**: This document serves as the single source of truth for the React Native / Expo 57 Mobile Application architecture. Whenever future mobile development, screen updates, navigation changes, biometrics, offline storage, or real-time sync tasks are requested, this architecture must be strictly referenced and upheld.

---

## 📑 Table of Contents
1. [Mobile Tech Stack & Architecture Overview](#1-mobile-tech-stack--architecture-overview)
2. [Folder & Directory Structure](#2-folder--directory-structure)
3. [Navigation Architecture (Root & 10 Bottom Tabs)](#3-navigation-architecture-root--10-bottom-tabs)
4. [Storage Strategy & Biometric Security](#4-storage-strategy--biometric-security)
5. [State Management & Context Layer](#5-state-management--context-layer)
6. [Networking, Axios & Real-Time Socket Service](#6-networking-axios--real-time-socket-service)
7. [Screen Catalog (20 Native Mobile Screens)](#7-screen-catalog-20-native-mobile-screens)
8. [Native UI Components & SVG Progress Rings](#8-native-ui-components--svg-progress-rings)
9. [Media & Cloudinary Attachment Pipeline](#9-media--cloudinary-attachment-pipeline)
10. [Configuration & Environment Standards](#10-configuration--environment-standards)

---

## 1. Mobile Tech Stack & Architecture Overview

The mobile application is built with modern, cross-platform native technologies:
- **Framework**: **React Native 0.86.3** with **Expo SDK 57** (`~57.0.20`)
- **Language**: **TypeScript 6.0.3**
- **Navigation**: **React Navigation v7** (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Secure Hardware Storage**: **Expo SecureStore** (`expo-secure-store`) for sensitive JWT access tokens + **AsyncStorage** for user profile caching
- **Biometric Security**: **Expo Local Authentication** (`expo-local-authentication` for FaceID / TouchID / Fingerprint unlock)
- **Real-Time WebSockets**: **Socket.IO Client v4.8.3** (`socket.io-client`)
- **Media & Attachment Picker**: **Expo ImagePicker** (`expo-image-picker`)
- **Push & Local Notifications**: **Expo Notifications** (`expo-notifications`)
- **Vector Graphics**: **React Native SVG** (`react-native-svg`) for animated circular KPI meters and progress rings
- **Icons**: **Lucide React Native** (`lucide-react-native`)

---

## 2. Folder & Directory Structure

```
mobile-app/
├── package.json                   # Dependencies, Expo scripts & tools
├── app.json                       # Expo configuration (bundleId, permissions, scheme)
├── tsconfig.json                  # TypeScript configuration
├── App.tsx                        # Root entry point with Provider hierarchy
├── assets/                        # App icons, splash screens, and images
└── src/
    ├── components/                # 17 Reusable native UI components
    │   ├── AddMemberModal.tsx     # Group participant picker modal
    │   ├── AppHeader.tsx          # Native top app bar with status bell
    │   ├── CircularProgressRing.tsx # SVG animated completion ring
    │   ├── CreateTaskModal.tsx    # Native task creation form modal
    │   ├── DashboardChartsSection.tsx # Native workload & priority bar charts
    │   ├── EditEmployeeModal.tsx  # Admin designation & role editor
    │   ├── EditTaskModal.tsx      # Task editing modal
    │   ├── EmployeeProfileModal.tsx # Employee overview card modal
    │   ├── GlobalToastBanner.tsx  # In-app floating alert notification
    │   ├── HeaderBell.tsx         # Notification badge icon
    │   ├── Icon.tsx               # Lucide icon wrapper
    │   ├── NotificationModal.tsx  # In-app notifications list modal
    │   ├── ProfileTabsSection.tsx # Segmented profile switch
    │   ├── QrCodeModal.tsx        # Profile QR code generator modal
    │   ├── SidebarDrawer.tsx      # Native slide-over navigation drawer
    │   ├── TaskAttachmentSection.tsx # Attachment preview & camera picker
    │   └── TaskDetailsModal.tsx   # Full-screen task details modal
    ├── config/
    │   └── api.ts                 # Base API endpoint configuration
    ├── constants/                 # Theme palettes, status labels & mock fallbacks
    ├── context/                   # 4 Global React Contexts
    │   ├── AuthContext.tsx        # Mobile auth lifecycle & token storage
    │   ├── NotificationContext.tsx # Notification alerts & unread badges
    │   ├── TaskContext.tsx        # Task list, employee state & socket sync
    │   └── ThemeContext.tsx       # Dark & Light mobile theme colors
    ├── navigation/                # React Navigation configuration
    │   ├── RootNavigator.tsx      # Native Stack (Auth vs MainApp)
    │   └── TabNavigator.tsx       # 10-Tab Bottom Navigation Bar
    ├── screens/                   # 20 Full-Featured Native Screens
    │   ├── ActivityLogScreen.tsx  # Audit trail of employee operations
    │   ├── AnnouncementsScreen.tsx# Broadcast company notices
    │   ├── AttendanceScreen.tsx   # Geolocation punch in/out & timer
    │   ├── CalendarScreen.tsx     # Company holidays & deadlines
    │   ├── ChatDetailScreen.tsx   # 1-on-1 and group chat thread
    │   ├── ChatbotScreen.tsx      # Gemini AI assistant & tool calling
    │   ├── CommunicationScreen.tsx# Chat channels, inbox & groups
    │   ├── CreateGroupScreen.tsx  # Multi-user group channel creator
    │   ├── DashboardScreen.tsx    # Mobile KPI cards & analytics
    │   ├── DocumentRagScreen.tsx  # Mobile PDF RAG document Q&A
    │   ├── EmployeesScreen.tsx    # Employee directory & management
    │   ├── ForgotPasswordScreen.tsx # SMS/Email OTP password recovery
    │   ├── HomeScreen.tsx         # Quick action dashboard
    │   ├── LeaveScreen.tsx        # Leave quota balance & applications
    │   ├── LoginScreen.tsx        # Biometric & password authentication
    │   ├── NotificationsScreen.tsx# System and task alerts
    │   ├── ProfileSettingsScreen.tsx # Profile edit, phone/email OTP
    │   ├── RegisterScreen.tsx     # Signup with inline OTP verification
    │   ├── ResetPasswordScreen.tsx# Password reset confirmation
    │   └── TasksScreen.tsx        # Mobile task cards & filter tabs
    ├── services/                  # API clients, Sockets & Hardware services
    │   ├── attendanceApi.ts       # Attendance REST endpoints
    │   ├── authApi.ts             # Authentication REST endpoints
    │   ├── axios.ts               # Mobile Axios instance with Bearer auth
    │   ├── biometricService.ts    # FaceID / Fingerprint scanner
    │   ├── chatbotApi.ts          # AI Chatbot REST client
    │   ├── commApi.ts             # Communication REST client
    │   ├── holidayApi.ts          # Company calendar REST client
    │   ├── imageService.ts        # Image picker & compression
    │   ├── leaveApi.ts            # Leave management REST client
    │   ├── notesApi.ts            # Notes REST client
    │   ├── notificationApi.ts     # In-app notifications REST client
    │   ├── notificationService.ts # Local push notification handler
    │   ├── profileApi.ts          # User profile REST client
    │   ├── ragApi.ts              # PDF RAG upload & Q&A REST client
    │   ├── socketService.ts       # Mobile Socket.IO client manager
    │   ├── storage.ts             # SecureStore & AsyncStorage wrapper
    │   └── tasksApi.ts            # Task CRUD REST client
    ├── theme/                     # Color schemes, typography & borders
    ├── types/                     # TypeScript interfaces
    └── utils/                     # Validators, formatters & file uploaders
        ├── fileUploader.ts        # Expo ImagePicker & Cloudinary helper
        ├── passwordValidator.ts   # Password complexity rules
        └── phoneValidator.ts      # E.164 phone number validator
```

---

## 3. Navigation Architecture (Root & 10 Bottom Tabs)

### A. Provider Hierarchy (`App.tsx`)
```tsx
<SafeAreaProvider>
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <RootNavigator />
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

### B. Root Native Stack Navigator (`src/navigation/RootNavigator.tsx`)
- **Unauthenticated Flow**:
  - `Login` $\rightarrow$ [LoginScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/LoginScreen.tsx)
  - `Register` $\rightarrow$ [RegisterScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/RegisterScreen.tsx)
  - `ForgotPassword` $\rightarrow$ [ForgotPasswordScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ForgotPasswordScreen.tsx)
  - `ResetPassword` $\rightarrow$ [ResetPasswordScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ResetPasswordScreen.tsx)
- **Authenticated Flow**:
  - `MainApp` $\rightarrow$ [TabNavigator.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/navigation/TabNavigator.tsx)
  - `ChatDetail` $\rightarrow$ [ChatDetailScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ChatDetailScreen.tsx)
  - `Notifications` $\rightarrow$ [NotificationsScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/NotificationsScreen.tsx)
  - `CreateGroup` $\rightarrow$ [CreateGroupScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/CreateGroupScreen.tsx)
  - `Announcements` $\rightarrow$ [AnnouncementsScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/AnnouncementsScreen.tsx)
  - `ActivityLog` $\rightarrow$ [ActivityLogScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ActivityLogScreen.tsx)

### C. 10-Tab Bottom Navigator (`src/navigation/TabNavigator.tsx`)
1. **Home** (`DashboardTab` $\rightarrow$ `DashboardScreen`): KPI summary cards, SVG progress meters, recent tasks.
2. **Tasks** (`TasksTab` $\rightarrow$ `TasksScreen`): Filterable task cards by status (`all`, `todo`, `in_progress`, `completed`).
3. **Calendar** (`CalendarTab` $\rightarrow$ `CalendarScreen`): Company holidays calendar & upcoming due dates.
4. **Docs RAG** (`RagTab` $\rightarrow$ `DocumentRagScreen`): PDF document upload and natural language search.
5. **Comm** (`CommTab` $\rightarrow$ `CommunicationScreen`): Direct messaging channels, inbox, and group discussions.
6. **Attendance** (`AttendanceTab` $\rightarrow$ `AttendanceScreen`): Geolocation punch in/out and duration timer.
7. **Leave** (`LeaveTab` $\rightarrow$ `LeaveScreen`): Leave balance cards and application submissions.
8. **Team** (`TeamTab` $\rightarrow$ `EmployeesScreen`): Colleague roster with designation updates and role management.
9. **AI Bot** (`ChatbotTab` $\rightarrow$ `ChatbotScreen`): Gemini conversational assistant with task tool calling.
10. **Profile** (`ProfileTab` $\rightarrow$ `ProfileSettingsScreen`): Profile picture update, biometrics toggle, and account settings.

---

## 4. Storage Strategy & Biometric Security

Located at [src/services/storage.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/services/storage.ts) & [src/services/biometricService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/services/biometricService.ts):

### A. Dual Storage Pattern
- **Hardware-Backed SecureStore** (`expo-secure-store`): Used exclusively for sensitive JWT authentication tokens (`auth_token`). Encrypted on-device using Apple Keychain (iOS) and Android KeyStore (Android).
- **AsyncStorage** (`@react-native-async-storage/async-storage`): Used for non-sensitive data like user profile metadata, theme preferences, and cached task lists.

### B. Biometric Authentication
- [biometricService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/services/biometricService.ts) checks for hardware support (`hasHardwareAsync`) and enrolled biometrics (`isEnrolledAsync`).
- Prompts FaceID / Fingerprint scanner on `LoginScreen` for instant, passwordless app unlock.

---

## 5. State Management & Context Layer

### 1. `AuthContext` ([AuthContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/context/AuthContext.tsx))
- Restores active session on app mount from `safeStorage`.
- Injects JWT into mobile Axios headers (`Authorization: Bearer <token>`).
- Provides `login()`, `register()`, `logout()`, `updateUser()`, and `loginWithMock()` methods.

### 2. `TaskContext` ([TaskContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/context/TaskContext.tsx))
- Fetches tasks and employees from backend API.
- Automatically connects to `socketService` and listens for `task.created`, `task.updated`, `task.deleted` real-time events to update task lists instantly without pull-to-refresh.

### 3. `NotificationContext` & 4. `ThemeContext`
- Manages unread badge counters and dynamic Dark/Light palette switching (`colors.bg`, `colors.cardBg`, `colors.text`, `colors.accent`).

---

## 6. Networking, Axios & Real-Time Socket Service

### A. Mobile Axios Instance ([axios.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/services/axios.ts))
- Base URL configured from `EXPO_PUBLIC_API_URL` or [api.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/config/api.ts).
- Request Interceptor: Reads `auth_token_mobile` from `safeStorage` and attaches `Authorization: Bearer <token>`.
- Response Interceptor: Automatically clears tokens from device storage upon 401 Unauthorized or 403 Account Blocked.

### B. Mobile Socket Service ([socketService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/services/socketService.ts))
- Connects using `io(SOCKET_SERVER_URL, { auth: { token } })`.
- Handles connection retry with exponential backoff (2s to 10s delay).
- Automatically re-subscribes all registered UI screen listeners upon network reconnect.

---

## 7. Screen Catalog (20 Native Mobile Screens)

| Screen | File | Primary Functions & Visuals |
| :--- | :--- | :--- |
| **Login** | [LoginScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/LoginScreen.tsx) | Email/Password login, FaceID biometric button, mock login fallback. |
| **Register** | [RegisterScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/RegisterScreen.tsx) | Multi-field employee signup with inline SMS & Email OTP verification. |
| **Dashboard** | [DashboardScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/DashboardScreen.tsx) | Animated SVG task completion ring, KPI metrics, recent tasks, and quick actions. |
| **Tasks** | [TasksScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/TasksScreen.tsx) | Segmented status picker (`All`, `Pending`, `In Progress`, `Completed`), task cards, swipe actions. |
| **Attendance** | [AttendanceScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/AttendanceScreen.tsx) | Geolocation punch button, real-time hours timer, break tracker, and monthly calendar. |
| **Leave** | [LeaveScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/LeaveScreen.tsx) | Leave quota balance cards, leave application modal, and approval status tracker. |
| **Communication** | [CommunicationScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/CommunicationScreen.tsx) | Direct messages, channels list, group chats, and floating compose button. |
| **ChatDetail** | [ChatDetailScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ChatDetailScreen.tsx) | 1-on-1 and group messaging thread with photo attachments and timestamps. |
| **Chatbot** | [ChatbotScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ChatbotScreen.tsx) | Multi-session Gemini AI assistant with quick prompt pills and task creation tools. |
| **Docs RAG** | [DocumentRagScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/DocumentRagScreen.tsx) | Document upload, PDF chunk processing, and question answering with citations. |
| **Employees** | [EmployeesScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/EmployeesScreen.tsx) | Searchable employee directory, profile modal, designation editor, and admin blocking. |
| **Announcements** | [AnnouncementsScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/AnnouncementsScreen.tsx) | Broadcast bulletin board with priority tags and pin indicators. |
| **Calendar** | [CalendarScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/CalendarScreen.tsx) | Interactive monthly calendar displaying company holidays and task deadlines. |
| **CreateGroup** | [CreateGroupScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/CreateGroupScreen.tsx) | Multi-employee selection for group communication channels. |
| **ActivityLog** | [ActivityLogScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ActivityLogScreen.tsx) | Immutable activity logs tracking task edits, deletions, and status changes. |
| **Notifications** | [NotificationsScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/NotificationsScreen.tsx) | In-app alerts with read/unread toggle and deep linking to tasks. |
| **ProfileSettings** | [ProfileSettingsScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ProfileSettingsScreen.tsx) | Profile picture uploader, mobile/email OTP update, QR profile code, DPDP account purge. |
| **ForgotPassword** | [ForgotPasswordScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ForgotPasswordScreen.tsx) | Email/Phone OTP dispatch for password recovery. |
| **ResetPassword** | [ResetPasswordScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/ResetPasswordScreen.tsx) | Verification of reset OTP and setting of new password. |
| **Home** | [HomeScreen.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/screens/HomeScreen.tsx) | Fast navigation springboard. |

---

## 8. Native UI Components & SVG Progress Rings

- **[CircularProgressRing.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/components/CircularProgressRing.tsx)**: Built with `react-native-svg` (`Svg`, `Circle`, `G`, `Defs`, `LinearGradient`). Renders smooth completion percentage rings with gradient strokes.
- **[TaskAttachmentSection.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/components/TaskAttachmentSection.tsx)**: Embedded attachment carousel with preview thumbnails, full-screen image viewer, and delete buttons.
- **[SidebarDrawer.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/components/SidebarDrawer.tsx)**: Custom native slide-over menu for quick navigation across screens.

---

## 9. Media & Cloudinary Attachment Pipeline

Located at [src/utils/fileUploader.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/mobile-app/src/utils/fileUploader.ts):
- Requests camera roll permissions via `ImagePicker.requestMediaLibraryPermissionsAsync()`.
- Launches gallery picker via `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.7 })`.
- Formats file into `AttachmentItem`:
  ```typescript
  {
    id: `att_${Date.now()}_...`,
    name: asset.fileName || "Attachment.jpg",
    size: asset.fileSize,
    type: asset.mimeType,
    dataUrl: `data:${mimeType};base64,${asset.base64}`
  }
  ```

---

## 10. Configuration & Environment Standards

Managed via `mobile-app/.env`:

```env
# Backend API URL (Use local LAN IP for physical device testing, e.g. http://192.168.1.5:5000/api)
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

---

*This document is the definitive architectural blueprint for the React Native (Expo) mobile application. All future implementation steps, native UI modifications, and feature expansions must adhere to the navigation, context, and storage protocols specified herein.*
