# LMS Platform - Frontend Documentation

## Overview

The LMS (Learning Management System) Platform is a comprehensive learning management solution with 5 distinct experience layers serving different user roles.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3214
```

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Learner Dashboard
│   ├── instructor/         # Instructor Console
│   ├── admin/              # Admin Control Plane
│   ├── manager/            # HR Manager Dashboard
│   └── finance/            # Finance Console
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Shared components
│   ├── instructor/         # Instructor-specific
│   ├── admin/              # Admin-specific
│   ├── manager/            # Manager-specific
│   └── finance/            # Finance-specific
└── lib/                    # Utilities
```

---

## Experience Layers

### 1. Learner Dashboard (`/dashboard`)

For learners to track their learning progress.

| Route | Description |
|-------|-------------|
| `/dashboard` | Home with stats and next action |
| `/dashboard/actions` | Action queue with pending activities |
| `/dashboard/activity/[id]` | Activity detail view |
| `/dashboard/evidence` | Evidence submission and tracking |
| `/dashboard/feedback` | Instructor feedback history |

**Key Components:**
- `Sidebar` - Navigation with collapsible state
- `StatCard` - Reusable metric display
- `ActionCard` - Activity item with status

---

### 2. Instructor Console (`/instructor`)

For instructors to manage cohorts and provide feedback.

| Route | Description |
|-------|-------------|
| `/instructor` | Dashboard with cohort health |
| `/instructor/learners` | Learner list with search/filter |
| `/instructor/learners/[id]` | Individual learner profile |
| `/instructor/feedback` | Pending feedback queue |
| `/instructor/attendance` | Session attendance tracking |

**Key Components:**
- `InstructorSidebar` - Console navigation
- `CohortCard` - Cohort statistics
- `LearnerCard` - Learner summary

---

### 3. Admin Control Plane (`/admin`)

For administrators to manage programs and enrollments.

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with system stats |
| `/admin/programs` | Program management |
| `/admin/activities` | Activity template library |
| `/admin/enrollments` | Enrollment management |
| `/admin/audit` | System audit log |

**Key Components:**
- `AdminSidebar` - Control plane navigation

---

### 4. HR Manager Dashboard (`/manager`)

For HR/managers to monitor workforce training.

| Route | Description |
|-------|-------------|
| `/manager` | Overview with department stats |
| `/manager/skills` | Skill coverage analysis |
| `/manager/risks` | Risk heatmap visualization |
| `/manager/impact` | Training ROI metrics |

**Key Components:**
- `ManagerSidebar` - Dashboard navigation

---

### 5. Finance Console (`/finance`)

For finance team to manage transactions.

| Route | Description |
|-------|-------------|
| `/finance` | Dashboard with revenue stats |
| `/finance/transactions` | Transaction history |
| `/finance/invoices` | Invoice management |
| `/finance/refunds` | Refund processing |

**Key Components:**
- `FinanceSidebar` - Console navigation

---

## Shared Components

### Header

```tsx
import { Header } from "@/components/dashboard/header";

<Header 
  title="Learner Dashboard"
  sidebarCollapsed={collapsed}
  onMenuClick={toggleMenu}
/>
```

### StatCard

```tsx
import { StatCard } from "@/components/dashboard/stat-card";

<StatCard
  title="Total Learners"
  value="248"
  change="+12%"
  trend="up"
  icon={Users}
/>
```

---

## Design Patterns

### Layout Structure

Each console uses a consistent layout pattern:

1. **Fixed Sidebar** - Left navigation (collapsible)
2. **Fixed Header** - Top bar with title, notifications, user menu
3. **Scrollable Content** - Main content area with padding

### Responsive Design

- Sidebar hidden on mobile, toggled via menu button
- Cards stack vertically on small screens
- Tables scroll horizontally

### State Management

Currently using React `useState` for local UI state. Mock data is hardcoded in each page component.

---

## Future Backend Integration

When integrating with backend:

1. Replace mock data with API calls
2. Add authentication context
3. Implement role-based route protection
4. Add loading and error states
5. Connect forms to API endpoints

---

## File Count Summary

| Category | Count |
|----------|-------|
| Pages | 23 |
| Components | 13 |
| Layouts | 5 |
| **Total** | **41** |
