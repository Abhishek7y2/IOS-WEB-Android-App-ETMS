# 🏢 Enterprise Employee Task & Workforce Management System (ETMS)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4.22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_7.8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Multimodal_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#-license)

---

## 📌 Executive Overview

The **Enterprise Employee Task & Workforce Management System (ETMS)** is a production-grade, full-stack enterprise SaaS platform designed to streamline workforce management, task delegation, leave tracking, employee attendance, real-time internal communication, and AI-driven document intelligence (RAG). 

Engineered with modern microservices-ready architecture, strict **Role-Based Access Control (RBAC)**, **DPDP Act 2023 compliance**, **AES-256-GCM encryption**, and a zero-trust security paradigm, ETMS scales seamlessly from small teams to enterprise-level organizations.

---

## 🌟 Key Enterprise Capabilities

### 🛡️ 1. Security & DPDP Act 2023 Compliance
* **AES-256-GCM Data Encryption:** All sensitive OTPs and verification tokens are encrypted at rest using AES-256-GCM cryptographic standards.
* **DPDP Act 2023 Data Portability:** Built-in automated PII export (`GET /api/profile/export-data`) generating official PDF documents formatted with `jsPDF` and `jspdf-autotable`.
* **Right to Erasure (Purge API):** Secure user account & PII data deletion (`DELETE /api/auth/me/purge`) protected by password re-verification.
* **Timestamped Consent Tracking:** Stores explicit consent metadata (`consentTimestamp`, `termsVersion`, `privacyPolicyVersion`) on user registration schemas.
* **XSS Payload Sanitizer:** Automated Express middleware recursively stripping script injections, HTML tags, and iframe vulnerabilities from incoming request bodies and parameters.
* **Double-Submit Anti-CSRF Protection:** Custom Anti-CSRF token verification (`x-csrf-token` header validation) protecting sensitive state-changing endpoints.
* **Rate Limiting & Lockout Engine:** Persistent MongoDB rate-limiter enforcing exponential 10-minute and 15-minute verification locks after repeated failed OTP attempts, backed by reactive live ticking UI countdown timers.

### 🔑 2. Three-Tier Role-Based Access Control (RBAC)
* **Super Admin (CEO):** Global system privileges, admin delegation, company-wide audit visibility, and system management. Restricted from applying for leaves (the **+ Apply Leave** button is hidden on the UI and protected with `403 Forbidden` on the backend).
* **Admin (Managers/Team Leads):** Employee roster management, task creation and delegation to standard Employees, leave request approval/rejection. Restricted from self-assigning tasks or assigning tasks to higher/equal admin tiers.
* **Member (Employees):** Dedicated dashboard to manage assigned tasks, log attendance, apply for leaves, access AI assistance, and participate in internal team chats.

### 🤖 3. Multimodal AI & RAG Pipeline (Google Gemini)
* **Module 1 (Contextual Greeting Engine):** Zero-latency local greeting API (`GET /api/chat/greeting`) using time-of-day logic and cached profile context without consuming LLM tokens.
* **Module 2 (Fast Track Semantic Cache V2):** In-memory semantic cache matching query tokens against 18+ hardcoded corporate HR policies (Leave, WFH, Overtime) using mathematical token overlap ratio (>= 0.5) to bypass LLM inference latency.
* **Module 4 (Gibberish Pre-Flight Detector):** Filters out random keyboard mashing (e.g. `asdfgh`) before invoking AI APIs to preserve quota.
* **Multimodal Document RAG:** Accepts corporate PDFs and images via Base64 serialization, leveraging Google Gemini File APIs for document analysis, task extraction, and contextual policy Q&A.

### 📋 4. Task Management Engine
* **Comprehensive Lifecycle:** Tasks transition through strictly validated states: `todo` ➔ `in_progress` ➔ `completed`, `overdue`, or `cancelled`.
* **Action Buttons & Form Guidance:** Primary task action button standardized to **+ Create New Task** with dynamic keypress character counters (e.g., `0/120` title, `0/1000` description) and full-width file dropzones.
* **Attachment Preview Modal (React Portal):** Integrated full-viewport preview modal using `React.createPortal` for viewing attached task documents without CSS stacking boundaries.
* **Formatted CSV Export:** Exports task records into line-by-line formatted CSV files with UTF-8 BOM encoding for seamless Microsoft Excel and Google Sheets compatibility.

### 💬 5. Communication & Real-time Alerts
* **1-on-1 & Group Messaging:** Real-time internal messaging threads with attachment previews.
* **Broadcasting System:** Company-wide announcement feeds for critical organizational updates.
* **Notification Engine:** Persistent MongoDB alert schema with background polling context and interactive header badge indicators.

### 🎨 6. Glassmorphism Design System & Theming
* **Enterprise Split-Screen UI:** Modern 45/55 split layout for authentication workflows with floating label animations and custom orbital solar system CSS keyframes.
* **Light / Dark Mode:** Custom CSS variables delivering seamless theme switching across all dashboard components and frosted glass (`backdrop-blur-xl`) panels.

---

## 🏗️ System Architecture & Tech Stack

```text
                                  +---------------------------------------+
                                  |    Next.js 16 (React 19 App Router)   |
                                  |   Tailwind CSS v4 + React Query v5    |
                                  +---------------------------------------+
                                                      |
                                                      v  HTTP / REST (Axios + Anti-CSRF)
                                  +---------------------------------------+
                                  |       Express.js / Node.js Cluster    |
                                  |   Helmet + XSS Sanitizer + Auth JWT   |
                                  +---------------------------------------+
                                     /                |                \
                                    /                 |                 \
                                   v                  v                  v
                       +-------------------+ +------------------+ +-----------------------+
                       |  MongoDB Mongoose | |  Google Gemini   | |   Cloudinary & Mail   |
                       | Compound Indexing | | Multimodal RAG AI| | Nodemailer / Twilio   |
                       +-------------------+ +------------------+ +-----------------------+
```

