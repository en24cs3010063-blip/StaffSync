# StaffSync – Modern Human Resource Management Solution (MERN)

> A production-grade, full-stack Human Resource Management System (HRMS) built for enterprise workforce coordination, role-gated administration, automated attendance tracking, leave approval workflows, employee upskilling programs, and real-time operational analytics.

---

## 🌟 Executive Summary

**StaffSync** streamlines employee operations across three dedicated roles: **HR / Administrator**, **Department Manager**, and **Staff Employee**. Engineered using the **MERN** stack (MongoDB, Express.js, React.js with Vite, Node.js), Redux Toolkit, and Tailwind CSS, StaffSync delivers a modern SaaS user experience paired with robust server-side security, duplicate punch prevention, and automated leave balance deductions.

---

## 🔑 Demo Evaluation Accounts

StaffSync includes preloaded demo credentials and **1-click quick-login buttons** on the login screen for rapid evaluator inspection:

| Role | Email Address | Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **HR / Administrator** | `hr@staffsync.demo` | `Demo@12345` | Org-wide dashboard, employee onboarding, departments, notices, analytics |
| **Department Manager** | `manager@staffsync.demo` | `Demo@12345` | Team roster supervision, leave approval/rejection, employee training assignments |
| **Staff Member** | `employee@staffsync.demo` | `Demo@12345` | Daily digital punch in/out, leave applications, course progress, announcements |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM v6
- **Global State Management:** Redux Toolkit & React-Redux
- **Styling & UI:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Area, Bar, and Pie Charts)
- **HTTP Client:** Axios with JWT request/response interceptors

### Backend
- **Runtime:** Node.js (v20+ LTS recommended)
- **Framework:** Express.js 4 (RESTful API architecture)
- **Database Engine:** MongoDB Atlas / Local MongoDB with Mongoose 8 ODM
- **In-Memory Fallback:** `mongodb-memory-server` (Zero-config instant local execution)
- **Authentication & Security:** JSON Web Tokens (JWT), bcryptjs password hashing, CORS, express-validator
- **Logging:** Morgan

### Testing & DevOps
- **Automated Testing:** Jest & Supertest
- **Production Bundle:** Vite Rollup code splitting & chunk optimization
- **Frontend Hosting:** Vercel (SPA routing rewrite enabled)
- **Backend Hosting:** Render
- **Database Hosting:** MongoDB Atlas

---

## 🚀 Key Functional Modules

### 1. Role-Based Workspaces
- **HR / Admin Workspace (`/dashboard/hr`):** Total workforce counts, turnout rates, pending leave counter, 7-day attendance trend area chart, department headcount breakdown, and administrative shortcuts.
- **Manager Workspace (`/dashboard/manager`):** Assigned direct reports, daily team turnout, pending approval queues with modal rejection reason requirements, and upskilling completion tracking.
- **Employee Workspace (`/dashboard/employee`):** Digital attendance station, remaining leave balances (Annual, Sick, Casual), company announcements stream, and assigned training modules.

### 2. Digital Attendance Management (`/attendance`)
- **Daily Check-In & Check-Out:** Live status indicators ("On Shift", "Shift Finished").
- **Server-Side Validation:** Strictly prevents duplicate check-ins on the same calendar day via compound unique indices (`employee + date`).
- **Duration Calculation:** Automatically computes work hours upon checkout; flags shifts under 4 hours as "Half-Day".
- **Multi-Level Visibility:** Personal monthly logs, Team manager rosters, and HR organization-wide registry.

### 3. Leave Management & Approval Workflows (`/leaves`)
- **Employee Applications:** Select leave type (Annual, Sick, Casual, Maternity/Paternity, Unpaid), start and end dates, and justification.
- **Balance Auto-Deductions:** Verifies available entitlement before submission; automatically deducts balance upon manager or HR approval.
- **Conflict Prevention:** Server-side checks prevent overlapping leaves for the same employee.
- **Manager Review Queue:** Approve with one click or reject with required feedback reasons dispatched via in-app notifications.

### 4. Employee Directory & Profile Hub (`/employees`, `/profile`)
- **Search & Filtering:** Real-time search by name, employee ID, designation, department, and employment status.
- **HR Onboarding Modal:** Register new employees with role, department, manager, and contact details.
- **Account Status Toggles:** Deactivate or reactivate employees with one click.
- **Self-Service Profile:** Edit personal phone, avatar URL, and home address.

