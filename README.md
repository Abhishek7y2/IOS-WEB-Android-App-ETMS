# 🚀 Employee Task Manager(Day-1)

A modern Employee Task Management System built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. This application helps administrators manage employees, assign tasks, and monitor task progress through a clean and responsive dashboard.

---

## 📌 Project Purpose

The Employee Task Manager is designed to simplify employee and task management by providing an intuitive interface for administrators.

### Features
- 📊 Dashboard overview
- 👥 Employee management
- ✅ Task assignment
- 📋 Task tracking
- 📱 Responsive design
- ⚡ Fast performance using Vite

---

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS

### Routing
- React Router DOM

### Development Tools
- npm
- Git & GitLab

---

## 📦 Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project folder

```bash
cd employee-task-manager
```

Install dependencies

```bash
npm install
```

---

## ▶️ Run the Project

Start the development server

```bash
npm run dev
```

Open your browser

```
http://localhost:5173
```

---

## 📁 Folder Structure

```
employee-task-manager
│
├── public/                 # Static assets
│
├── src/
│   ├── assets/             # Images, icons, SVGs
│   │
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── pages/              # Application pages
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   └── Tasks/
│   │       └── TaskList.tsx
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
│
├── index.html              # Main HTML file
├── package.json            # Project metadata & dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

---

## 📂 Important Files

### `index.html`
The single HTML file loaded by the browser. It contains the `root` element where the React application is mounted.

### `main.tsx`
The entry point of the React application. It initializes React and renders the root component (`App.tsx`).

### `App.tsx`
The root component responsible for organizing the application's layout and rendering all major components.

### `index.css`
Contains global styles and imports Tailwind CSS.

### `package.json`
Stores project metadata, dependencies, scripts, and package information.

### `vite.config.ts`
Configuration file for Vite, including React and Tailwind CSS plugins.

---

## 🧩 Current Components

- Header
- Sidebar
- Dashboard
- Task List

---

## 📚 Available Scripts

Run the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Preview the production build

```bash
npm run preview
```

Lint the project

```bash
npm run lint
```

---

## 🚀 Future Enhancements

- User Authentication
- Role-Based Access Control
- Task Status Management
- Employee CRUD Operations
- Search & Filters
- Notifications
- Dark Mode
- Charts & Analytics
- Backend API Integration
- Database Support

---

## 👨‍💻 Author

**Yuvraj Singh Rawat**

---

# 🚀 Employee Task Manager (Day-2)

Building on Day 1, Day 2 focused on making the project **beginner-friendly**, properly structured, and fully responsive with real static data visible on load.

---

## ✅ What Was Done on Day 2

### 1. Created TypeScript Types (`src/types/index.ts`)
- Defined shared interfaces: `Task` and `SummaryCard`
- All components now use the same types — no duplicate declarations across files

### 2. Created Data Layer (`src/data/tasks.ts`)
- All static data moved into one dedicated file
- Dashboard now shows 5 tasks immediately on load — no button click needed
- Summary card counts are calculated automatically from the task array
- When a real backend is added later, only this file needs to change

### 3. Created `TaskSummaryCard` Component (`src/components/TaskSummaryCard.tsx`)
- Fully reusable card component built with TypeScript props
- Accepts: `title`, `count`, `icon`, `colorClass`
- No business logic inside — just displays what it receives
- Used 4 times on the Dashboard with different data

### 4. Created `TaskTable` Component (`src/components/TaskTable.tsx`)
- Reusable table that accepts a `tasks[]` array as a prop
- Helper functions handle badge colors for Priority and Status
- Reused on both Dashboard and TaskList pages

### 5. Made UI Responsive (`src/components/Sidebar.tsx` & `Header.tsx`)
- Sidebar is hidden on mobile by default
- Hamburger menu (☰) button appears in Header on mobile
- Clicking it slides the Sidebar in from the left
- Clicking the overlay closes it
- All props made **optional** so components work with or without them

---

## 📁 Updated Folder Structure (Day 2)

```
src/
├── components/
│   ├── Header.tsx            # Updated — optional props, hamburger button
│   ├── Sidebar.tsx           # Updated — mobile slide-in, optional props
│   ├── TaskSummaryCard.tsx   # NEW — reusable summary card
│   └── TaskTable.tsx         # NEW — reusable task table
│
├── data/
│   └── tasks.ts              # NEW — all static data in one place
│
├── types/
│   └── index.ts              # NEW — shared TypeScript interfaces
│
├── pages/
│   ├── Dashboard.tsx         # Updated — uses static data + new components
│   └── TaskList.tsx          # Updated — reuses TaskTable component
│
├── App.tsx                   # Updated — simpler, optional props
└── index.css                 # Updated — clean reset, no conflicts
```

---

## 🧠 Concepts Learned on Day 2

| Concept | What It Means |
|---|---|
| TypeScript interfaces | Define the shape/structure of your data |
| Props | Pass data into a component from its parent |
| Optional props (`?`) | Props that don't have to be provided |
| Default prop values | Safe fallback when a prop is not passed |
| Data separation | Keep data out of components — easier to change later |
| `.map()` | Loop over an array to render a list in React |
| `useState` | Remember simple values like current page or sidebar open/closed |
| Responsive design | Use Tailwind's `md:` prefix to change layout at different screen sizes |
| Helper functions | Extract color logic out of JSX to keep it readable |

---

## 👨‍💻 Author

**Yuvraj Singh Rawat**

---

# 🚀 Employee Task Manager (Day-3)

Building on Day 2, Day 3 focused on **dynamic sub-components**, **strict TypeScript imports**, **polished visual design**, and fixing the **blank-screen bug** caused by Vite module compilation.

---

## ✅ What Was Done on Day 3

### 1. Standardized the Task Interface (`src/types/index.ts`)
- Added `description`, `createdAt`, and `OnHold` / `Critical` options to the Task interface
- Used **union types** (`'Pending' | 'InProgress' | 'Completed' | 'OnHold'`) to prevent invalid status values
- Replaced `string` dates with proper `Date` objects for locale-aware formatting

### 2. Created Reusable Visual Sub-Components
- **`StatusBadge.tsx`** — Colored pill badge that auto-maps status to pastel colors using a `Record<string, string>` lookup
- **`PriorityBadge.tsx`** — Same pattern for priority levels (Critical, High, Medium, Low)
- **`Avatar.tsx`** — Auto-generates user initials from name and assigns a consistent color via a hash function
- **`ProgressBar.tsx`** — Dynamic gradient bar that calculates completion percentage from data

### 3. Fixed the Blank Screen Bug (`import type`)
- Vite's `verbatimModuleSyntax` setting strips non-type imports at build time
- Interfaces were being imported with regular `import`, causing runtime module errors
- Fixed by switching all interface imports to `import type { Task, SummaryCard }`

### 4. Updated Data Layer (`src/data/tasks.ts`)
- Expanded from 5 to 8 realistic mock task records with diverse statuses and priorities
- Added `createdAt` field to every record
- Updated `summaryCards` with consistent indigo/amber/emerald color palette

### 5. Dynamic Table Rendering (`src/components/TaskTable.tsx`)
- Integrated `StatusBadge`, `PriorityBadge`, and `Avatar` inside each table row
- Added `createdAt` column with locale-aware date formatting (`toLocaleDateString`)
- Added empty-state UI (📭 message) when no tasks exist
- Task titles highlight on hover using group transitions

### 6. Premium UI Overhaul (All-White Aesthetic)
- **Global**: Added Inter font from Google Fonts, custom scrollbar, off-white canvas (`#f8fafc`)
- **Header**: Glassmorphism effect (`bg-white/80` + `backdrop-blur-md`), soft shadow
- **Sidebar**: Clean thin borders, polished nav hover states, minimalist help box
- **Summary Cards**: Soft shadows, subtle hover lift effect (`hover:-translate-y-0.5`)
- **Task Table**: Spacious padding, refined column headers, smooth row transitions
- **Badges**: Pastel backgrounds with matching thin border outlines
- **Layout**: Constrained content to `max-w-6xl` for comfortable desktop reading