### Frontend Stack
* **Framework:** Next.js 16.2.9 (App Router) + React 19.2.4
* **Language:** TypeScript 5.9.3
* **Styling:** Tailwind CSS v4 + Lucide Icons
* **State & Data Fetching:** React Context API + TanStack React Query (`@tanstack/react-query`)
* **Form & Validation:** Zod + Custom Email/Phone Regex Utilities
* **Document Generation:** `jspdf` & `jspdf-autotable`

### Backend Stack
* **Runtime & Framework:** Node.js + Express.js 4.22.2 (TypeScript)
* **Database:** MongoDB via Mongoose 7.8.10 (with compound indexing)
* **Security:** Helmet, Cookie-Parser, CORS, AES-256-GCM, Express-Validator, Custom Anti-CSRF & XSS Middleware
* **AI & Machine Learning:** Google Generative AI (`@google/generative-ai` Gemini SDK) + `pdf-parse`
* **File & Communication Services:** Cloudinary SDK, Nodemailer, Twilio SDK

---

## 📁 Repository Structure

```text
Mini Employee Task Manager/
├── src/                                # Frontend Source Code (Next.js)
│   ├── app/                            # App Router Pages
│   │   ├── (auth)/                     # Login, Register, Password Reset Pages
│   │   ├── attendance/                 # Attendance Management & Logging
│   │   ├── calendar/                   # Holiday & Leave Calendar
│   │   ├── chatbot/                    # Multimodal AI RAG Chat Interface
│   │   ├── communication/              # Chat Threads & Announcements Hub
│   │   ├── employees/                  # Employee Directory & Management
│   │   ├── leave/                      # Leave Application & Approvals
│   │   ├── profile/                    # User Profile & DPDP Security Tabs
│   │   ├── settings/                   # PII Export & Account Purge Settings
│   │   ├── tasks/                      # Task Table, Filters, CSV Export
│   │   └── page.tsx                    # Landing / Redirection Gateway
│   ├── components/                     # Modular Component Library
│   │   ├── analytics/                  # Recharts KPI & Bar/Line Chart Cards
│   │   ├── attendance/                 # Attendance Action Modals & Tables
│   │   ├── calendar/                   # Holiday Event Cards & Modals
│   │   ├── chatbot/                    # Chat History, Bubbles, Markdown Renderers
│   │   ├── communication/              # Compose Modals, Group Chat Controls
│   │   ├── leave/                      # Interactive Leave Statistics & Cards
│   │   ├── profile/                    # Image Cropper, Security & DPDP Tabs
│   │   ├── task/                       # Task Cards, Portalled Attachment Panels
│   │   └── ui/                         # Standardized Buttons, Modals, Badges
│   ├── context/                        # Global React State (Auth, Task, Chat)
│   └── services/                       # Centralized Axios Interceptors & API Clients
│
├── server/                             # Backend Source Code (Node.js/Express)
│   ├── src/
│   │   ├── config/                     # Database Connection & Cloudinary Config
│   │   ├── controllers/                # Auth, Task, Profile, RAG & Chat Controllers
│   │   ├── middleware/                 # Auth JWT, Anti-CSRF, XSS Sanitizer
│   │   ├── models/                     # Mongoose Schemas (User, Task, OtpRateLimit, etc.)
│   │   ├── routes/                     # Express REST Router Definitions
│   │   ├── services/                   # Fast-Track AI Cache, RAG Chunking, OTP Limiter
│   │   ├── utils/                      # AES-256 Crypto, Nodemailer, JWT Helpers
│   │   ├── validators/                 # Express-Validator Input Chains
│   │   └── server.ts                   # Application Entry Point
│   └── package.json
│
├── document/                           # Enterprise Documentation Hub
│   ├── DAILY_REPORT.md                 # Development & Audit Log
│   ├── CHATBOT_ARCHITECTURE.md         # RAG AI Pipeline specifications
│   ├── PRD.md                          # Product Requirement Specifications
│   ├── RULES.md                        # Senior Engineering Rules
│   └── structure.md                    # Architecture & Directory Map
├── README.md                           # Repository Landing Guide
└── package.json                        # Root Dependencies
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas Cluster URI
* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### 🛠️ Installation & Setup

#### 1. Clone Repository
```bash
git clone https://gitlab.mobiloitte.io/root/internal-training-2026.git
cd "Mini Employee Task Manager"
```

#### 2. Configure Environment Variables

Create `.env` file in `/server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/employee_task_manager
JWT_SECRET=your_super_secret_jwt_key_32_bytes_long
JWT_EXPIRE=7d
ENCRYPTION_KEY=32_character_aes_256_encryption_key
CLIENT_URL=http://localhost:3000

# Email SMTP Credentials (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key
```

Create `.env.local` file in project root (Frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

#### 3. Install Dependencies & Launch

##### **Backend Setup (Server)**
```bash
cd server
npm install
npm run dev
```
*Backend API Server will launch on `http://localhost:5000`.*  
*Swagger API Documentation available at `http://localhost:5000/api-docs`.*

##### **Frontend Setup (Client)**
In a new terminal window from the project root:
```bash
npm install
npm run dev
```
*Frontend Application will launch on `http://localhost:3000`.*

---

## 🧪 Testing & Code Quality

```bash
# Run backend Jest unit & integration tests
cd server
npm test

# Execute Next.js build verification & TypeScript check
npm run build
```

---

## 📄 License & Confidentiality

**Proprietary and Confidential.**  
Copyright © 2026. All Rights Reserved.  
Unauthorized copying, distribution, or modification of this project via any medium is strictly prohibited.
