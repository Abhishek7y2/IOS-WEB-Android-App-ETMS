# 🏢 Enterprise Employee Task Management System (ETMS)

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v16.x-000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_v57-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://expo.dev/)
[![Swift](https://img.shields.io/badge/Swift-5.9_SwiftUI-FA7343.svg?style=for-the-badge&logo=swift&logoColor=white)](https://developer.apple.com/swift/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Indexed-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time_Engine-010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Cypress](https://img.shields.io/badge/Cypress-E2E_Quality-69D3A7.svg?style=for-the-badge&logo=cypress&logoColor=white)](https://www.cypress.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

**A multi-platform, cross-device enterprise suite built for modern workforce operations.**  
*Featuring Web (Next.js 16), Native iOS (SwiftUI), Cross-Platform Mobile (React Native Expo), and a high-throughput Node.js microservice architecture.*

[Architecture](#-system-architecture) • [Visual Gallery](#-visual-gallery--screen-showcase) • [Core Features](#-core-capabilities--feature-matrix) • [API Specs](#-rest-api-endpoints) • [Quickstart](#-quick-start--installation)

</div>

---

## 🏗️ System Architecture

The ETMS platform is structured around a centralized high-throughput REST + WebSocket backend communicating concurrently across three distinct frontends:

```mermaid
graph TD
    subgraph Client_Tiers [Frontends & Native Clients]
        WEB[🌐 Next.js 16 Web Portal<br/>React 19 + Tailwind CSS]
        IOS[📱 Native iOS App 'WorkMate'<br/>Swift 5.9 + SwiftUI]
        RN[📲 Mobile App 'WorkMate RN'<br/>React Native Expo SDK 57]
    end

    subgraph Gateway_Layer [Network & Protocol Layer]
        API_GATE[Reverse Proxy & API Router<br/>Express.js + CORS + Rate Limiter]
        WS_GATE[Socket.IO Gateway<br/>Broadcast & Room Channels]
    end

    subgraph Service_Core [Enterprise Backend Services]
        AUTH_SVC[Auth & Security Service<br/>JWT Rotation, Bcrypt, AES-256]
        TASK_SVC[Task & Sprint Engine<br/>Audit Trails, Subtasks, Assignees]
        HR_SVC[HR & Attendance Service<br/>Punch Clock, GPS, Quotas]
        COMM_SVC[Chat & Announcement Service<br/>1-on-1, Channels, Broadcasts]
        DOC_SVC[Document & RAG Service<br/>Semantic Chunks & Knowledge]
    end

    subgraph Storage_Cloud [Datastores & Third-Party SDKs]
        MONGO[(MongoDB Atlas<br/>Indexed, Clustered)]
        CLOUDINARY[Cloudinary Media CDN<br/>Attachment Storage]
        SMTP[SMTP / Twilio Gateway<br/>OTP & Real Notifications]
    end

    WEB -->|HTTPS REST & WSS| API_GATE
    IOS -->|HTTPS REST & WSS| API_GATE
    RN -->|HTTPS REST & WSS| API_GATE

    API_GATE --> WS_GATE
    API_GATE --> AUTH_SVC
    API_GATE --> TASK_SVC
    API_GATE --> HR_SVC
    API_GATE --> COMM_SVC
    API_GATE --> DOC_SVC

    AUTH_SVC --> MONGO
    TASK_SVC --> MONGO
    HR_SVC --> MONGO
    COMM_SVC --> MONGO
    DOC_SVC --> MONGO

    TASK_SVC --> CLOUDINARY
    AUTH_SVC --> SMTP
    COMM_SVC --> WS_GATE
```

---

## 📸 Visual Gallery & Screen Showcase

Every screen and interactive view has been captured in high-fidelity full scroll length (`fullPage: true`) across all applications.

### 1. 🌐 Web Portal (Next.js 16 + React 19)

<div align="center">

#### Executive Dashboard & Task Management
<table>
  <tr>
    <td width="50%" align="center">
      <b>Web Executive Dashboard (KPIs, Progress Ring & Donut)</b><br/>
      <img src="Screenshots/WEB%20APP/06_Web_Dashboard_Full_Screen.png" width="100%" alt="Web Dashboard" />
    </td>
    <td width="50%" align="center">
      <b>Comprehensive Tasks Directory & Priority Filters</b><br/>
      <img src="Screenshots/WEB%20APP/07_Web_Tasks_Full_Screen.png" width="100%" alt="Tasks Directory" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Interactive Task Creation Modal</b><br/>
      <img src="Screenshots/WEB%20APP/08_Web_Tasks_Create_Modal.png" width="100%" alt="Task Creation Modal" />
    </td>
    <td width="50%" align="center">
      <b>Attendance Time Clock & Weekly Records</b><br/>
      <img src="Screenshots/WEB%20APP/09_Web_Attendance_Full_Screen.png" width="100%" alt="Attendance Tracker" />
    </td>
  </tr>
</table>

#### HR, Leave Management & Directory
<table>
  <tr>
    <td width="50%" align="center">
      <b>Leave Portal (Balance Quotas & Approval Table)</b><br/>
      <img src="Screenshots/WEB%20APP/10_Web_Leave_Table_Full_Screen.png" width="100%" alt="Leave Table" />
    </td>
    <td width="50%" align="center">
      <b>Leave Schedule Calendar View</b><br/>
      <img src="Screenshots/WEB%20APP/11_Web_Leave_Calendar_Full_Screen.png" width="100%" alt="Leave Calendar" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Apply Leave Modal Sheet</b><br/>
      <img src="Screenshots/WEB%20APP/12_Web_Leave_Apply_Modal.png" width="100%" alt="Apply Leave Modal" />
    </td>
    <td width="50%" align="center">
      <b>Team Member Directory & Role Cards</b><br/>
      <img src="Screenshots/WEB%20APP/13_Web_Employees_Directory_Full_Screen.png" width="100%" alt="Team Directory" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Add Team Member / Create User Modal</b><br/>
      <img src="Screenshots/WEB%20APP/14_Web_Employees_Add_Member_Modal.png" width="100%" alt="Add Employee Modal" />
    </td>
    <td width="50%" align="center">
      <b>Real-Time Communication Hub (Direct Chat)</b><br/>
      <img src="Screenshots/WEB%20APP/15_Web_Communication_Inbox_Screen.png" width="100%" alt="Communication Inbox" />
    </td>
  </tr>
</table>

#### Planning, Calendar, Compliance & Settings
<table>
  <tr>
    <td width="50%" align="center">
      <b>Calendar Schedule & Deadlines</b><br/>
      <img src="Screenshots/WEB%20APP/18_Web_Calendar_Schedule_Full_Screen.png" width="100%" alt="Calendar Schedule" />
    </td>
    <td width="50%" align="center">
      <b>Calendar Notepad & Sprint Scratchpad</b><br/>
      <img src="Screenshots/WEB%20APP/19_Web_Calendar_Notepad_View.png" width="100%" alt="Calendar Notepad" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Add Company Holiday Modal</b><br/>
      <img src="Screenshots/WEB%20APP/20_Web_Calendar_Add_Holiday_Modal.png" width="100%" alt="Add Holiday Modal" />
    </td>
    <td width="50%" align="center">
      <b>Security Settings & Password Rotation</b><br/>
      <img src="Screenshots/WEB%20APP/23_Web_Settings_Security_Full_Screen.png" width="100%" alt="Security Settings" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>DPDP Act 2023 Data Export Portal</b><br/>
      <img src="Screenshots/WEB%20APP/24_Web_Settings_Data_Download_Screen.png" width="100%" alt="Data Download" />
    </td>
    <td width="50%" align="center">
      <b>Archived Tasks & Records Management</b><br/>
      <img src="Screenshots/WEB%20APP/25_Web_Archive_Full_Screen.png" width="100%" alt="Archive Screen" />
    </td>
  </tr>
</table>

</div>

---

### 2. 📱 Native iOS App (SwiftUI & Xcode)

Captured directly from iPhone 17 Pro Simulator with native glassmorphism, sparklines, and custom SwiftUI sheets:

<div align="center">

<table>
  <tr>
    <td width="25%" align="center">
      <b>Native Login</b><br/>
      <img src="Screenshots/IOS%20APP/01_iOS_Login_Screen.png" width="100%" alt="iOS Login" />
    </td>
    <td width="25%" align="center">
      <b>iOS Dashboard</b><br/>
      <img src="Screenshots/IOS%20APP/04_iOS_Dashboard_Screen.png" width="100%" alt="iOS Dashboard" />
    </td>
    <td width="25%" align="center">
      <b>Native Tasks</b><br/>
      <img src="Screenshots/IOS%20APP/05_iOS_Tasks_Screen.png" width="100%" alt="iOS Tasks" />
    </td>
    <td width="25%" align="center">
      <b>Team Directory</b><br/>
      <img src="Screenshots/IOS%20APP/06_iOS_Team_Directory_Screen.png" width="100%" alt="iOS Team Directory" />
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <b>Attendance Clock</b><br/>
      <img src="Screenshots/IOS%20APP/09_iOS_Attendance_Clock_Screen.png" width="100%" alt="iOS Attendance Clock" />
    </td>
    <td width="25%" align="center">
      <b>Leave Portal</b><br/>
      <img src="Screenshots/IOS%20APP/07_iOS_Leave_Portal_Screen.png" width="100%" alt="iOS Leave Portal" />
    </td>
    <td width="25%" align="center">
      <b>Create Task Sheet</b><br/>
      <img src="Screenshots/IOS%20APP/15_iOS_Create_Task_Sheet.png" width="100%" alt="iOS Create Task Sheet" />
    </td>
    <td width="25%" align="center">
      <b>In-App Messages</b><br/>
      <img src="Screenshots/IOS%20APP/11_iOS_Messages_Inbox_Screen.png" width="100%" alt="iOS Messages Inbox" />
    </td>
  </tr>
</table>

</div>

---

### 3. 📲 Cross-Platform Mobile App (React Native Expo)

Captured across active bottom-navigation tabs with responsive layout, touch feedback, and AI agent integration:

<div align="center">

<table>
  <tr>
    <td width="25%" align="center">
      <b>Auth Selector</b><br/>
      <img src="Screenshots/MOBILE%20APP/01_Mobile_Welcome_Screen.png" width="100%" alt="Mobile Welcome" />
    </td>
    <td width="25%" align="center">
      <b>Mobile Dashboard</b><br/>
      <img src="Screenshots/MOBILE%20APP/06_Mobile_Dashboard_Screen.png" width="100%" alt="Mobile Dashboard" />
    </td>
    <td width="25%" align="center">
      <b>Task Overview</b><br/>
      <img src="Screenshots/MOBILE%20APP/07_Mobile_Tasks_Screen.png" width="100%" alt="Mobile Tasks" />
    </td>
    <td width="25%" align="center">
      <b>AI Chatbot Assistant</b><br/>
      <img src="Screenshots/MOBILE%20APP/14_Mobile_Chatbot_AI_Screen.png" width="100%" alt="Mobile AI Chatbot" />
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <b>Docs & Knowledge RAG</b><br/>
      <img src="Screenshots/MOBILE%20APP/09_Mobile_Docs_RAG_Screen.png" width="100%" alt="Docs RAG" />
    </td>
    <td width="25%" align="center">
      <b>Mobile Time Clock</b><br/>
      <img src="Screenshots/MOBILE%20APP/11_Mobile_Attendance_Screen.png" width="100%" alt="Mobile Attendance" />
    </td>
    <td width="25%" align="center">
      <b>Leave Balance & Apply</b><br/>
      <img src="Screenshots/MOBILE%20APP/12_Mobile_Leave_Screen.png" width="100%" alt="Mobile Leave" />
    </td>
    <td width="25%" align="center">
      <b>Profile & Settings</b><br/>
      <img src="Screenshots/MOBILE%20APP/15_Mobile_Profile_Settings_Screen.png" width="100%" alt="Mobile Profile" />
    </td>
  </tr>
</table>

</div>

---

## 🔄 Sequence Diagrams & Operational Flows

### 1. Dual-Token Authentication & Refresh Rotation

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Web / iOS / RN)
    participant Auth as Auth Controller
    participant DB as MongoDB User Model
    participant Cache as Token Storage

    User->>Auth: POST /api/auth/login (email + password)
    Auth->>DB: Query User by email (select password hash)
    DB-->>Auth: User record + hashed password
    Auth->>Auth: bcrypt.compare(plain, hash)
    Auth->>Auth: Generate short-lived Access Token (15m) + Refresh Token (7d)
    Auth->>DB: Persist active Refresh Token signature
    Auth-->>User: Set HTTP-Only Cookie + JSON auth payload

    Note over User,Auth: Subsequent Authenticated Requests
    User->>Auth: GET /api/tasks (Bearer Access Token)
    alt Token Valid
        Auth-->>User: 200 OK (Tasks payload)
    else Token Expired (401)
        User->>Auth: POST /api/auth/refresh-token (Refresh Token)
        Auth->>DB: Validate Refresh Token in database
        Auth->>Auth: Invalidate old Refresh Token (One-time use)
        Auth->>Auth: Issue new Access Token + new Refresh Token
        Auth-->>User: 200 OK (New Token Pair)
    end
```

### 2. Real-Time Task Lifecycle & Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Web Portal)
    participant API as Express API Server
    participant DB as MongoDB Atlas
    participant WS as Socket.IO Hub
    actor Employee as Assigned Employee (iOS / RN App)

    Admin->>API: POST /api/tasks (title, assignees, priority, due date)
    API->>DB: Insert Task Document + Create Audit Log
    DB-->>API: Saved Task Record
    API->>WS: Emit 'task:created' { taskId, assigneeIds, title }
    API-->>Admin: 201 Created
    WS->>Employee: Push WebSocket Event 'task:created'
    Employee->>Employee: Local State / Redux / SwiftUI Notification update

    Employee->>API: PATCH /api/tasks/:id/status (status: "In Progress")
    API->>DB: Update Task Status + Append Audit Log entry
    API->>WS: Emit 'task:status_updated' { taskId, newStatus }
    WS->>Admin: Real-time status chip update on Web Kanban & Table
```

### 3. Task State Transition State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Created by Admin / Super Admin
    Pending --> In_Progress: Employee Starts Work
    Pending --> Cancelled: Cancelled / Obsolete
    In_Progress --> In_Review: Submitted for Manager Sign-off
    In_Progress --> Completed: Marked Complete Directly
    In_Review --> Completed: Approved by Supervisor
    In_Review --> In_Progress: Changes Requested
    Completed --> Archived: 30-day retention or manual archive
    Cancelled --> Archived: Move to Archive
    Archived --> Pending: Restored to Active Board
```

---

## 🗄️ Database Entity-Relationship Model (ERD)

```mermaid
erDiagram
    USER ||--o{ TASK : "assignedTo"
    USER ||--o{ TASK : "createdBy"
    USER ||--o{ ATTENDANCE : "logs"
    USER ||--o{ LEAVE : "applies"
    USER ||--o{ MESSAGE : "sends"
    TASK ||--o{ TASK_AUDIT : "tracks"
    TASK ||--o{ ATTACHMENT : "contains"
    CONVERSATION ||--o{ MESSAGE : "houses"
    USER ||--o{ CONVERSATION : "participates"

    USER {
        ObjectId _id PK
        string firstName
        string lastName
        string email UK
        string passwordHash
        string phone
        string role "super_admin | admin | member"
        string department
        boolean isActive
        string avatarUrl
        datetime createdAt
    }

    TASK {
        ObjectId _id PK
        string title
        string description
        string status "Pending | In Progress | In Review | Completed"
        string priority "Low | Medium | High | Urgent"
        ObjectId createdBy FK
        ObjectId[] assignedTo FK
        datetime dueDate
        boolean isArchived
        object[] subtasks
    }

    TASK_AUDIT {
        ObjectId _id PK
        ObjectId taskId FK
        ObjectId modifiedBy FK
        string action
        string previousValue
        string newValue
        datetime timestamp
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        date workDate
        datetime clockIn
        datetime clockOut
        number totalHours
        string status "Present | Late | Half-Day | Absent"
        object locationCoordinates
    }

    LEAVE {
        ObjectId _id PK
        ObjectId userId FK
        string leaveType "Casual | Sick | Earned"
        datetime startDate
        datetime endDate
        number totalDays
        string status "Pending | Approved | Rejected | Cancelled"
        string reason
        ObjectId approvedBy FK
    }
```

---

## ⚙️ Role-Based Access Control (RBAC) Matrix

| Module / Operation | Super Admin | Admin (Manager) | Member (Employee) |
|:---|:---:|:---:|:---:|
| **Dashboard Metrics** | Full Enterprise Scope | Department Scope | Personal Scope |
| **Create / Assign Tasks** | ✅ Unlimited | ✅ Within Department | ❌ Read & Update Assigned Only |
| **Edit Any Task** | ✅ Unlimited | ✅ Within Department | ❌ Status & Comments Only |
| **Delete / Archive Tasks** | ✅ | ✅ | ❌ |
| **Manage Employee Accounts** | ✅ Create / Edit / Delete | ✅ View & Assign | ❌ View Directory Only |
| **Attendance Punch In/Out** | ✅ | ✅ | ✅ |
| **Approve / Reject Leave** | ✅ | ✅ | ❌ |
| **Submit Leave Request** | ❌ (Exempt) | ✅ | ✅ |
| **Broadcast Announcements** | ✅ Global | ✅ Departmental | ❌ Read Only |
| **Direct & Group Messaging** | ✅ | ✅ | ✅ |
| **Add Company Holidays** | ✅ | ✅ | ❌ Read Only |
| **Export Data (DPDP Act)** | ✅ Full Export | ❌ | ✅ Personal Data Only |

---

## 🔌 REST API Endpoints

### Authentication & Profiles (`/api/auth`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & return JWT tokens |
| `POST` | `/api/auth/phone-login` | Public | OTP-based phone authentication |
| `POST` | `/api/auth/refresh-token` | Public | Rotate refresh token and issue new access token |
| `POST` | `/api/auth/forgot-password`| Public | Dispatch password reset email/token |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile & avatar |
| `PUT` | `/api/auth/change-password`| Authenticated | Rotate user password |

### Tasks Management (`/api/tasks`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/tasks` | Authenticated | List tasks (filtered by status, priority, assignee) |
| `POST` | `/api/tasks` | Admin+ | Create and assign new task |
| `GET` | `/api/tasks/:id` | Authenticated | Fetch task detail by ID with audit log |
| `PUT` | `/api/tasks/:id` | Admin+ | Update full task specifications |
| `PATCH`| `/api/tasks/:id/status` | Authenticated | Fast update task progress status |
| `DELETE`| `/api/tasks/:id` | Admin+ | Soft-delete / archive task |
| `POST` | `/api/tasks/:id/attachments`| Authenticated | Upload Cloudinary attachment |
| `GET` | `/api/tasks/archive/list` | Admin+ | List all archived task records |
| `POST` | `/api/tasks/:id/restore`| Admin+ | Restore archived task to active board |

### Attendance & Leaves (`/api/attendance`, `/api/leave`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/attendance/punch-in` | Authenticated | Clock in with timestamp & geolocation |
| `POST` | `/api/attendance/punch-out`| Authenticated | Clock out and calculate shift hours |
| `GET` | `/api/attendance/my-logs` | Authenticated | Fetch current user's monthly attendance sheet |
| `GET` | `/api/attendance/team` | Admin+ | Team-wide attendance records |
| `GET` | `/api/leave` | Authenticated | List leave applications & balances |
| `POST` | `/api/leave` | Member/Admin | Submit new leave application |
| `PATCH`| `/api/leave/:id/status` | Admin+ | Approve or reject pending leave |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: Active MongoDB database (Atlas URI or local instance)
- **Xcode**: 15+ with iOS 17+ Simulator (for native iOS app on macOS)

---

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
- API Server runs on **`http://localhost:5000`** (Health endpoint: `http://localhost:5000/api/health`).

### 2. Web Frontend Setup
```bash
cd web-frontend
npm install
cp .env.example .env.local
npm run dev
```
- Web Application opens at **`http://localhost:3000`**.

### 3. Cross-Platform Mobile App (Expo)
```bash
cd mobile-app
npm install
npx expo start
```
- Press `w` in terminal for Web preview, or scan QR code in **Expo Go** (Android/iOS).

### 4. Native iOS App (`WorkMate` / SwiftUI)
```bash
cd "IOS app"
open EnterpriseTaskSystemIOS.xcodeproj
```
- Select scheme **`WorkMate`**, choose an **iPhone 16 / 17 Pro Simulator**, and press **`Cmd + R`**.

---

## 🧪 Automated Testing Suites

```bash
# Run Backend Jest Unit & Integration Tests
cd backend
npm test

# Run Web Frontend Cypress End-to-End Tests
cd web-frontend
npx cypress run
```

---

## 🔐 Demonstration Credentials

| Role | Email | Password |
|:---|:---|:---|
| **Super Admin** | `abhishek7y2@gmail.com` | `@Abhi2419` |
| **Employee** | Registered via `/register` or created via Add Member | Custom |

---

## 🛡️ License & Authorship

- **Author**: Abhishek Yadav
- **GitHub**: [@Abhishek7y2](https://github.com/Abhishek7y2)
- **Repository**: [https://github.com/Abhishek7y2/IOS-WEB-Android-App-ETMS](https://github.com/Abhishek7y2/IOS-WEB-Android-App-ETMS)
- **License**: MIT
