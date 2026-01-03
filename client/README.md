# Nomadly Frontend

React + TypeScript SaaS application for travel planning and collaboration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend server running on `http://localhost:4444`

### Installation
```bash
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start dev server (http://localhost:5173)
```

### Build & Preview
```bash
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 📂 Project Structure

```
src/
├── assets/          # Static assets (icons, images, logos, illustrations)
├── components/      # Reusable UI components organized by domain
│   ├── auth/        # Authentication (GoogleLoginButton, ProtectedRoute)
│   ├── common/      # Shared components (Navbar, Sidebar, Modals, Footer)
│   ├── icon/        # Icon registry and component
│   ├── landing/     # Landing page sections
│   └── trips/       # Trip-related components
├── constants/       # Centralized constants (toastMessages, etc.)
├── features/        # Feature modules (trips/create, trips/dashboard)
├── hooks/           # Custom React hooks
├── pages/           # Page components (auth, dashboard, explore, profile)
├── services/        # API services (axios interceptors)
├── store/           # Redux Toolkit (auth, trips, ui slices)
├── styles/          # Global styles (animations, base CSS)
├── utils/           # Utilities (errorHandling, auth, debounce)
└── main.tsx         # App entry point
```

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript** - UI framework with type safety
- **Vite** - Build tool (fast HMR, optimized builds)
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management (auth, trips)
- **React Router v7** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client with interceptors
- **react-hot-toast** - Toast notifications
- **Socket.io Client** - WebSocket for real-time features
- **Lucide React** - Icon library

---

## 🎨 Design System

### Color Palette
- **Primary**: `emerald-600` (#059669) - Actions, success states
- **Background**: `gray-50` - Base background
- **Surface**: `white` - Cards, modals
- **Text Primary**: `gray-900` - Headings
- **Text Secondary**: `gray-600` - Body text
- **Borders**: `gray-200` - Dividers, outlines
- **Hover**: `gray-50` / `gray-100` - Interactive states

### Usage Guidelines
- **Headings**: Always dark gray or near-black
- **Body text**: Muted gray for readability
- **Green accent**: Reserved for actions and success states only
- **Error states**: Red tones for validation/auth failures

---

## 🏗️ Architecture Patterns

### Async Operations
Use `useAsyncAction` hook for consistent async handling:

```typescript
const { execute, isLoading, error } = useAsyncAction({
  showToast: true,
  errorMessage: 'Failed to save',
  onSuccess: () => { /* callback */ }
});

await execute(async () => {
  await api.saveTrip(data);
  dispatch(updateTrips());
});
```

**Benefits**: Eliminates try-catch-finally boilerplate, automatic error toasts, consistent loading states.

### Centralized Utilities
- **toastMessages.ts**: Unified messages (AUTH, PROFILE, TRIP, IMAGE, GENERIC)
- **errorHandling.ts**: Error extraction and display
- **useNavigation.ts**: Navigation menu data and logic
- **useImageUpload.ts**: File validation and upload

### State Management Strategy
- **Redux Toolkit**: Persisted state (auth token, user, trips)
- **React Hooks**: Operation state (loading, errors)
- **Local State**: UI state (modals, forms, pickers)

---

## 🔧 Environment Variables

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:4444/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MAPBOX_TOKEN=your_mapbox_token
```

---

## 🔐 Authentication Flow

1. **Login/Signup**: Credentials → Backend → Access token (memory) + Refresh token (httpOnly cookie)
2. **CSRF Protection**: Token stored in localStorage, sent as `x-csrf-token` header
3. **Token Refresh**: Automatic on 401 error via axios interceptor
4. **Logout**: Clears tokens, revokes refresh cookie, redirects to landing
5. **Google OAuth**: One-Tap and button sign-in supported

---

## 🧪 Development Guidelines

### Component Organization
- **Pages**: Handle routing, fetch data, pass to features
- **Features**: Domain logic, orchestrate components and hooks
- **Components**: Presentational, receive props, minimal logic

### Naming Conventions
- Components: PascalCase (`TripCard.tsx`)
- Hooks: camelCase with `use` prefix (`useAsyncAction.ts`)
- Utilities: camelCase (`errorHandling.ts`)
- Constants: UPPER_SNAKE_CASE (`TOAST_MESSAGES`)

### Best Practices
- Always use TypeScript types/interfaces
- Avoid inline styles; use Tailwind classes
- Extract repeated logic into custom hooks
- Use `useAsyncAction` for async operations
- Centralize toast messages in `constants/toastMessages.ts`

---

## 🚨 Common Issues

- **Port already in use**: Change port in `vite.config.ts` or kill process on 5173
- **API connection refused**: Ensure backend is running on correct port
- **CORS errors**: Verify `CLIENT_URL` in backend `.env` matches frontend URL
- **Google OAuth fails**: Check `VITE_GOOGLE_CLIENT_ID` and authorized origins

---

## 📦 Dependencies

### Core
- `react` - UI framework
- `react-dom` - React renderer
- `react-router-dom` - Routing
- `@reduxjs/toolkit` + `react-redux` - State management

### Utilities
- `axios` - HTTP client
- `react-hook-form` - Form validation
- `react-hot-toast` - Notifications
- `date-fns` - Date formatting
- `js-cookie` - Cookie management
- `clsx` - Conditional class names

### UI/Icons
- `lucide-react` - Icon library (all icons via centralized Icon component)
- `socket.io-client` - WebSocket client

---

## 🔗 Related Documentation

- Main project README: `../README.md`
- Backend documentation: `../server/README.md`
- API endpoints: See main README for complete list

---

## 📝 Notes

- Vite uses ES modules; ensure `"type": "module"` in `package.json`
- Path aliases configured: `@/` → `src/`
- Auto-imports disabled; explicit imports required
- Strict TypeScript mode enabled
