# 🏢 Enterprise Employee Task Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v16.x-black.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_v57-blue.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An end-to-end, enterprise-grade **Employee Work & Task Management Platform** featuring a **Node.js/TypeScript Backend**, **Next.js Web Portal**, **React Native (Expo) Mobile Application**, **Socket.IO Real-Time Engine**, and **Google Gemini AI RAG (Retrieval-Augmented Generation)** document analysis capabilities.

---

## 🌟 Key Highlights & Core Capabilities

- 🔐 **Enterprise Auth & Security**: Dual-token JWT (Access + Refresh), `bcrypt` password hashing, AES-256 field encryption, CSRF protection, and DPDP Act 2023 compliance.
- 📱 **Cross-Platform Parity**: Web Dashboard (Next.js 16) + Native Mobile App (React Native/Expo 57).
- ⚡ **Real-Time Communication**: Live task status synchronization, group chat, direct messaging, and broadcast notifications via Socket.IO.
- 🤖 **AI-Powered RAG Engine**: Vector embeddings and intelligent document Q&A using Google Gemini AI (`@google/generative-ai`).
- 👥 **Role-Based Access Control (RBAC)**: Fine-grained permissions for `superadmin`, `admin`, and `member` (Employee).
- 📊 **Dynamic Data Visualizations**: SVG progress rings, priority bar graphs, and Recharts KPI analytics.
- 📎 **Task Attachment Manager**: Cloudinary media integration with mobile gallery picker & full-screen image previewer.
- ⏱️ **HR & Attendance Tracking**: Geolocation-enabled clock-in/out, duration calculation, and leave application workflows.

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
                                              |
                                              | API / SDK Integrations
                                              v
                               +--------------+--------------+
                               |  Cloudinary (Media Storage) |
                               |  Gemini AI (RAG Embeddings) |
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
│   │   ├── controllers/            # 11 Express business logic controllers
│   │   ├── middleware/             # JWT Auth, Validation, & Error Handlers
│   │   ├── models/                 # 22 Mongoose Database Schemas
│   │   ├── realtime/               # Socket.IO event publishers & rooms
│   │   ├── routes/                 # Express API endpoints
│   │   ├── services/               # Core business services & Gemini RAG
│   │   └── server.ts               # Primary server launcher with Clustering
│   └── package.json
│
├── web-frontend/                   # Next.js 16 Web Dashboard
│   ├── src/
│   │   ├── app/                    # Next.js App Router (Tasks, Attendance, Employees, etc.)
│   │   ├── components/             # Reusable UI cards, tables, charts & modals
│   │   ├── context/                # Auth, Task, Chat, & Theme React Contexts
│   │   └── services/               # Axios API clients & Socket Listeners
│   └── package.json
│
└── mobile-app/                     # React Native / Expo 57 Mobile App
    ├── src/
    │   ├── components/             # Native UI components (SVG Ring, Attachment Section)
    │   ├── context/                # Mobile Auth, Task & Theme Contexts
    │   ├── navigation/             # React Navigation Root & Tab Stack
    │   ├── screens/                # 20 Native Mobile Screens
    │   └── utils/                  # Expo File Picker & Cloudinary Uploader
    └── package.json
```

---

## ⚙️ Module Breakdown & Feature Set

### 1. Task Lifecycle & Management
- **Task Creation & Assignment**: Multi-assignee support with priority setting (`low`, `medium`, `high`, `urgent`), due dates, subtask checklists, and category tags.
- **Attachments**: Drag-and-drop file uploads on Web and Expo gallery picker on Mobile via Cloudinary.
- **Audit Log**: Complete immutable activity trail (`TaskAuditLog.ts`) tracking every status change or edit.

### 2. HR, Attendance & Leave System
- **Attendance Check-In/Out**: Real-time timer, duration calculator, and monthly attendance calendar.
- **Leave Management**: Employee leave balance tracking (Casual, Sick, Earned) with manager approval/rejection workflows.

### 3. AI Document Engine (RAG)
- **Document Ingestion**: PDF document chunking and vector embedding generation using `@google/generative-ai`.
- **Intelligent Q&A**: Contextual AI answers based strictly on internal company documents.

### 4. Real-Time Chat & Communication
- **Direct & Group Chat**: Socket.IO powered messaging channels.
- **Announcements**: High-priority broadcast notifications published to all employees.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: Active MongoDB Atlas URI

---

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Server will start on **`http://localhost:5000`**

### 2. Web Frontend Setup
```bash
cd web-frontend
npm install
npm run dev
```
- Web App will be available at **`http://localhost:3000`**

### 3. Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```
- Scan QR code using **Expo Go** on Android/iOS or press `w` to open in browser.

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
GEMINI_API_KEY=your_gemini_api_key
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

## 🛡️ License & Credits
Developed as an **Enterprise Employee Work Management Platform**. Released under the MIT License.