### 5. Training & Skill Development Hub (`/training`)
- **Course Catalog:** Categorized courses (Technical, Compliance, Leadership, Soft Skills).
- **Curriculum Resource Links:** Link documentation, videos, and external courses.
- **Employee Enrollment:** Managers and HR can batch-assign employees.
- **Interactive Progress Slider:** Employees record percentage progress, mark completion, and provide feedback.

### 6. Announcements & Broadcast Notices (`/announcements`)
- **Categorized Bulletins:** Company News, Holiday Notices, Policy Updates, Events, and Urgent Bulletins.
- **Priority & Pinned Badges:** Pin critical notices to the top of the feed.
- **Automatic Notifications:** Dispatches in-app notifications to active team members upon publication.

### 7. Reports & Operational Intelligence (`/reports`)
- **Visual Analytics:** Interactive Recharts showing presence trends, department ratios, and leave statuses.
- **One-Click CSV Export:** Generates downloadable `staffsync-hrms-report.csv` for management presentations and compliance audits.

---

## 📁 Project Folder Structure

```
staffsync/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static media assets
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, Modal, Badge, StatCard)
│   │   ├── layouts/             # DashboardLayout with responsive drawer
│   │   ├── pages/               # Dashboards, Directory, Leaves, Attendance, Training, Reports
│   │   ├── routes/              # ProtectedRoute role guards
│   │   ├── services/            # Axios API instance with JWT interceptors
│   │   ├── store/               # Redux Toolkit (authSlice, notificationSlice)
│   │   ├── App.jsx              # Application router
│   │   ├── index.css            # Tailwind directives & sleek scrollbar
│   │   └── main.jsx             # React DOM root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json              # SPA routing fallback for Vercel
│   └── vite.config.js           # Proxy configuration & Rollup chunking
│
├── server/                      # Express Backend API
│   ├── config/                  # Database connection (MongoDB Atlas + In-Memory Fallback)
│   ├── controllers/             # Auth, Employee, Department, Attendance, Leave, Training, Analytics
│   ├── middleware/              # JWT protect, role authorize, centralized error handler
│   ├── models/                  # Mongoose models (User, Employee, Department, Attendance, Leave, Training, Announcement, Notification)
│   ├── routes/                  # Express REST route endpoints
│   ├── scripts/                 # Realistic database seeder script
│   ├── services/                # Notification dispatch helper
│   ├── tests/                   # Automated Jest & Supertest integration suite
│   ├── validators/              # express-validator request schemas
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Server entry point & health check
│
├── render.yaml                  # Render Infrastructure Blueprint
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ Quick Start: Running Locally

### Prerequisites
- **Node.js:** v18.x or v20+ LTS
- **npm:** v9+

### 1. Clone & Enter Project
```bash
git clone https://github.com/en24cs3010063-blip/StaffSync.git
cd StaffSync
```

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
```
*(Note: If `MONGO_URI` is left blank in `.env`, the server automatically initializes an in-memory MongoDB database and seeds demo data—requiring zero local database configuration!)*

Run automated tests:
```bash
npm test
```

