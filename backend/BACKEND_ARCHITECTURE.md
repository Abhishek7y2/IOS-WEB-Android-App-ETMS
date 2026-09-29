# 🏛️ Enterprise Backend Architectural Specification & Reference Manual

> **Purpose & Directive**: This document serves as the single source of truth for the Node.js/TypeScript backend architecture. Whenever future development, debugging, refactoring, or feature additions are requested, this architecture and all its enforced clauses must be strictly referenced and upheld.

---

## 📑 Table of Contents
1. [System Topology & High-Level Architecture](#1-system-topology--high-level-architecture)
2. [Directory & File Hierarchy](#2-directory--file-hierarchy)
3. [Server Engine, Clustering & Middleware Pipeline](#3-server-engine-clustering--middleware-pipeline)
4. [Database Schemas & Data Model Specifications (15 Models)](#4-database-schemas--data-model-specifications-15-models)
5. [Security, Auth & Compliance Clauses](#5-security-auth--compliance-clauses)
6. [Core Service Logic & Operational Clauses](#6-core-service-logic--operational-clauses)
7. [Real-Time WebSocket Engine (Socket.IO)](#7-real-time-websocket-engine-socketio)
8. [Complete API Route Catalog](#8-complete-api-route-catalog)
9. [Environment Variables & Configuration Standards](#9-environment-variables--configuration-standards)

---

## 1. System Topology & High-Level Architecture

The backend is built with **Node.js, Express, and TypeScript** using an enterprise **Controller-Service-Model** pattern, backed by **MongoDB Atlas**, a **Socket.IO** real-time engine, and third-party cloud services (**Cloudinary**, **Twilio**, **Nodemailer**).

```
                                  +------------------------------+
                                  |     Next.js 16 Web Portal    |
                                  | (React 19, Tailwind, Recharts)|
                                  +--------------+---------------+
                                                 |
                                                 | HTTPS / REST / WSS
                                                 v
+--------------------------+      +--------------+---------------+      +--------------------------+
|  React Native (Expo 57)  | REST |   Node.js / Express Backend   | MDB  |     MongoDB Atlas DB     |
|   Mobile Application     +----->|  (TypeScript, Socket.IO)     +----->|  (15 Models, Encrypted)  |
+--------------------------+ WSS  +--------------+---------------+      +--------------------------+
                                                 |
                                                 | API / Cloud Integrations
                                                 v
                                  +--------------+---------------+
                                  | Cloudinary (Media Storage)   |
                                  | Twilio (SMS) & Nodemailer    |
                                  +------------------------------+
```

### Core Architectural Axioms
1. **Database First, Event Second**: Database persistence and transaction validity must succeed before emitting real-time Socket.IO events.
2. **Dual-Token Zero-Trust Auth**: Short-lived Access Tokens in HTTP-Only cookies + Refresh Token Rotation in MongoDB whitelist.
3. **Role-Based Access Hierarchy (RBAC)**: `superadmin` (CEO) > `admin` (Manager) > `member` (Employee).
4. **Data Protection by Design**: Automatic encryption (AES-256-GCM), recursive XSS sanitization, anti-CSRF double-submit tokens, and full DPDP Act 2023 compliance.

---

## 2. Directory & File Hierarchy

```
backend/
├── package.json                   # Dependencies, build scripts & TypeScript tools
├── tsconfig.json                  # Strict TypeScript compiler options
├── src/
│   ├── server.ts                  # Cluster starter & HTTP + Socket.IO server ignition
│   ├── app.ts                     # Express pipeline, global middleware, and route mounting
│   ├── config/
│   │   └── db.ts                  # Mongoose connection with autoIndex enabled
│   ├── constants/
│   │   └── validationMessages.ts  # Centralized validation error messages
│   ├── controllers/               # 9 HTTP Request & Response handlers
│   │   ├── attendanceController.ts
│   │   ├── authController.ts
│   │   ├── communicationController.ts
│   │   ├── holidayController.ts
│   │   ├── leaveController.ts
│   │   ├── noteController.ts
│   │   ├── notificationController.ts
│   │   ├── profileController.ts
│   │   └── taskController.ts
│   ├── middleware/                # Security, sanitization & route guards
│   │   ├── authMiddleware.ts      # JWT cookie & header authentication
│   │   ├── csrfMiddleware.ts      # Double-submit Anti-CSRF protection
│   │   ├── errorHandler.ts        # Global 500 unhandled exception catcher
│   │   ├── notFoundHandler.ts     # 404 Route Not Found handler
│   │   ├── validateRequest.ts     # express-validator result middleware
│   │   └── xssSanitizer.ts        # Recursive script & HTML stripper
│   ├── models/                    # 15 Mongoose Schemas & TypeScript interfaces
│   │   ├── Announcement.ts
│   │   ├── Attendance.ts
│   │   ├── Conversation.ts
│   │   ├── EmailVerification.ts
│   │   ├── Holiday.ts
│   │   ├── Leave.ts
│   │   ├── LeaveBalance.ts
│   │   ├── Message.ts
│   │   ├── Note.ts
│   │   ├── Notification.ts
│   │   ├── OtpRateLimit.ts
│   │   ├── PhoneVerification.ts
│   │   ├── Task.ts
│   │   ├── TaskAuditLog.ts
│   │   └── User.ts
│   ├── realtime/                  # Socket.IO Real-Time Engine
│   │   ├── event.publisher.ts     # Standardized event envelope publisher
│   │   ├── event.types.ts         # Event definitions and payload types
│   │   ├── socket.auth.ts         # Handshake JWT authentication
│   │   ├── socket.rooms.ts        # Room join logic (user, role, org, conv)
│   │   └── socket.server.ts       # Socket.IO server initialization
│   ├── routes/                    # 9 Express Routers
│   │   ├── attendanceRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── communicationRoutes.ts
│   │   ├── holidayRoutes.ts
│   │   ├── leaveRoutes.ts
│   │   ├── noteRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   ├── profileRoutes.ts
│   │   └── taskRoutes.ts
│   ├── services/                  # Business Logic Layer
│   │   ├── attendanceService.ts
│   │   ├── communicationService.ts
│   │   ├── leaveService.ts
│   │   ├── otpLimiter.ts
│   │   └── taskService.ts
│   ├── types/                     # Shared TypeScript interfaces
│   ├── utils/                     # Helper modules
│   │   ├── cloudinary.ts          # Media upload & placeholder fallbacks
│   │   ├── crypto.ts              # AES-256-GCM encryption & decryption
│   │   ├── emailValidator.ts      # Domain & format regex validator
│   │   ├── jwt.ts                 # Access & Refresh token signing/verification
│   │   ├── mailer.ts              # Nodemailer templates & HTML dispatchers
│   │   ├── mobileValidator.ts     # Mobile number format checks
│   │   ├── phoneValidation.ts     # E.164 normalization & phone lookup
│   │   └── twilio.ts              # SMS OTP gateway
│   └── validators/                # express-validator rule chains
│       ├── authValidator.ts
│       └── taskValidator.ts
```

---

## 3. Server Engine, Clustering & Middleware Pipeline

### A. Process Clustering — [server.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/server.ts)
- In production (`NODE_ENV === 'production'` and `DISABLE_CLUSTER !== 'true'`), the primary process forks `os.cpus().length` workers.
- An `exit` listener automatically respawns any worker that crashes:
  ```typescript
  cluster.on('exit', (worker, code, signal) => {
    cluster.fork();
  });
  ```
- In development, the application runs directly on a single worker via `ts-node-dev`.

### B. Global Middleware Chain — [app.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/app.ts)
Requests execute through the following exact sequence:
1. **Helmet** (`app.use(helmet())`): Attaches strict HTTP security headers.
2. **CORS** (`app.use(cors({ origin, credentials: true }))`): Allows Web client (`localhost:3000`) and mobile origins while preserving cookies.
3. **Body Parsers** (`json({ limit: '50mb' })`, `urlencoded({ limit: '50mb', extended: true })`): High limit to accommodate Base64 image and attachment payloads.
4. **XSS Sanitizer** (`app.use(xssSanitizer)`): Strips HTML tags, `<script>`, `<iframe>`, inline `on*` events, and `javascript:` URIs from `req.body`, `req.query`, and `req.params`.
5. **Cookie Parser** (`app.use(cookieParser())`): Parses secure HTTP-only auth and CSRF cookies.
6. **Health Check Endpoints**: Root `/`, `/api`, `/api/health`, `/health` returning JSON server status.
7. **Route Mounting**: 11 modular API sub-routers mounted at `/api/*`.
8. **404 Not Found Handler** (`notFoundHandler`): Handles unmatched endpoints.
9. **Global Error Handler** (`errorHandler`): Catches all unhandled exceptions, logs them, and sends a safe HTTP 500 JSON payload without terminating the process.

---

## 4. Database Schemas & Data Model Specifications (15 Models)

### 1. User (`models/User.ts`)
- **Key Fields**: `name`, `firstName`, `lastName`, `email` (unique, lowercase), `mobileNumber` (unique), `password` (min 8 chars, `select: false`), `role` (`member` | `admin` | `superadmin`), `designation`, `department`, `profilePicture`, `isVerified`, `isArchived`, `isBlocked`, `refreshTokens` (array of strings, `select: false`), `consentTimestamp`, `termsVersion`, `privacyPolicyVersion`.
- **Pre-save Hook**: Automatically hashes `password` with `bcrypt.genSalt(10)` if modified. Computes `name` from `firstName` + `lastName`.
- **Indexes**: `{ email: 1 }`, `{ mobileNumber: 1 }`, `{ role: 1 }`, `{ email: 1, isVerified: 1 }`.
- **Instance Methods**: `comparePassword(candidatePassword: string): Promise<boolean>`.

### 2. Task (`models/Task.ts`)
- **Key Fields**: `title` (5–120 chars), `description` (20–1000 chars), `status` (`todo` | `in_progress` | `completed` | `overdue` | `cancelled`), `priority` (`low` | `medium` | `high` | `critical`), `dueDate` (Date), `assignedTo` (Ref `User`), `assignedBy` (Ref `User`), `isArchived` (Boolean), `attachments` (Array of file metadata).
- **Indexes**: `{ assignedTo: 1 }`, `{ assignedBy: 1 }`, `{ status: 1 }`, `{ dueDate: 1 }`, compound index `{ assignedTo: 1, status: 1 }`.

### 3. TaskAuditLog (`models/TaskAuditLog.ts`)
- **Key Fields**: `taskId` (Ref `Task`), `actionType` (`CREATE` | `UPDATE` | `DELETE`), `changedBy` (Ref `User`), `previousValue` (Mixed), `newValue` (Mixed), `createdAt`.
- **Indexes**: `{ taskId: 1 }`, `{ changedBy: 1 }`.

### 4. Attendance (`models/Attendance.ts`)
- **Key Fields**: `employeeId` (Ref `User`), `employeeName`, `attendanceDate` (Format: `YYYY-MM-DD`), `checkInTime`, `checkOutTime`, `breakStart`, `breakEnd`, `totalWorkingHours` (Number, hours in decimal), `breakDuration` (Number), `overtimeHours` (Number), `attendanceStatus` (`Present` | `Absent` | `Late` | `Half Day` | `Work From Home` | `On-Site Visit` | `Holiday` | `Weekend` | `Leave`), `isLate`, `lateByMinutes`, `leftEarly`, `earlyDepartureMinutes`, `workMode` (`Office` | `Work From Home` | `Hybrid` | `On-Site Visit`), `location`.
- **Compound Unique Index**: `{ employeeId: 1, attendanceDate: 1 }` (Strictly enforces 1 record per employee per day).

### 5. Leave (`models/Leave.ts`)
- **Key Fields**: `employeeId` (Ref `User`), `employeeName`, `leaveType` (12 types: `Sick Leave`, `Casual Leave`, `Earned Leave`, `Annual Leave`, `Half-Day Leave`, `Work From Home`, `Maternity Leave`, `Paternity Leave`, `Marriage Leave`, `Bereavement Leave`, `Compensatory Leave`, `Unpaid Leave`), `startDate`, `endDate`, `totalDays`, `halfDay`, `halfDaySession`, `reason` (10–500 chars), `attachment`, `status` (`Pending` | `Approved` | `Rejected` | `Cancelled` | `Withdrawn`), `approverName`, `approvedDate`, `rejectionReason`, `leaveBalanceBefore`, `leaveBalanceAfter`.

### 6. LeaveBalance (`models/LeaveBalance.ts`)
- **Key Fields**: `employeeId` (Ref `User`), `year` (Number), `balances` (Array of `{ leaveType, total, used, remaining }`).
- **Compound Unique Index**: `{ employeeId: 1, year: 1 }`.

### 7. Conversation (`models/Conversation.ts`)
- **Key Fields**: `type` (`direct` | `announcement` | `broadcast` | `group`), `subject`, `groupName`, `groupAdmins`, `priority` (`low` | `medium` | `high` | `urgent`), `participants` (Array of user ID strings), `participantNames`, `participantAvatars`, `lastMessage`, `lastMessageTime`, `lastMessageSender`, `unreadCount`, `isPinned`, `isArchived`, `hasAttachments`, `status`, `createdBy`.

### 8. Message (`models/Message.ts`)
- **Key Fields**: `conversationId` (Indexed string), `senderId`, `senderName`, `senderAvatar`, `content`, `timestamp`, `status`, `attachments` (Array of `{ id, name, type, url, size }`), `mentions`, `isEdited`, `replyToId`.

### 9. Announcement (`models/Announcement.ts`)
- **Key Fields**: `title`, `description`, `priority` (`low` | `medium` | `high` | `urgent`), `authorId` (Ref `User`), `authorName`, `publishDate`, `expiryDate`, `isPinned`, `readBy` (Array of user IDs).

### 10. Notification (`models/Notification.ts`)
- **Key Fields**: `recipientId` (Ref `User`, indexed), `senderId` (Ref `User`), `senderName`, `type` (`task` | `attendance` | `leave` | `system` | `chat`), `message`, `isRead` (Boolean, default `false`).

### 11. Holiday (`models/Holiday.ts`)
- **Key Fields**: `holidayName`, `holidayDate` (`YYYY-MM-DD`), `holidayType` (`National` | `Public` | `Company`), `description`.

### 12. Note (`models/Note.ts`)
- **Key Fields**: `userId` (Ref `User`, indexed), `title`, `content`.

### 13. OtpRateLimit (`models/OtpRateLimit.ts`)
- **Key Fields**: `key` (Normalized phone/email, unique index), `sendCount`, `sendLockExpires`, `failCount`, `failLockExpires`, `isSecondaryPhase`.
- **TTL Index**: `{ updatedAt: 1 }` with `expireAfterSeconds: 3600` (auto-clears rate records after 1 hour).

### 14. EmailVerification (`models/EmailVerification.ts`) & 15. PhoneVerification (`models/PhoneVerification.ts`)
- Temporary OTP verification collections during registration (`email`/`mobileNumber`, `otp`, `otpExpires`, `verified: boolean`).

---

## 5. Security, Auth & Compliance Clauses

### A. Dual-Token Authentication Protocol ([jwt.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/utils/jwt.ts), [authMiddleware.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/middleware/authMiddleware.ts))
1. **Access Token**:
   - Lifetime: **15 minutes** (`JWT_EXPIRES_IN=15m`).
   - Payload: `{ id: user._id, email: user.email }`.
   - Delivered in HTTP-Only cookie `token` (`sameSite: 'strict'`, `secure: production`).
   - Fallback: Checks `Authorization: Bearer <token>` header if cookie is absent.
2. **Refresh Token**:
   - Lifetime: **7 days** (`JWT_REFRESH_EXPIRES_IN=7d`).
   - Delivered in HTTP-Only cookie `refreshToken`.
   - Rotated on every call to `/api/auth/refresh`. The new refresh token is saved to the user's `refreshTokens` array in MongoDB; the old token is invalidated.
3. **Account Status Guard**:
   - If `user.isBlocked === true` $\rightarrow$ Returns HTTP 403 (*"Account blocked by administrator"*).
   - If `user.isArchived === true` $\rightarrow$ Returns HTTP 403 (*"Account deactivated by administrator"*).

### B. Single Super Admin (CEO) Invariant ([authController.ts:L127-L136](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/controllers/authController.ts#L127-L136))
- The system strictly permits **only one `superadmin`** user record in the database.
- Registration of any subsequent `superadmin` is rejected with HTTP 403:
  ```typescript
  if (role === 'superadmin') {
    const existingCEO = await User.findOne({ role: 'superadmin' });
    if (existingCEO && existingCEO.email !== email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'A Super Admin (CEO) already exists.' });
    }
  }
  ```

### C. 2-Phase OTP Rate Limiter & Lockout ([otpLimiter.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/services/otpLimiter.ts))
Protects SMS and Email endpoints against brute-force attacks and carrier spam:
- **Phase 1 (Normal)**:
  - Max **7 send requests** or **7 failed OTP attempts** $\rightarrow$ **10-minute lockout**.
  - On first lockout, the user transitions to `isSecondaryPhase = true`.
- **Phase 2 (Strict)**:
  - Max **4 send requests** or **4 failed OTP attempts** $\rightarrow$ **15-minute lockout**.
- **Successful Verification**: Clears the rate limit record completely (`OtpRateLimit.deleteOne({ key })`).

### D. Anti-CSRF Protection ([csrfMiddleware.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/middleware/csrfMiddleware.ts))
- Issues cryptographic 32-byte hex token via `/api/auth/csrf-token` into `_csrf_token` cookie.
- Validates that `req.headers['x-csrf-token'] === req.cookies['_csrf_token']` on all mutating HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`).
- Bypasses safe methods (`GET`, `HEAD`, `OPTIONS`) and unauthenticated public auth routes (e.g. `/api/auth/login`, `/api/auth/register`).

### E. AES-256-GCM Field Encryption ([crypto.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/utils/crypto.ts))
- Algorithm: `aes-256-gcm`.
- IV: 96-bit (12 bytes) fresh random IV generated per encryption.
- Tag: 128-bit (16 bytes) authentication tag.
- Output Format: `iv:authTag:ciphertext` (all hex encoded). Verifies tag upon decryption; tampering throws an error.

### F. DPDP Act 2023 Right to Erasure ([authController.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/controllers/authController.ts))
- Endpoint: `DELETE /api/auth/me/purge`.
- Completely deletes the user document and cascades to purge:
  - Attendance records (`Attendance.deleteMany({ employeeId })`)
  - Leave applications (`Leave.deleteMany({ employeeId })`)
  - Notifications (`Notification.deleteMany({ recipientId })`)
  - Chat messages and conversations
  - Documents and DocumentChunks
  - Task assignments

---

## 6. Core Service Logic & Operational Clauses

### A. Task Management Clauses ([taskService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/services/taskService.ts))
1. **Creation RBAC**: Only `admin` and `superadmin` can create tasks.
2. **Self-Assignment Ban**: `admin` or `superadmin` cannot assign a task to themselves (`loggedInId === targetId` $\rightarrow$ HTTP 403).
3. **Upward/Lateral Ban**: An `admin` cannot assign a task to another `admin` or `superadmin` ($\rightarrow$ HTTP 403).
4. **Target Account Verification**: Assignee must exist and have `isVerified === true`.
5. **Duplicate Prevention**: No duplicate active task (`todo` or `in_progress`) with the identical title for the same employee.
6. **Workload Caps**:
   - Max **10 active tasks** per employee.
   - Max **3 active critical-priority tasks** per employee.
   - Rejection if employee already has **5 or more overdue tasks**.
7. **Input Bounds**: Title 5–120 characters, description $\ge 20$ characters, regex blocks HTML/JS injection (`/<[a-z][\s\S]*>/i`).
8. **Audit Trail**: Every creation and update creates an immutable `TaskAuditLog` entry.
9. **Real-time Event**: Emits `task.created`, `task.updated`, or `task.deleted` to rooms `user:<assignedTo>`, `role:admin`, `role:superadmin`.

### B. HR & Attendance Clauses ([attendanceService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/services/attendanceService.ts))
1. **Shift Boundaries**: Office starts at 09:00 AM (`OFFICE_START_HOUR = 9`), ends at 06:00 PM (`OFFICE_END_HOUR = 18`).
2. **Late Check-In**: Check-in after 09:00 AM sets `attendanceStatus = 'Late'`, `isLate = true`, and computes `lateByMinutes = (checkIn - 09:00) / 60000`.
3. **Early Departure**: Check-out before 06:00 PM sets `leftEarly = true` and computes `earlyDepartureMinutes = (18:00 - checkOut) / 60000`.
4. **Break Time**: Break duration (`breakEnd - breakStart`) is subtracted from gross working hours.
5. **Hours & Overtime**:
   - $< 4\text{h}$ working time $\rightarrow$ Status converted to `Half Day`.
   - $> 8\text{h}$ working time $\rightarrow$ `overtimeHours = totalWorkingHours - 8`.
6. **State Transitions**: Prevents multiple check-ins on the same day; enforces valid sequence (Check-in $\rightarrow$ Break Start $\rightarrow$ Break End $\rightarrow$ Check-out).

### C. Leave Management Clauses ([leaveService.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/services/leaveService.ts))
1. **CEO Exemption**: Super Admin (CEO) cannot apply for leaves ($\rightarrow$ HTTP 403).
2. **Conflict Detection**: Blocks leave applications overlapping with an existing `Pending` or `Approved` leave period.
3. **Approval Authority**: Only administrators can set status to `Approved` or `Rejected`.
4. **Ledger Balance Auto-Deduction**:
   - On approval, locates or creates `LeaveBalance` for the current year.
   - Deducts `totalDays` from `remaining` and adds to `used`.
   - Stores `leaveBalanceBefore` and `leaveBalanceAfter` on the `Leave` document.
5. **Notification & Email Dispatch**:
   - Sends HTML notification email to employee via `nodemailer` ([mailer.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/utils/mailer.ts)).
   - Creates in-app `Notification`.
   - Publishes `leave.approved` / `leave.rejected` real-time event.

---

## 7. Real-Time WebSocket Engine (Socket.IO)

### A. Connection & Handshake Authentication ([socket.auth.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/realtime/socket.auth.ts))
- Handshake token is extracted from `socket.handshake.auth.token`, `socket.handshake.headers.authorization`, or `socket.handshake.query.token`.
- Verified with `JWT_SECRET`.
- Attaches authenticated context to `socket.data`:
  - `userId: string`
  - `role: string`
  - `email: string`
  - `workspaceId: string` (default: `'org:main'`)

### B. Room Architecture ([socket.rooms.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/realtime/socket.rooms.ts))
On connection, every client automatically joins:
- `user:<userId>`: For targeted, personal notifications.
- `role:<role>`: E.g., `role:admin`, `role:superadmin`, `role:HR`.
- `org:<organizationId>`: Organization-wide broadcast room.
- `conv:<conversationId>`: Joined on-demand via `socket.on('join_conversation')`.

### C. Standardized Event Publishing ([event.publisher.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/realtime/event.publisher.ts))
All real-time events are wrapped in a standard enterprise envelope:
```typescript
export interface EventEnvelope<T = any> {
  eventId: string;       // Unique: evt_<timestamp>_<rand>
  event: EventType;      // E.g. 'task.created', 'message.created'
  version: number;       // 1
  timestamp: string;     // ISO Date String
  organizationId: string;// 'main'
  actorId?: string;      // User ID who triggered the action
  data: T;               // Actual payload
}
```
Dual-Emission Strategy: The publisher emits both the unified `realtime.event` channel and the specific event channel (e.g. `task.created`) to targeted rooms.

---

## 8. Complete API Route Catalog

### Auth Router — `/api/auth` ([authRoutes.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/routes/authRoutes.ts))
| Method | Endpoint | Auth | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | `registerValidation`, `validateRequest` | User signup with inline OTP verification |
| `POST` | `/login` | Public | `loginValidation`, `validateRequest` | Email/Password login, sets HTTP-only cookies |
| `POST` | `/logout` | Public | None | Clears cookies & revokes refresh token |
| `GET` | `/csrf-token` | Public | None | Issues Anti-CSRF token |
| `POST` | `/refresh` | Public | None | Dual JWT rotation via refresh token cookie |
| `POST` | `/verify-otp` | Public | None | Email verification OTP check |
| `POST` | `/resend-verification-otp` | Public | None | Resends email verification code |
| `POST` | `/forgot-password` | Public | `forgotPasswordValidation`, `validateRequest` | Sends password reset OTP |
| `POST` | `/verify-reset-otp` | Public | None | Confirms reset OTP validity |
| `POST` | `/reset-password` | Public | `resetPasswordValidation`, `validateRequest` | Sets new password |
| `POST` | `/request-login-otp` | Public | None | Sends passwordless login OTP |
| `POST` | `/login-with-otp` | Public | None | Verifies login OTP & authenticates |
| `POST` | `/request-registration-otp` | Public | None | Sends inline SMS OTP for signup |
| `POST` | `/verify-registration-otp` | Public | None | Confirms inline SMS OTP |
| `POST` | `/request-registration-email-otp` | Public | None | Sends inline Email OTP for signup |
| `POST` | `/verify-registration-email-otp` | Public | None | Confirms inline Email OTP |
| `GET` | `/profile` | Yes | `authenticate` | Returns logged-in user profile |
| `POST` | `/request-phone-change-otp`| Yes | `authenticate` | Initiates mobile number update |
| `POST` | `/verify-phone-change-otp` | Yes | `authenticate` | Confirms mobile number change |
| `POST` | `/request-email-change-otp`| Yes | `authenticate` | Initiates email update |
| `POST` | `/verify-email-change-otp` | Yes | `authenticate` | Confirms email update |
| `GET` | `/users` | Yes | `authenticate` | Admin: List all users |
| `GET` | `/users/archived` | Yes | `authenticate` | Admin: List archived users |
| `PUT` | `/users/:id` | Yes | `authenticate` | Admin: Update user details |
| `DELETE`| `/users/:id` | Yes | `authenticate` | Admin: Soft delete / archive user |
| `PUT` | `/users/:id/restore` | Yes | `authenticate` | Admin: Restore archived user |
| `DELETE`| `/users/:id/permanent` | Yes | `authenticate` | Admin: Permanently delete user |
| `POST` | `/users/:id/block` | Yes | `authenticate` | Admin: Block user account |
| `POST` | `/users/:id/unblock` | Yes | `authenticate` | Admin: Unblock user account |
| `DELETE`| `/me/purge` | Yes | `authenticate` | DPDP Act: Complete user account erasure |

### Task Router — `/api/tasks` ([taskRoutes.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/routes/taskRoutes.ts))
| Method | Endpoint | Auth | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Yes | `authenticate` | List active tasks (filtered by user/role) |
| `GET` | `/archived` | Yes | `authenticate` | Admin: List archived tasks |
| `GET` | `/:id` | Yes | `authenticate` | Get task by ID |
| `POST` | `/` | Yes | `authenticate`, `taskCreateValidation`, `validateRequest` | Admin: Create & assign task |
| `PUT` | `/:id` | Yes | `authenticate`, `taskUpdateValidation`, `validateRequest` | Update task status, priority, or fields |
| `DELETE`| `/:id` | Yes | `authenticate` | Soft delete / archive task |
| `PUT` | `/:id/restore` | Yes | `authenticate` | Restore archived task |
| `DELETE`| `/:id/permanent` | Yes | `authenticate` | Admin: Permanently delete task |

### Attendance Router — `/api/attendance` ([attendanceRoutes.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/routes/attendanceRoutes.ts))
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/check-in` | Yes | Clock-in with workMode and GPS location |
| `POST` | `/check-out` | Yes | Clock-out, calculate hours, late/early flags, and overtime |
| `POST` | `/break-start` | Yes | Mark start of employee break |
| `POST` | `/break-end` | Yes | Mark end of break and calculate break duration |
| `GET` | `/` | Yes | Query attendance records (filters: month, year, department, workMode) |
| `PUT` | `/:id` | Yes | Admin: Manual correction of attendance entry |
| `GET` | `/analytics` | Yes | Get daily presence, WFH, late count, and avg hours |

### Leave Router — `/api/leaves` ([leaveRoutes.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/routes/leaveRoutes.ts))
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Yes | Apply for leave (validates overlap and CEO restrictions) |
| `GET` | `/` | Yes | List leave requests (employee or workspace) |
| `GET` | `/balance` | Yes | Fetch annual leave quota and remaining balances |
| `GET` | `/stats` | Yes | Organization leave metrics (today's count, pending, approved) |
| `GET` | `/:id` | Yes | Get specific leave application details |
| `PATCH` | `/:id/status` | Yes | Admin: Approve or Reject leave, updates balance ledger & sends email |
| `DELETE`| `/:id` | Yes | Admin: Delete leave application |

### Communication Router — `/api/communication` ([communicationRoutes.ts](file:///Users/ankur/Downloads/Mini-Employee-Task-Management-System-main/backend/src/routes/communicationRoutes.ts))
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | Yes | List colleagues for messaging with active status |
| `GET` | `/conversations` | Yes | List direct, group, and announcement channels |
| `POST` | `/conversations` | Yes | Create new direct or group conversation |
| `GET` | `/conversations/:id` | Yes | Get conversation details |
| `PUT` | `/conversations/:id` | Yes | Update conversation properties |
| `DELETE`| `/conversations/:id` | Yes | Delete conversation |
| `GET` | `/conversations/:id/messages` | Yes | Get paginated message history |
| `POST` | `/conversations/:id/messages` | Yes | Send message (supports attachments & mentions) |
| `GET` | `/announcements` | Yes | Fetch broadcast announcements |
| `POST` | `/announcements` | Yes | Admin: Publish new announcement |
| `PUT` | `/announcements/:id` | Yes | Admin: Edit announcement |
| `PATCH` | `/announcements/:id/pin` | Yes | Toggle pin status of announcement |
| `DELETE`| `/announcements/:id` | Yes | Admin: Delete announcement |
| `POST` | `/broadcast` | Yes | Admin: High-priority broadcast notification |
| `GET` | `/analytics` | Yes | Communication activity metrics |
| `POST` | `/groups` | Yes | Create new multi-user group chat |

### Auxiliary Routers
- **Holidays** (`/api/holidays`): `GET /` (list), `POST /` (admin create), `DELETE /:id` (admin delete).
- **Notes** (`/api/notes`): `GET /` (user notes), `POST /` (create), `DELETE /:id` (delete).
- **Notifications** (`/api/notifications`): `GET /` (in-app alerts), `PATCH /:id/read` (mark read).
- **Profile** (`/api/profile`): `GET /` (view profile), `PUT /` (update profile & documents).

---

## 9. Environment Variables & Configuration Standards

All runtime configuration is managed via `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DISABLE_CLUSTER=false

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/task_manager?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_access_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

# Field Encryption
AES_ENCRYPTION_KEY=64_character_hex_string_representing_32_bytes

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Nodemailer SMTP Gateway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Enterprise Task Manager <no-reply@company.com>"

# Twilio SMS Gateway
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

*This document is the definitive architectural blueprint for the backend engine. All future implementation steps, bug fixes, and feature expansions must adhere to the models, clauses, and protocols specified herein.*
