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
