# Sigeth Hotel Management System - Frontend

A modern React-based hotel management system frontend with comprehensive guest management, housekeeping, and banqueting modules.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Architecture & Design](#architecture--design)
- [Component Organization](#component-organization)
- [Development Guidelines](#development-guidelines)
- [API Integration](#api-integration)
- [Internationalization (i18n)](#internationalization-i18n)
- [Contributing](#contributing)

## 🎯 Overview

Sigeth is a comprehensive hotel management system designed to streamline operations across three main departments:

1. **Rooms Attendant** - Guest reservations, check-ins, check-outs, and room management
2. **Housekeeping** - Staff management, room status tracking, laundry services, and maintenance
3. **Banqueting** - Event management, banquet orders, and catering services

The frontend is built with React 19, TypeScript, and modern development tools to provide a responsive, user-friendly interface for hotel staff.

## 🛠 Tech Stack

### Core Framework

- **React** `19.2.0` - UI library
- **React Router DOM** `7.13.1` - Routing and navigation
- **TypeScript** `5.9.3` - Type safety

### State Management & Data Fetching

- **TanStack React Query** `5.90.21` - Server state management and caching
- **Axios** `1.13.6` - HTTP client for API calls

### Styling & Animation

- **Tailwind CSS** `4.2.1` - Utility-first CSS framework
- **Tailwind CSS Vite Plugin** `4.2.1` - Vite integration
- **Framer Motion** `12.36.0` - Animation library

### UI Components & Icons

- **Lucide React** `0.577.0` - Icon library
- **Recharts** `3.8.0` - Charts and data visualization

### Build & Development

- **Vite** `7.3.1` - Fast build tool and dev server
- **Vite React Plugin** `5.1.1` - React fast refresh support
- **ESLint** `9.39.1` - Code linting
- **TypeScript ESLint** `8.48.0` - TypeScript linting rules

## 📁 Project Structure

```
src/
├── App.tsx                          # Main app component with routing
├── main.tsx                         # Entry point with context providers
├── index.css                        # Global styles with Tailwind
├── App.css                          # App-specific styles
│
├── components/                      # Reusable UI components
│   ├── auth/                        # Authentication components
│   │   ├── ProtectedRoute.tsx       # Route protection wrapper
│   │   └── LoginForm.tsx            # Login form component
│   ├── common/                      # Common/shared components
│   │   ├── ConfirmationModal.tsx    # Confirmation dialog
│   │   ├── ErrorBoundary.tsx        # Error handling
│   │   └── NotificationToast.tsx    # Toast notifications
│   ├── layout/                      # Layout components
│   │   ├── Layout.tsx               # Main layout wrapper
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── Header.tsx               # Top header
│   │   └── Footer.tsx               # Footer component
│   └── ui/                          # Reusable UI elements
│       ├── SearchableCountrySelect.tsx  # Country/Nationality dropdown
│       ├── Table.tsx                # Data table component
│       ├── Modal.tsx                # Modal dialogs
│       └── Forms.tsx                # Form components
│
├── pages/                           # Page components (one per route)
│   ├── Login.tsx                    # Login page
│   ├── RoleBasedRedirect.tsx        # Role-based routing
│   ├── rooms-attendant/             # Rooms Attendant module
│   │   ├── CheckInWalkIn.tsx        # Walk-in guest check-in form
│   │   ├── CheckInReservation.tsx   # Reserved guest check-in
│   │   ├── CheckInGroup.tsx         # Group check-in
│   │   ├── IndividualReservation.tsx # Individual reservation form
│   │   ├── GroupReservation.tsx     # Group reservation form
│   │   ├── GroupMemberReservation.tsx # Add group members
│   │   ├── CheckOut.tsx             # Guest checkout
│   │   ├── MoveGuest.tsx            # Transfer guest to another room
│   │   ├── FindRoom.tsx             # Room availability search
│   │   ├── TwinRecording.tsx        # Twin room management
│   │   ├── InvoicePreview.tsx       # Invoice viewing
│   │   └── Reports/                 # Reporting pages
│   │       ├── ArrivalOn.tsx        # Guest arrivals
│   │       ├── ArrivalOff.tsx       # Guest departures
│   │       ├── RoomsByStatus.tsx    # Room status overview
│   │       ├── DailyConsumptions.tsx # Daily consumption report
│   │       └── InvoiceByGuest.tsx   # Invoice reports
│   ├── housekeeping/                # Housekeeping module
│   │   ├── RoomCategories.tsx       # Room type management
│   │   ├── RoomsRepertory.tsx       # Room inventory
│   │   ├── HousekeepingStaff.tsx    # Staff management
│   │   ├── DailyDispatching.tsx     # Daily task assignment
│   │   ├── RoomStatus.tsx           # Room status tracking
│   │   ├── LaundryOrder.tsx         # Laundry orders
│   │   └── Reports/                 # Housekeeping reports
│   │       ├── DailyRoomReport.tsx  # Room status report
│   │       └── LaundryJournal.tsx   # Laundry history
│   └── banqueting/                  # Banqueting module
│       ├── EventsLots.tsx           # Event management
│       ├── BanquetOrders.tsx        # Banquet order processing
│       └── Reports/                 # Banqueting reports
│
├── context/                         # React Context for global state
│   ├── AuthContext.tsx              # Authentication state
│   ├── HotelDataContext.tsx         # Hotel data (rooms, guests, etc.)
│   ├── NotificationContext.tsx      # Notifications/alerts
│   └── ThemeContext.tsx             # Theme settings (light/dark)
│
├── hooks/                           # Custom React hooks
│   ├── useLang.tsx                  # Language/translation hook
│   ├── useAuth.ts                   # Authentication hook
│   ├── useNotification.ts           # Notification hook
│   ├── usePageTitle.ts              # Page title management
│   ├── useRooms.ts                  # Rooms data hook
│   ├── useReservations.ts           # Reservations data hook
│   ├── useInvoices.ts               # Invoices data hook
│   └── useStaff.ts                  # Staff data hook
│
├── services/                        # API integration
│   ├── sigethApi.ts                 # Main API client with Axios
│   ├── auth.ts                      # Authentication endpoints
│   ├── rooms.ts                     # Room management endpoints
│   ├── reservations.ts              # Reservation endpoints
│   ├── guests.ts                    # Guest information endpoints
│   ├── housekeeping.ts              # Housekeeping endpoints
│   └── banqueting.ts                # Banqueting endpoints
│
├── types/                           # TypeScript type definitions
│   ├── index.ts                     # Main types export
│   ├── auth.ts                      # Auth types (User, Token, etc.)
│   ├── rooms.ts                     # Room types (Room, RoomStatus, etc.)
│   ├── reservations.ts              # Reservation types (Reservation, Guest, etc.)
│   ├── invoices.ts                  # Invoice types
│   └── api.ts                       # API response types
│
├── utils/                           # Utility functions
│   ├── dateFormatter.ts             # Date formatting utilities
│   ├── currencyFormatter.ts         # Currency formatting
│   ├── errorFormatter.ts            # Error handling utilities
│   ├── validators.ts                # Input validation functions
│   ├── roomsAttendantValidation.ts  # Room attendant form validation
│   ├── countries.ts                 # Country/nationality data
│   └── helpers.ts                   # General helper functions
│
├── lib/                             # Library configurations
│   ├── queryClient.ts               # React Query configuration
│   └── axiosConfig.ts               # Axios default settings
│
└── i18n/                            # Internationalization (i18n)
    └── translations.ts              # Multi-language translations (EN, FR)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** `18+` or **npm** `9+`
- Backend API server running (Django/DRF)
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sigeth-frontend/sigeth
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment configuration** (if needed)

   ```bash
   # Create a .env file for API endpoints
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5173` (or next available port)

5. **Build for production**
   ```bash
   npm run build
   ```
   Output is in the `dist/` directory

### Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run lint      # Run ESLint code analysis
npm run preview   # Preview production build locally
```

## ✨ Key Features

### 1. **Rooms Attendant Module**

- ✅ Guest reservations (individual & group)
- ✅ Check-in management (standard, walk-in, group)
- ✅ Check-out processing
- ✅ Room transfers and upgrades
- ✅ Automatic invoice generation
- ✅ Guest history and reports
- ✅ Multi-language support (English, French)
- ✅ Searchable country/nationality selection with auto-detected phone codes

### 2. **Housekeeping Module**

- ✅ Room inventory and categorization
- ✅ Staff assignment and task management
- ✅ Room status tracking (clean, dirty, maintenance, occupied)
- ✅ Laundry service management
- ✅ Daily room reports
- ✅ Maintenance request tracking

### 3. **Banqueting Module**

- ✅ Event lot management
- ✅ Banquet order processing
- ✅ Service pricing configuration
- ✅ Event reporting and tracking

### 4. **Cross-Module Features**

- ✅ **Authentication** - Secure login with JWT tokens
- ✅ **Role-based Access Control** - Different views for different user roles
- ✅ **Real-time Notifications** - Toast notifications for actions and errors
- ✅ **Multi-language Support** - English and French interface
- ✅ **Data Validation** - Client-side form validation with error messages
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Dark Mode Ready** - Tailwind CSS supports light/dark themes
- ✅ **Performance Optimized** - React Query for efficient caching and data management

## 🏗 Architecture & Design

### Design Patterns

#### 1. **Component Architecture**

- **Page Components** - Handle routing and page-level logic
- **Feature/Module Components** - Grouped by business domain (rooms-attendant, housekeeping, etc.)
- **Reusable UI Components** - Small, focused components in `components/ui`
- **Layout Components** - Shared layout structures (sidebar, header, footer)

#### 2. **State Management**

```
Global State (Context):
├── AuthContext      → User authentication & permissions
├── HotelDataContext → Rooms, guests, reservations
├── NotificationContext → Toast notifications
└── LangContext      → Language settings

Server State (React Query):
├── useRooms() → Room data
├── useReservations() → Reservation data
├── useGuests() → Guest information
├── useInvoices() → Invoice data
└── useStaff() → Staff information
```

#### 3. **Data Flow**

```
User Action
    ↓
Component Handler
    ↓
Custom Hook (useRooms, etc.)
    ↓
React Query / API Service
    ↓
Axios HTTP Request
    ↓
Backend API
    ↓
Response → React Query Cache
    ↓
Component Re-render
```

#### 4. **Form Handling**

- Local component state for form inputs
- Real-time validation with error messages
- Submission to API via custom hooks
- Success/error notifications via context
- Example: `CheckInWalkIn.tsx`, `IndividualReservation.tsx`

#### 5. **Styling Approach**

- **Utility-first CSS** with Tailwind
- **Custom colors** defined in Tailwind config (hotel-gold, hotel-danger, etc.)
- **Component-level styles** in `App.css` and page-specific CSS files
- **Responsive breakpoints** for mobile-first design

### Component Interaction Flow

```
Layout (Sidebar + Header + Main)
│
├── Routes
│   ├── Login Page
│   │
│   ├── Rooms Attendant Pages
│   │   ├── CheckInWalkIn
│   │   ├── IndividualReservation
│   │   └── [Other RA pages...]
│   │
│   ├── Housekeeping Pages
│   │   ├── RoomStatus
│   │   ├── LaundryOrder
│   │   └── [Other HK pages...]
│   │
│   └── Banqueting Pages
│       ├── EventsLots
│       ├── BanquetOrders
│       └── [Other Banqueting pages...]
│
└── Context Providers (Notifications, Notifications, Theme)
```

## 📦 Component Organization

### Core Component Hierarchy

**Layout Components** (`components/layout/`)

- `Layout` - Main container
- `Sidebar` - Navigation menu
- `Header` - Top bar with user info
- `Footer` - Bottom info

**UI Components** (`components/ui/`)

- `SearchableCountrySelect` - Country/nationality dropdown with search
- `Table` - Data table with sorting/pagination
- `Modal` - Reusable modal dialogs
- `ConfirmationModal` - Yes/No confirmation dialogs
- `Forms` - Common form fields
- `NotificationToast` - Toast notifications

**Feature-Specific Components** (in respective page folders)

- Room forms, guest management, etc.
- Most pages are self-contained components

## 👨‍💻 Development Guidelines

### 1. **Creating a New Page**

```typescript
// src/pages/module-name/NewPage.tsx
import { useState } from "react";
import { useLang } from "../../hooks/useLang";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function NewPage() {
  const { t } = useLang(); // Get translations
  usePageTitle("pageTitle"); // Set document title

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
      {/* Page content */}
    </div>
  );
}
```

### 2. **Creating a Custom Hook**

```typescript
// src/hooks/useNewFeature.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/sigethApi";

export function useNewFeature(id?: string) {
  return useQuery({
    queryKey: ["newFeature", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/new-endpoint/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run if id is provided
  });
}
```

### 3. **Form Validation**

```typescript
// src/utils/validators.ts
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validatePhone(phone: string): boolean {
  // Accept with country code: +250788888
  // Or without: 788888
  const withCode = /^\+[1-9]\d{1,14}$/.test(phone);
  const withoutCode = /^\d{5,15}$/.test(phone);
  return withCode || withoutCode;
}
```

### 4. **Naming Conventions**

- **Components**: PascalCase (e.g., `CheckInWalkIn.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `userEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)
- **Custom Hooks**: `use` prefix (e.g., `useRooms`, `useLang`)
- **CSS Classes**: kebab-case (e.g., `bg-hotel-gold`)

### 5. **Code Standards**

- Use TypeScript for type safety
- Add JSDoc comments for complex functions
- Keep components focused and single-responsibility
- Extract logic to custom hooks when reused
- Use environment variables for API endpoints
- Always handle loading and error states

### 6. **Best Practices**

✅ **Do:**

- Use React Query for server state
- Use Context for global UI state
- Validate input on both client and server
- Handle API errors gracefully
- Show loading states during async operations
- Use Tailwind for styling
- Write reusable components

❌ **Don't:**

- Store server data in React state if React Query can handle it
- Prop drill deeply (use Context instead)
- Use `any` types in TypeScript
- Make inline style objects
- Ignore error handling
- Hardcode strings (use i18n)

## 🔌 API Integration

### API Client Setup

```typescript
// src/services/sigethApi.ts
import axios from "axios";

export const frontOfficeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-add auth token to requests
frontOfficeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Making API Calls

```typescript
// In a custom hook
const { data, isLoading, error } = useQuery({
  queryKey: ["reservations"],
  queryFn: async () => {
    const response = await frontOfficeApi.get("/api/v1/reservations/");
    return response.data;
  },
});

// Direct call for mutations
const handleSubmit = async (data) => {
  try {
    const response = await frontOfficeApi.post("/api/v1/check-in/", data);
    showNotification("Check-in successful!", "success");
  } catch (error) {
    showNotification(error.response.data.message, "error");
  }
};
```

### API Endpoints Used

**Rooms Attendant**

- `GET/POST /api/v1/reservations/` - Reservations management
- `GET/POST /api/v1/check-in/` - Check-in processing
- `GET/POST /api/v1/guests/` - Guest information
- `GET /api/v1/invoices/` - Invoice data
- `GET /api/v1/rooms/` - Room information

**Housekeeping**

- `GET/POST /api/v1/housekeeping/room-status/` - Room status
- `GET/POST /api/v1/housekeeping/laundry/` - Laundry services
- `GET /api/v1/housekeeping/staff/` - Staff information

**Banqueting**

- `GET/POST /api/v1/banqueting/events/` - Event management
- `GET/POST /api/v1/banqueting/orders/` - Banquet orders

## 🌐 Internationalization (i18n)

### Language Support

The app supports English and French. Translations are managed in:

- `src/i18n/translations.ts` - All language strings
- `src/hooks/useLang.tsx` - Language context and hook
- Examples: "welcomeMessage", "invalidPhoneFormat", etc.

### Using Translations

```typescript
import { useLang } from "../../hooks/useLang";

export default function MyComponent() {
  const { t, lang, setLang } = useLang();

  return (
    <div>
      <h1>{t("welcomeMessage")}</h1>
      <button onClick={() => setLang(lang === "en" ? "fr" : "en")}>
        {lang === "en" ? "Français" : "English"}
      </button>
    </div>
  );
}
```

### Adding New Translations

1. Open `src/i18n/translations.ts`
2. Add your key/value pair in both `EN` and `FR` objects
3. Use `t("yourKey")` in components

```typescript
// src/i18n/translations.ts
export const EN = {
  yourKey: "Your English text here",
  // ... other translations
};

export const FR = {
  yourKey: "Votre texte français ici",
  // ... other translations
};
```

## 🎨 Customization

### Tailwind Theme Configuration

Customize colors, fonts, and breakpoints in `tailwind.config.js`:

```javascript
// Hotel-specific colors (example)
colors: {
  "hotel-gold": "#D4A056",
  "hotel-danger": "#E74C3C",
  "hotel-text-primary": "#2C3E50",
  // Add more as needed
}
```

### Layout Customization

- **Sidebar**: `src/components/layout/Sidebar.tsx`
- **Header**: `src/components/layout/Header.tsx`
- **Color Scheme**: `src/index.css` and Tailwind config

## 🐛 Troubleshooting

### Common Issues

**Port already in use**

```bash
# Change port in Vite config or use:
npm run dev -- --port 3000
```

**API connection errors**

- Check backend server is running
- Verify `VITE_API_URL` environment variable
- Check browser console for CORS errors

**Build errors**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Styles not applying**

- Ensure Tailwind classes are used correctly
- Check `tailwind.config.js` is properly configured
- Rebuild the project

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [TanStack React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When contributing:

1. Follow the project structure and naming conventions
2. Use TypeScript for type safety
3. Test your changes locally
4. Add comments for complex logic
5. Use i18n for all user-facing text
6. Submit clear commit messages

## 📄 License

This project is proprietary software. All rights reserved.

---

**Questions or Issues?** Contact the development team or refer to the backend documentation at `sigeth-server/README.md`.