---

## 📁 Updated Folder Structure (Day 3)

```
src/
├── components/
│   ├── Header.tsx            # UPDATED — glassmorphism, polished bell & avatar
│   ├── Sidebar.tsx           # UPDATED — clean borders, minimalist help box
│   ├── TaskSummaryCard.tsx   # UPDATED — hover lift, soft shadows, uppercase labels
│   ├── TaskTable.tsx         # UPDATED — badges, avatars, createdAt, empty state
│   ├── StatusBadge.tsx       # NEW — auto-colored status pill
│   ├── PriorityBadge.tsx     # NEW — auto-colored priority pill
│   ├── Avatar.tsx            # NEW — initials circle with hash-based color
│   └── ProgressBar.tsx       # NEW — dynamic gradient completion bar
│
├── data/
│   └── tasks.ts              # UPDATED — 8 records, createdAt, refined colors
│
├── types/
│   └── index.ts              # UPDATED — description, createdAt, OnHold, Critical
│
├── pages/
│   ├── Dashboard.tsx         # UPDATED — ProgressBar, dynamic completed count
│   └── TaskList.tsx          # UPDATED — polished heading typography
│
├── App.tsx                   # UPDATED — off-white bg, max-width content wrapper
├── index.css                 # UPDATED — Inter font, custom scrollbar, body gradient
└── main.tsx                  # No changes
index.html                    # UPDATED — Google Fonts preconnect links
```

---

## 🧠 Concepts Learned on Day 3

| Concept | What It Means |
|---|---|
| Union types | `'A' \| 'B' \| 'C'` — restricts a value to only these options |
| `import type` | Tells Vite an import is type-only and safe to strip at build time |
| `Record<K, V>` | A clean way to define lookup dictionaries / maps |
| Hash functions | Convert a string (name) into a consistent number for auto-coloring |
| `Date` objects | Use `new Date()` instead of strings for proper date formatting |
| `toLocaleDateString()` | Formats dates based on user's language and region |
| Empty state pattern | Show a friendly message when data is empty instead of a blank table |
| `key` prop | Unique ID React needs for each repeated list element |
| Glassmorphism | Semi-transparent background + blur for a frosted-glass effect |
| CSS custom shadows | `shadow-[0_2px_8px_rgba(0,0,0,0.02)]` for precise soft shadows |
| Hover transitions | `hover:-translate-y-0.5` + `transition-all` for smooth card lifts |
| Group hover | `group` + `group-hover:text-indigo-600` to style children on parent hover |

---

## 🐛 Issues Faced & Solved on Day 3

| Issue | Cause | Solution |
|---|---|---|
| Blank screen on localhost | `verbatimModuleSyntax` strips non-type imports | Changed to `import type { Task }` |
| `createdAt` not showing | Field missing from mock data | Added `createdAt: new Date(...)` to all records |
| Dates showing as raw strings | Using `string` type instead of `Date` | Switched to `Date` objects with `toLocaleDateString()` |
| UI looked flat and dull | Default gray borders and no shadows | Applied soft shadows, thin borders, glassmorphism, hover effects |

---

## 👨‍💻 Author

**Yuvraj Singh Rawat**
