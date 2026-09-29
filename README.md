# 🏢 Enterprise Employee Task Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v16.x-black.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_v57-blue.svg)](https://expo.dev/)
[![Swift](https://img.shields.io/badge/Swift-5.9_SwiftUI-orange.svg)](https://developer.apple.com/swift/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg)](https://socket.io/)
[![Cypress](https://img.shields.io/badge/Cypress-E2E_Testing-brightgreen.svg)](https://www.cypress.io/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An end-to-end, enterprise-grade **Employee Work & Task Management Platform** featuring:
- **Node.js / Express / TypeScript** Backend API
- **Next.js 16 (React 19)** Web Portal with Tailwind CSS
- **React Native (Expo SDK 57)** Cross-Platform Mobile Application
- **Native iOS (SwiftUI / Xcode)** Mobile Application (`WorkMate`)
- **Socket.IO** Real-Time Messaging & Status Synchronization Engine
- **Cypress & Jest** Comprehensive Automated Test Suites

---

## 🌟 Key Highlights & Core Capabilities

- 🔐 **Enterprise Auth & Security**: Dual-token JWT (Access + Refresh rotation), `bcrypt` password hashing, AES-256 field encryption, CSRF protection, and strict input validation.
- 📱 **Quad-Platform Parity**: Web Dashboard (Next.js 16), Cross-Platform Mobile (Expo 57), and Native iOS App (Pure SwiftUI).
- ⚡ **Real-Time Communication**: Live task status synchronization, group chat, direct messaging, and broadcast announcements via Socket.IO.
- 👥 **Role-Based Access Control (RBAC)**: Multi-tier permission hierarchy for `superadmin`, `admin`, and `member` (Employee).
- 📊 **Dynamic Data Visualizations**: SVG progress rings, priority bar graphs, and Recharts KPI analytics.
- 📎 **Task Attachment Manager**: Cloudinary media integration with mobile gallery picker & image previewers.
- ⏱️ **HR & Attendance Tracking**: Geolocation-enabled clock-in/out, live shift duration calculator, and monthly attendance calendar.
- 🏖️ **Leave Management System**: Quota allocation (Casual, Sick, Earned) with real-time manager approval/rejection workflows.

---

## 📸 Complete System Visual Tour & Screenshots

All **58 complete screens, interactive modal sheets, and full-length pages** across all tiers are cataloged and preserved in the repository:

### 1. 🌐 Web Portal (25 Complete Screens & Modals) - [`Screenshots/WEB APP/`](Screenshots/WEB%20APP)
| ID | Screenshot File | Key Features Captured |
|:---|:---|:---|
| 01 | [`01_Web_Login_Screen.png`](Screenshots/WEB%20APP/01_Web_Login_Screen.png) | Dual auth (Email/Password), remember me, responsive glass card |
| 02 | [`02_Web_Register_Screen.png`](Screenshots/WEB%20APP/02_Web_Register_Screen.png) | Role designation, department select, client-side validation |
| 03 | [`03_Web_Forgot_Password_Screen.png`](Screenshots/WEB%20APP/03_Web_Forgot_Password_Screen.png) | Secure email verification flow |
| 04 | [`04_Web_Reset_Password_Screen.png`](Screenshots/WEB%20APP/04_Web_Reset_Password_Screen.png) | Token verification & password complexity validator |
| 05 | [`05_Web_Verify_Account_Screen.png`](Screenshots/WEB%20APP/05_Web_Verify_Account_Screen.png) | 6-digit OTP email activation UI |
| 06 | [`06_Web_Dashboard_Full_Screen.png`](Screenshots/WEB%20APP/06_Web_Dashboard_Full_Screen.png) | Real-time KPIs, SVG Progress Ring, status donut chart, priority bars |
| 07 | [`07_Web_Tasks_Full_Screen.png`](Screenshots/WEB%20APP/07_Web_Tasks_Full_Screen.png) | Multi-filter task table, priority badges, assignee avatars, action menus |
| 08 | [`08_Web_Tasks_Create_Modal.png`](Screenshots/WEB%20APP/08_Web_Tasks_Create_Modal.png) | Complete task authoring form (title, desc, priority, assignees, dates) |
| 09 | [`09_Web_Attendance_Full_Screen.png`](Screenshots/WEB%20APP/09_Web_Attendance_Full_Screen.png) | Live punch in/out clock, location validator, weekly hours breakdown |
| 10 | [`10_Web_Leave_Table_Full_Screen.png`](Screenshots/WEB%20APP/10_Web_Leave_Table_Full_Screen.png) | Quota balances, status chips, multi-select filters, approvals |
| 11 | [`11_Web_Leave_Calendar_Full_Screen.png`](Screenshots/WEB%20APP/11_Web_Leave_Calendar_Full_Screen.png) | Monthly leave overview with color-coded employee badges |
| 12 | [`12_Web_Leave_Apply_Modal.png`](Screenshots/WEB%20APP/12_Web_Leave_Apply_Modal.png) | Date range picker, half-day toggle, reason input |
| 13 | [`13_Web_Employees_Directory_Full_Screen.png`](Screenshots/WEB%20APP/13_Web_Employees_Directory_Full_Screen.png) | Employee grid, designations, roles, contact cards |
| 14 | [`14_Web_Employees_Add_Member_Modal.png`](Screenshots/WEB%20APP/14_Web_Employees_Add_Member_Modal.png) | Add Team Member / Create User modal |
| 15 | [`15_Web_Communication_Inbox_Screen.png`](Screenshots/WEB%20APP/15_Web_Communication_Inbox_Screen.png) | Direct messages & group channels, real-time thread |
| 16 | [`16_Web_Communication_Announcements_Screen.png`](Screenshots/WEB%20APP/16_Web_Communication_Announcements_Screen.png) | Company-wide broadcast alerts & priority tags |
| 17 | [`17_Web_Communication_Analytics_Screen.png`](Screenshots/WEB%20APP/17_Web_Communication_Analytics_Screen.png) | Team engagement metrics & message volume charts |
| 18 | [`18_Web_Calendar_Schedule_Full_Screen.png`](Screenshots/WEB%20APP/18_Web_Calendar_Schedule_Full_Screen.png) | Full monthly calendar with project deadlines & holidays |
| 19 | [`19_Web_Calendar_Notepad_View.png`](Screenshots/WEB%20APP/19_Web_Calendar_Notepad_View.png) | Integrated markdown notes & sprint planning scratchpad |
| 20 | [`20_Web_Calendar_Add_Holiday_Modal.png`](Screenshots/WEB%20APP/20_Web_Calendar_Add_Holiday_Modal.png) | Company holiday creator with calendar sync |
| 21 | [`21_Web_Profile_Full_Screen.png`](Screenshots/WEB%20APP/21_Web_Profile_Full_Screen.png) | Super Admin Profile overview & personal records |
| 22 | [`22_Web_Settings_Profile_Full_Screen.png`](Screenshots/WEB%20APP/22_Web_Settings_Profile_Full_Screen.png) | System configuration, theme toggle, notifications |
| 23 | [`23_Web_Settings_Security_Full_Screen.png`](Screenshots/WEB%20APP/23_Web_Settings_Security_Full_Screen.png) | Password rotation, 2-factor authentication controls |
| 24 | [`24_Web_Settings_Data_Download_Screen.png`](Screenshots/WEB%20APP/24_Web_Settings_Data_Download_Screen.png) | DPDP Act 2023 compliant data export (JSON/CSV) |
| 25 | [`25_Web_Archive_Full_Screen.png`](Screenshots/WEB%20APP/25_Web_Archive_Full_Screen.png) | Soft-deleted tasks and completed records repository |

---

### 2. 📱 Native iOS App (17 Simulator Retina Screens) - [`Screenshots/IOS APP/`](Screenshots/IOS%20APP)
| ID | Screenshot File | Key Features Captured |
|:---|:---|:---|
| 01 | [`01_iOS_Login_Screen.png`](Screenshots/IOS%20APP/01_iOS_Login_Screen.png) | SwiftUI glassmorphism cards, biometric triggers |
| 02 | [`02_iOS_Register_Screen.png`](Screenshots/IOS%20APP/02_iOS_Register_Screen.png) | Pure SwiftUI form controls & validation |
| 03 | [`03_iOS_Forgot_Password_Screen.png`](Screenshots/IOS%20APP/03_iOS_Forgot_Password_Screen.png) | SwiftUI reset credential sheet |
| 04 | [`04_iOS_Dashboard_Screen.png`](Screenshots/IOS%20APP/04_iOS_Dashboard_Screen.png) | Native SVG Donut chart, Sparklines, active shift card |
| 05 | [`05_iOS_Tasks_Screen.png`](Screenshots/IOS%20APP/05_iOS_Tasks_Screen.png) | Categorized task rows with status toggles |
| 06 | [`06_iOS_Team_Directory_Screen.png`](Screenshots/IOS%20APP/06_iOS_Team_Directory_Screen.png) | Native iOS list with quick call/message actions |
| 07 | [`07_iOS_Leave_Portal_Screen.png`](Screenshots/IOS%20APP/07_iOS_Leave_Portal_Screen.png) | Leave quotas, balance cards, historical requests |
| 08 | [`08_iOS_More_Menu_Screen.png`](Screenshots/IOS%20APP/08_iOS_More_Menu_Screen.png) | Navigation grid to sub-modules & settings |
| 09 | [`09_iOS_Attendance_Clock_Screen.png`](Screenshots/IOS%20APP/09_iOS_Attendance_Clock_Screen.png) | Native GPS punch-in with live circular timer |
| 10 | [`10_iOS_Calendar_Holidays_Screen.png`](Screenshots/IOS%20APP/10_iOS_Calendar_Holidays_Screen.png) | SwiftUI holiday list & scheduled items |
| 11 | [`11_iOS_Messages_Inbox_Screen.png`](Screenshots/IOS%20APP/11_iOS_Messages_Inbox_Screen.png) | Real-time chat threads & message composer |
| 12 | [`12_iOS_Profile_Screen.png`](Screenshots/IOS%20APP/12_iOS_Profile_Screen.png) | Native user card, role indicators, logout button |
| 13 | [`13_iOS_Archive_Screen.png`](Screenshots/IOS%20APP/13_iOS_Archive_Screen.png) | Archived records manager |
| 14 | [`14_iOS_Notifications_Screen.png`](Screenshots/IOS%20APP/14_iOS_Notifications_Screen.png) | Interactive in-app notification center |
| 15 | [`15_iOS_Create_Task_Sheet.png`](Screenshots/IOS%20APP/15_iOS_Create_Task_Sheet.png) | SwiftUI modal sheet with date pickers & priority segmented control |
| 16 | [`16_iOS_Apply_Leave_Sheet.png`](Screenshots/IOS%20APP/16_iOS_Apply_Leave_Sheet.png) | SwiftUI modal sheet with leave type picker |
| 17 | [`17_iOS_Compose_Message_Sheet.png`](Screenshots/IOS%20APP/17_iOS_Compose_Message_Sheet.png) | Direct message recipient picker & text input |

---

### 3. 📲 Mobile App (16 Cross-Platform Screens) - [`Screenshots/MOBILE APP/`](Screenshots/MOBILE%20APP)
| ID | Screenshot File | Key Features Captured |
|:---|:---|:---|
| 01 | [`01_Mobile_Welcome_Screen.png`](Screenshots/MOBILE%20APP/01_Mobile_Welcome_Screen.png) | Seamless entry point for Phone & Email logins |
| 02 | [`02_Mobile_Register_Screen.png`](Screenshots/MOBILE%20APP/02_Mobile_Register_Screen.png) | Mobile registration with department selector |
| 03 | [`03_Mobile_Login_Phone_Screen.png`](Screenshots/MOBILE%20APP/03_Mobile_Login_Phone_Screen.png) | OTP phone authentication flow |
| 04 | [`04_Mobile_Login_Email_Screen.png`](Screenshots/MOBILE%20APP/04_Mobile_Login_Email_Screen.png) | Email/Password login interface |
| 05 | [`05_Mobile_Forgot_Password_Screen.png`](Screenshots/MOBILE%20APP/05_Mobile_Forgot_Password_Screen.png) | Mobile password recovery |
| 06 | [`06_Mobile_Dashboard_Screen.png`](Screenshots/MOBILE%20APP/06_Mobile_Dashboard_Screen.png) | Mobile KPI cards, donut chart, task summary |
| 07 | [`07_Mobile_Tasks_Screen.png`](Screenshots/MOBILE%20APP/07_Mobile_Tasks_Screen.png) | Touch-optimized task list with priority chips |
| 08 | [`08_Mobile_Calendar_Screen.png`](Screenshots/MOBILE%20APP/08_Mobile_Calendar_Screen.png) | Integrated calendar view with day schedule |
| 09 | [`09_Mobile_Docs_RAG_Screen.png`](Screenshots/MOBILE%20APP/09_Mobile_Docs_RAG_Screen.png) | Semantic document chunks & enterprise knowledge base |
| 10 | [`10_Mobile_Communication_Screen.png`](Screenshots/MOBILE%20APP/10_Mobile_Communication_Screen.png) | Group & direct chat channels |
| 11 | [`11_Mobile_Attendance_Screen.png`](Screenshots/MOBILE%20APP/11_Mobile_Attendance_Screen.png) | Mobile time clock with punch in/out |
| 12 | [`12_Mobile_Leave_Screen.png`](Screenshots/MOBILE%20APP/12_Mobile_Leave_Screen.png) | Leave requests & balances |
| 13 | [`13_Mobile_Team_Screen.png`](Screenshots/MOBILE%20APP/13_Mobile_Team_Screen.png) | Searchable employee roster |
| 14 | [`14_Mobile_Chatbot_AI_Screen.png`](Screenshots/MOBILE%20APP/14_Mobile_Chatbot_AI_Screen.png) | Integrated AI chatbot assistant for employee queries |
| 15 | [`15_Mobile_Profile_Settings_Screen.png`](Screenshots/MOBILE%20APP/15_Mobile_Profile_Settings_Screen.png) | Full user profile, account settings & preferences |
| 16 | [`16_Mobile_Notifications_Modal.png`](Screenshots/MOBILE%20APP/16_Mobile_Notifications_Modal.png) | Slide-over notification panel |

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |   Next.js 16 Web      |
                                  |   Dashboard Portal    |
                                  +-----------+-----------+
                                              |
                                              |  HTTPS / REST / WSS
                                              v
+-----------------------+         +-----------+-----------+         +-----------------------+
|  React Native (Expo)  |  REST / |   Node.js / Express   | Mongoose|   MongoDB Atlas DB    |
|   Mobile Application  +-------->|  TypeScript Backend   +-------->|  (Indexed & Encrypted)|
+-----------------------+  WSS    +-----------+-----------+         +-----------------------+
                                              ^
+-----------------------+                     |
|   Native iOS App      |      REST / WSS     |
|   (Swift 5.9/SwiftUI) +---------------------+
+-----------------------+                     |
                                              | API / SDK Integrations
                                              v
                               +--------------+--------------+
                               |  Cloudinary (Media Storage) |
                               |  SMTP & Twilio (OTP Gateway)|
                               +-----------------------------+
```

---

## 📂 Repository Structure

```
Enterprise Employee Task Management System/
├── backend/                        # Node.js, Express & TypeScript REST API
│   ├── src/
│   │   ├── config/                 # Database & Cloudinary configurations
│   │   ├── controllers/            # Business logic controllers (auth, task, leave, attendance, etc.)
│   │   ├── middleware/             # JWT Auth, Validation, & Error Handlers
│   │   ├── models/                 # Mongoose Database Schemas
│   │   ├── realtime/               # Socket.IO event publishers & rooms
│   │   ├── routes/                 # Express API endpoints
│   │   ├── services/               # Core business services
│   │   ├── tests/                  # Jest Unit & Integration Test Suites
│   │   └── server.ts               # Server launcher with Node clustering
│   └── package.json
│
├── web-frontend/                   # Next.js 16 Web Dashboard
│   ├── src/
│   │   ├── app/                    # Next.js App Router (Tasks, Attendance, Employees, etc.)
│   │   ├── components/             # Reusable UI cards, tables, charts & modals
│   │   ├── context/                # Auth, Task, Attendance, Leave, & Communication Contexts
│   │   └── services/               # Axios API clients & Socket Listeners
│   ├── cypress/                    # Cypress E2E Automated Test Suites (7 Specs)
│   └── package.json
│
├── mobile-app/                     # React Native / Expo 57 Mobile App
│   ├── src/
│   │   ├── components/             # Native UI components (SVG Ring, Attachment Section)
│   │   ├── context/                # Mobile Auth, Task & Theme Contexts
│   │   ├── navigation/             # React Navigation Root & Tab Stack
│   │   ├── screens/                # Native Mobile Screens
│   │   └── utils/                  # Expo File Picker & Cloudinary Uploader
│   └── package.json
│
├── IOS app/                        # Native iOS SwiftUI Application
│   ├── EnterpriseTaskSystemIOS/
│   │   ├── App/                    # App Router and Main View lifecycle
│   │   ├── Components/             # Native SwiftUI Components (Sparkline, Donut, Progress)
│   │   ├── Core/                   # APIClient, AuthManager, Keychain, WebSockets
│   │   ├── DesignSystem/           # AppTheme, Typography, Colors, Gradients
│   │   ├── ViewModels/             # ObservableObject MVVM ViewModels
│   │   └── Views/                  # Dashboard, Tasks, Attendance, Chat, Profile Views
│   └── EnterpriseTaskSystemIOS.xcodeproj
│
└── Abhishek/                       # Custom documentation & implementation master plans
```

---

## ⚙️ Module Breakdown & Feature Set

### 1. Task Lifecycle & Management
- **Creation & Assignment**: Multi-assignee support with priority levels (`low`, `medium`, `high`, `urgent`), due dates, subtask checklists, and custom categories.
- **Attachments**: Drag-and-drop file uploads on Web, gallery picker on Mobile, and native PhotosPicker on iOS via Cloudinary.
- **Audit Log**: Immutable activity trail (`TaskAuditLog.ts`) recording every change and status transition.

### 2. HR, Attendance & Leave System
- **Attendance Check-In/Out**: Real-time timer, duration calculator, GPS coordinate verification, and monthly calendar.
- **Leave Management**: Employee leave balance tracking (Casual, Sick, Earned) with instant manager approval/rejection workflows.

### 3. Real-Time Chat & Communication
- **Direct & Group Channels**: Socket.IO powered messaging threads.
- **Broadcast Announcements**: Organization-wide high-priority alerts with push synchronization.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: Active MongoDB Atlas URI
- **Xcode**: Version 15+ (for Native iOS App on macOS)

---

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Server starts on **`http://localhost:5000`** (API at `http://localhost:5000/api`).

### 2. Web Frontend Setup
```bash
cd web-frontend
npm install
npm run dev
```
- Web Application will be available at **`http://localhost:3000`**.

### 3. Cross-Platform Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```
- Scan QR code using **Expo Go** on Android/iOS or press `w` for Web.

### 4. Native iOS App Setup (macOS)
1. Open Xcode.
2. Open `IOS app/EnterpriseTaskSystemIOS.xcodeproj`.
3. Select scheme **`WorkMate`** and target **iPhone 15/16 Pro Simulator**.
4. Press **`Cmd + R`** to build and run.

---

## 🧪 Testing & Quality Assurance

### Run Backend Unit Tests (Jest)
```bash
cd backend
npm test
```
*Executes all test suites covering authentication, mass assignment protection, pagination, and phone/email validators.*

### Run Web Frontend E2E Tests (Cypress)
```bash
cd web-frontend
npx cypress run
```
*Executes 7 end-to-end test suites verifying authentication, registration, RBAC, task lifecycle, leave management, pagination, and responsive design.*

---

## 🔑 Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Mobile App (`mobile-app/.env`)
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

### Web Frontend (`web-frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## 🛡️ License & Authorship
- **Project**: Enterprise Employee Task & Work Management System
- **Author**: Abhishek Yadav ([@AbhishekYadav](https://gitlab.mobiloitte.io/AbhishekYadav))
- **Repository Branch**: `Abhishek_Yadav_dev`
- **License**: MIT