Start the backend:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Setup Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
# Vite client running at http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser and click any of the **1-Click Demo Login** buttons!

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and uptime check |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update personal profile details |
| `PUT` | `/api/auth/change-password` | Authenticated | Update account password |
| `GET` | `/api/employees` | Authenticated | Search & filter employee directory |
| `POST` | `/api/employees` | HR Only | Onboard a new employee |
| `PATCH`| `/api/employees/:id/status` | HR Only | Toggle active/deactivated status |
| `POST` | `/api/attendance/check-in` | Authenticated | Record daily clock in |
| `POST` | `/api/attendance/check-out` | Authenticated | Record daily clock out |
| `GET` | `/api/attendance/today` | Authenticated | Get current shift status |
| `GET` | `/api/attendance/my-history` | Authenticated | Get personal attendance records |
| `GET` | `/api/attendance/team` | Manager / HR | Get team presence roster |
| `GET` | `/api/attendance/organization` | HR Only | Organization-wide daily attendance |
| `POST` | `/api/leaves` | Authenticated | Submit leave request |
| `GET` | `/api/leaves/my-leaves` | Authenticated | View personal leave history & balances |
| `GET` | `/api/leaves` | Manager / HR | View leave approval requests |
| `PATCH`| `/api/leaves/:id/review` | Manager / HR | Approve or reject leave request |
| `GET` | `/api/announcements` | Authenticated | View published notices |
| `POST` | `/api/announcements` | HR Only | Publish and broadcast notice |
| `GET` | `/api/trainings` | Authenticated | View training catalog |
| `POST` | `/api/trainings` | Manager / HR | Create training program |
| `POST` | `/api/trainings/:id/assign` | Manager / HR | Batch-enroll employees in training |
| `PATCH`| `/api/trainings/:id/progress` | Authenticated | Update course progress |
| `GET` | `/api/analytics/admin` | HR Only | HR dashboard metric feeds |
| `GET` | `/api/analytics/manager` | Manager / HR | Team performance metric feeds |
| `GET` | `/api/analytics/employee` | Authenticated | Personal stats and shifts |
| `GET` | `/api/notifications` | Authenticated | Fetch in-app notifications |
| `PATCH`| `/api/notifications/mark-all-read` | Authenticated | Mark all notifications read |

---

## 🚢 Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user (e.g. `staffsync_admin`).
3. Under **Network Access**, whitelist `0.0.0.0/0` (allow access from anywhere).
4. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/staffsync?retryWrites=true&w=majority`.

### 2. Backend: Render
1. Create a new Web Service on [Render](https://render.com) linked to your GitHub repo.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `CLIENT_URL`: `https://staffsync-mern-hrms.vercel.app` (Your Vercel URL)
6. Once deployed, note your Render URL: e.g. `https://staffsync-server.onrender.com`.

### 3. Frontend: Vercel
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Root Directory: `client`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_URL`: `https://staffsync-server.onrender.com` (Your Render backend URL)
5. Deploy! Vercel's SPA rewrites (`vercel.json`) ensure all deep links (`/dashboard/hr`, `/attendance`, `/leaves`) resolve properly without 404s.

---

## 🧪 Testing Results

Backend integration test results executed via Jest & Supertest:
```text
PASS tests/api.test.js
  StaffSync HRMS Backend API Suite
    1. Health Check & Public Routes
      ✓ GET /api/health returns 200 and system status (4 ms)
      ✓ GET /api/unknown-endpoint returns 404 (2 ms)
    2. Authentication & Role Permissions
      ✓ Fails login with invalid password (58 ms)
      ✓ GET /api/auth/me returns current user profile with valid token (10 ms)
      ✓ Employee cannot access HR-only routes like POST /api/departments (7 ms)
      ✓ HR can create a new department (8 ms)
    3. Attendance Management & Duplicate Prevention
      ✓ Employee can check in successfully (10 ms)
      ✓ Rejects duplicate check in on the same day (30 ms)
      ✓ Employee can check out (10 ms)
    4. Leave Application & Management
      ✓ Rejects leave request when end date is before start date (10 ms)
      ✓ Manager can view pending leave requests (12 ms)
    5. Announcements & Analytics
      ✓ HR can publish announcements (18 ms)
      ✓ Admin analytics endpoint returns dashboard stats (37 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        2.038 s
```

Frontend production build output:
```text
✓ built in 1.67s
dist/index.html                          1.65 kB │ gzip:   0.84 kB
dist/assets/index-CLzmimAG.css          41.80 kB │ gzip:   7.26 kB
dist/assets/icons-vendor-DJNhEIm-.js    22.16 kB │ gzip:   4.57 kB
dist/assets/react-vendor-BnE1jKci.js   191.83 kB │ gzip:  63.79 kB
dist/assets/index-UnjlgZqC.js          222.93 kB │ gzip:  51.49 kB
dist/assets/charts-vendor-DrJRWGzG.js  394.51 kB │ gzip: 108.72 kB
```

---

## 🔮 Future Enhancements
- Integration with biometric hardware scanners via WebSockets.
- Payroll generation with automated tax calculations and payslip PDF downloads.
- Slack / Microsoft Teams webhook integrations for leave approvals and announcement alerts.
- Performance review cycles (360-degree peer feedback).

---

## 📄 License
This project is open-source under the MIT License. Developed for major academic project submission and demonstration.
