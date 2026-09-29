# 🎨 Enterprise Web Frontend Architectural Specification & Reference Manual

> **Purpose & Directive**: This document serves as the single source of truth for the Next.js 16 / React 19 / TypeScript Web Frontend architecture. Whenever future development, state management updates, API integrations, real-time sync, or component development tasks are requested, this architecture must be strictly referenced and upheld.

---

## 📑 Table of Contents
1. [Tech Stack & System Topology](#1-tech-stack--system-topology)
2. [Folder & Directory Structure](#2-folder--directory-structure)
3. [Routing & App Router Layout Topology](#3-routing--app-router-layout-topology)
4. [Global State Management & React Context Layer (7 Contexts)](#4-global-state-management--react-context-layer-7-contexts)
5. [API Client, Interceptors & Silent Token Refresh](#5-api-client-interceptors--silent-token-refresh)
6. [Real-Time WebSocket Client (Socket.IO)](#6-real-time-websocket-client-socketio)
7. [Component Architecture & Modular UI Design](#7-component-architecture--modular-ui-design)
8. [Design Aesthetics, Dark Mode & UX Standards](#8-design-aesthetics-dark-mode--ux-standards)
9. [Environment Variables & Configuration Standards](#9-environment-variables--configuration-standards)

---

## 1. Tech Stack & System Topology

The Web Frontend is built with cutting-edge web technologies:
- **Framework**: **Next.js 16.2.9** (App Router architecture)
- **UI Library**: **React 19.2.4** & **React DOM 19.2.4**
- **Language**: **TypeScript 5.9.3**
- **Styling**: **Tailwind CSS v4** (`@tailwindcss/postcss`) with custom dark/light theme tokens and glassmorphic micro-interactions
- **Icons**: **Lucide React** (`lucide-react`)
- **Data Fetching & Cache**: **TanStack React Query v5** (`@tanstack/react-query`)
- **HTTP Client**: **Axios v1.18.1** with automatic Anti-CSRF token injection and silent refresh token interceptors
- **Real-Time Client**: **Socket.IO Client v4.8.3** (`socket.io-client`)
- **Data Visualizations**: **Recharts v3.9.0** (Pie, Bar, Area & KPI rings)
- **Toast Notifications**: **Sonner v2.0.7** (`sonner`)
- **PDF Report Generation**: **jsPDF** & **jspdf-autotable**

---

## 2. Folder & Directory Structure

```
web-frontend/
├── package.json                   # Dependencies, scripts & build tools
├── tsconfig.json                  # Strict TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS with Tailwind v4 plugin
├── public/                        # Static assets, icons, logos
├── src/
│   ├── api/                       # Modular Axios API functions
│   │   ├── auth.ts                # Auth API endpoints (login, register, OTPs, profile)
│   │   ├── communication.ts       # Chat & announcement API calls
│   │   ├── mockAuth.ts            # Mock auth fallbacks
│   │   └── tasks.ts               # Task CRUD & employee query APIs
│   ├── app/                       # Next.js 16 App Router pages & routes
│   │   ├── layout.tsx             # Root layout wrapping all Providers
│   │   ├── page.tsx               # Main Dashboard with KPI analytics & feeds
│   │   ├── login/                 # Login screen (Password & OTP passwordless)
│   │   ├── register/              # Signup screen with inline SMS & Email OTP
│   │   ├── forgot-password/       # Password recovery flow
│   │   ├── reset-password/        # Password reset confirmation
│   │   ├── verify-account/        # Account verification screen
│   │   ├── tasks/                 # Task Board (Kanban, List, Attachments, Modals)
│   │   ├── attendance/            # Clock-in/out, Timer, Monthly Attendance Grid
│   │   ├── leave/                 # Leave portal, Quota cards & Approval actions
│   │   ├── employees/             # Employee directory, roles, and status
│   │   ├── communication/         # Real-time Chat, Group Channels & Announcements
│   │   ├── calendar/              # Company holiday calendar & schedule
│   │   ├── archive/               # Trash / Archived tasks & users manager
│   │   ├── profile/               # User profile, photo upload & OTP updates
│   │   └── settings/              # System settings & DPDP account erasure
│   ├── components/                # Reusable UI component modules
│   │   ├── Header.tsx             # Top navigation bar with user profile dropdown
│   │   ├── Sidebar.tsx            # Left navigation sidebar with active link badges
│   │   ├── LayoutGuard.tsx        # Auth route guard & ambient glow background
│   │   ├── ProtectedRoute.tsx     # Client-side route protection wrapper
│   │   ├── ThemeToggle.tsx        # Dark / Light theme switch
│   │   ├── AccessibilityToggle.tsx# Accessibility font & contrast adjustments
│   │   ├── MockAuthBanner.tsx     # Mock auth indicator banner
│   │   ├── analytics/             # KPI cards, Pie charts, and Bar charts
│   │   ├── attendance/            # Clock-in actions, summary cards, attendance tables
│   │   ├── calendar/              # Holiday calendar grid & date pickers
│   │   ├── communication/         # Chat hubs, compose modal, message bubbles, announcements
│   │   ├── employee/              # Employee cards, designation editors, modals
│   │   ├── leave/                 # Leave form, balance cards, approval details modal
│   │   ├── profile/               # Profile form, avatar cropper, password reset
│   │   ├── task/                  # Task cards, editor modals, details modal, attachment panel
│   │   └── ui/                    # Modals, empty states, confirmation dialogs, dropdowns
│   ├── constants/                 # Centralized mock data & UI options
│   ├── context/                   # 7 React Context state providers
│   │   ├── AttendanceContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── CommunicationContext.tsx
│   │   ├── LeaveContext.tsx
│   │   ├── NotificationContext.tsx
│   │   ├── TaskContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/                      # Initial mock communications & notifications
│   ├── hooks/                     # Custom React hooks
│   ├── providers/                 # TanStack QueryProvider
│   ├── services/                  # Global Axios client & Socket.IO client manager
│   │   ├── axios.ts
│   │   └── socketClient.ts
│   ├── styles/                    # Global CSS & Tailwind utilities (`globals.css`)
│   ├── types/                     # TypeScript models for all domain entities
│   └── utils/                     # Formatting, error handling & date helpers
```

---

## 3. Routing & App Router Layout Topology

### A. Root Layout & Provider Hierarchy (`src/app/layout.tsx`)
All client routes are enclosed in the following provider hierarchy:

```tsx
<QueryProvider>                     {/* TanStack React Query cache */}
  <AuthProvider>                    {/* Authentication state & HTTP-Only cookie sync */}
    <TaskProvider>                  {/* Tasks, employees & activity log state */}
      <ThemeProvider>               {/* Light / Dark theme tokens */}
        <CommunicationProvider>     {/* Chat, groups & announcements */}
          <NotificationProvider>    {/* In-app real-time notification alerts */}
            <LayoutGuard>           {/* Auth guard + Header + Sidebar + Ambient Glow */}
              {children}
            </LayoutGuard>
            <Toaster richColors position="top-right" closeButton />
            <MockAuthBanner />
          </NotificationProvider>
        </CommunicationProvider>
      </ThemeProvider>
    </TaskProvider>
  </AuthProvider>
</QueryProvider>
```

### B. Route Protection & Layout Guard (`src/components/LayoutGuard.tsx`)
- **Public Auth Pages**: `/login`, `/register`, `/forgot-password`, `/reset-password` render without Header or Sidebar.
- **Protected Pages**: When unauthenticated, automatically redirects to `/login`.
- **Ambient Visuals**: Injects fixed ambient glow gradients (`blue-400/20`, `indigo-400/20`, `purple-400/15`) with blur effects.

---

## 4. Global State Management & React Context Layer (7 Contexts)

### 1. `AuthContext` ([AuthContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/context/AuthContext.tsx))
- **Responsibilities**: User login, registration, logout, profile update, account deletion, phone/email OTP verification.
- **Storage Strategy**: User profile metadata is stored in `localStorage` (`auth_user`); tokens are securely managed via **HTTP-Only cookies** (`token`, `refreshToken`).
- **Methods**: `login()`, `logout()`, `register()`, `updateUser()`, `deleteAccount()`, `forgotPassword()`, `resetPassword()`, `requestPhoneChangeOtp()`, `verifyPhoneChangeOtp()`, `requestEmailChangeOtp()`, `verifyEmailChangeOtp()`.

### 2. `TaskContext` ([TaskContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/context/TaskContext.tsx))
- **Responsibilities**: Tasks list, active employee roster, activity logs, task creation, updates, and filtering.
- **Real-Time Integration**: Subscribes to Socket.IO events (`task.created`, `task.updated`, `task.deleted`) and updates local state dynamically.
- **Methods**: `addTask()`, `updateTask()`, `updateTaskStatus()`, `updateTaskPriority()`, `assignTask()`, `deleteTask()`, `addEmployee()`, `updateEmployeeDesignation()`, `updateEmployeeRole()`, `removeEmployee()`, `blockEmployee()`, `unblockEmployee()`.

### 3. `AttendanceContext` ([AttendanceContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/context/AttendanceContext.tsx))
- **Responsibilities**: Today's punch record, historical attendance calendar, team analytics.
- **Methods**: `fetchRecords()`, `fetchTodayRecord()`, `fetchAnalytics()`, `checkIn()`, `checkOut()`, `markBreakStart()`, `markBreakEnd()`, `updateRecord()`.

### 4. `LeaveContext` ([LeaveContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/context/LeaveContext.tsx))
- **Responsibilities**: Employee leave requests, annual quota balance ledger, manager approval/rejection.
- **Real-Time Sync**: Subscribes to `leave.created`, `leave.approved`, `leave.rejected` to automatically re-fetch leaves and balances.
- **Methods**: `fetchLeaves()`, `fetchBalance()`, `fetchStats()`, `applyLeave()`, `updateLeaveStatus()`, `deleteLeave()`.

### 5. `CommunicationContext` ([CommunicationContext.tsx](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/context/CommunicationContext.tsx))
- **Responsibilities**: 1-on-1 direct messaging, group chat channels, company announcements, broadcast composer, draft saving.
- **Methods**: `sendMessage()`, `replyToConversation()`, `createGroup()`, `addMembersToGroup()`, `createAnnouncement()`, `pinAnnouncement()`, `deleteAnnouncement()`, `sendBroadcast()`, `saveDraft()`, `selectConversation()`.

### 6. `NotificationContext` & 7. `ThemeContext`
- Handles in-app notification toasts/counters and Dark/Light theme switches with DOM class toggling (`dark`).

---

## 5. API Client, Interceptors & Silent Token Refresh

Located at [src/services/axios.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/services/axios.ts):

### Request Interceptor
- Extracts `_csrf_token` cookie and injects it into `x-csrf-token` header:
  ```typescript
  const match = document.cookie.match(new RegExp('(^| )_csrf_token=([^;]+)'));
  if (match && match[2]) config.headers['x-csrf-token'] = match[2];
  ```

### Response Interceptor & Silent Refresh Flow
- **401 Unauthorized Handling**:
  1. Catches initial 401 error.
  2. Sets `originalRequest._retry = true`.
  3. Sends request to `/api/auth/refresh` with credentials to rotate tokens.
  4. If successful, automatically replays `originalRequest`.
  5. If refresh fails, purges local user state and redirects to `/login`.
- **403 Forbidden Handling**:
  - Displays descriptive toast message.
  - If account is blocked or deactivated by admin $\rightarrow$ forces logout and redirect to `/login`.
- **Network Error Throttle**: Limits network failure toasts to once every 5 seconds.

---

## 6. Real-Time WebSocket Client (Socket.IO)

Located at [src/services/socketClient.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/web-frontend/src/services/socketClient.ts):

### Client Manager Pattern (`SocketClientManager`)
- **Connection**: `socketClient.connect()` initializes connection to backend with `withCredentials: true`, `transports: ['websocket', 'polling']`, and auto-reconnection (5 attempts).
- **Subscription API**:
  ```typescript
  const unsubscribe = socketClient.subscribe('task.created', (envelope) => {
    // Process new task
  });
  // Call unsubscribe() on component unmount
  ```
- **Dynamic Re-binding**: Keeps an internal `listenersMap` to automatically re-bind all registered callbacks upon reconnects.

---

## 7. Component Architecture & Modular UI Design

### Key Component Modules
1. **Task Module** (`components/task/`):
   - `TaskCard.tsx`: Kanban card with priority badge, status color, assignee avatar, and due date indicator.
   - `TaskTable.tsx`: Full-featured table with sorting, pagination, and multi-select actions.
   - `TaskEditorModal.tsx`: Creation and edit modal with field validation and attachment file uploader.
   - `TaskDetailsModal.tsx`: Comprehensive task view with subtasks checklist, audit logs, and file downloads.
   - `AttachmentPanel.tsx`: Cloudinary attachment drag-and-drop file uploader (supports PDF, PNG, JPG, DOCX, XLSX).
   - `EnterpriseDateRangePicker.tsx`: Dual-calendar date range selector.

2. **Attendance Module** (`components/attendance/`):
   - `AttendanceActions.tsx`: Animated Check-In / Check-Out and Break Start / End buttons.
   - `AttendanceSummaryCards.tsx`: Displays today's presence status, late minutes, and working hours.
   - `AttendanceTable.tsx`: Monthly calendar grid view and historical filterable logs.

3. **Leave Module** (`components/leave/`):
   - `LeaveForm.tsx`: Modal to apply for 12 leave types with session selection (Morning/Afternoon half-day).
   - `LeaveBalanceCard.tsx`: Interactive SVG balance meters displaying remaining vs used leave days.
   - `LeaveTable.tsx`: Admin approval/rejection action buttons with rejection reason input modal.

4. **Communication Hub** (`components/communication/`):
   - `CommunicationHub.tsx`: Unified workspace containing Inbox, Sent, Group Channels, Announcements, and Drafts.
   - `ComposeModal.tsx`: Rich message composer with multi-recipient selection, priority flags, and attachments.
   - `CreateGroupModal.tsx`: Group creation modal with employee member pickers.

---

## 8. Design Aesthetics, Dark Mode & UX Standards

- **Tailwind CSS v4 Design Tokens**:
  - Light mode: Clean slate/zinc backgrounds (`bg-zinc-50`, `bg-white`) with subtle borders (`border-zinc-200/60`).
  - Dark mode: Deep OLED dark backgrounds (`dark:bg-zinc-950`, `dark:bg-zinc-900/50`) with slate borders (`dark:border-zinc-800`).
- **Typography**: Modern typography using Google Fonts **Geist** (`--font-geist-sans`) and **Geist Mono** (`--font-geist-mono`).
- **Micro-Interactions**: Hover scales (`hover:scale-[1.01]`), smooth transitions (`transition-all duration-300`), pulse glows, and glassmorphic card overlays (`backdrop-blur-sm`).
- **Responsive Layout**: Full desktop sidebar + mobile sliding drawer menu with hamburger toggle in header.

---

## 9. Environment Variables & Configuration Standards

Managed via `web-frontend/.env.local`:

```env
# API Backend Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# WebSocket Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

*This document is the definitive architectural blueprint for the web frontend application. All future implementation steps, UI updates, and feature expansions must adhere to the component structures, context hooks, and design protocols specified herein.*
