# Nomadly Frontend Documentation

High-level frontend architecture overview. For detailed feature documentation, see feature-specific READMEs.

## Quick Links

- **[Auth Feature](client/src/features/auth/README.md)** - Registration, login, OAuth, protected routes
- **[Trips Feature](client/src/features/trips/README.md)** - Trip browsing, creation, management, workspace
- **[Dashboard Feature](client/src/features/dashboard/README.md)** - User dashboard and trip overview
- **[Profile Feature](client/src/features/profile/README.md)** - User profile management
- **[Landing Feature](client/src/features/landing/README.md)** - Public landing page
- **[Invitations Feature](client/src/features/invitations/README.md)** - Trip invitations

---

## Tech Stack

- **Runtime**: Node.js with npm/yarn
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 7.9.2
- **State Management**: Redux Toolkit 2.9.0
- **HTTP Client**: Axios 1.12.2
- **Styling**: Tailwind CSS 3.4.17
- **Forms**: React Hook Form 7.63.0
- **Toasts**: React Hot Toast 2.6.0
- **Real-time**: Socket.IO Client 4.8.1
- **Icons**: Lucide React 0.544.0
- **Date Handling**: date-fns 4.1.0
- **Build Tool**: Vite 7.1.7
- **Language**: TypeScript 5.9.3
- **Linting**: ESLint 9.36.0

---

## Development Commands

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Build production bundle
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## Architecture Overview

### Client Structure

```
client/src/
├── main.tsx               # React DOM entry point
├── App.tsx                # Root routing component
├── vite-env.d.ts          # Vite environment types
├── features/              # Feature modules (feature-driven architecture)
│   ├── auth/              # Authentication & routes
│   ├── dashboard/         # Dashboard page
│   ├── trips/             # Trip management
│   ├── profile/           # User profile
│   ├── landing/           # Landing page
│   ├── invitations/       # Trip invitations
│   └── <feature>/         # New features follow same pattern
├── pages/                 # Standalone pages
│   └── explore/           # Trip exploration pages
├── services/              # API clients & external services
├── store/                 # Redux store configuration
├── hooks/                 # Reusable React hooks
├── ui/                    # Reusable UI components
│   ├── common/            # Shared components
│   ├── icon/              # Icon components
│   └── layout/            # Layout components
├── utils/                 # Utility functions
├── styles/                # Global CSS
├── assets/                # Images, logos, illustrations
└── constants/             # App-wide constants
```

### Feature Structure

Each feature module follows this pattern:

```
features/<feature>/
├── README.md              # Feature documentation
├── index.ts               # Public exports
├── components/            # React components
├── pages/                 # Full-page components
├── store/                 # Redux slices & thunks (if applicable)
├── hooks/                 # Feature-specific hooks
├── types/                 # TypeScript interfaces/types
├── constants/             # Feature constants
├── utils/                 # Feature utilities
├── validators/            # Input validation
└── routes/                # Route definitions (for auth)
```

---

## Core Infrastructure

### main.tsx - Entry Point

Renders React app into the DOM:

```tsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

### App.tsx - Root Routing

**Key Responsibilities**:
1. Redux store subscription via `Provider`
2. Token initialization from refresh token
3. Route definitions using React Router
4. Layout selection (authenticated vs. public)
5. Toast notification setup

**Route Structure**:
- `/` - Landing (public)
- `/auth/*` - Auth pages (login, signup)
- `/explore` - Browse public trips
- `/explore/trips/:tripId` - Trip details (public)
- `/dashboard` - Dashboard (protected)
- `/trips` - User's trips (protected)
- `/trips/new` - Create trip (protected)
- `/trips/:tripId/*` - Trip workspace (protected)
- `/profile` - Profile (protected)

**Layouts**:
- `PublicLayout` - Public navbar + footer
- `AppLayout` - Sidebar + navbar (authenticated)
- `ConditionalLayout` - Switches based on auth state

### Configuration Files

**vite.config.ts** - Vite build configuration:
- React plugin
- Path aliases: `@` → `src/`, `@shared` → `../shared/`

**tailwind.config.ts** - Tailwind CSS configuration:
- Custom colors: primary (blue) and secondary (emerald)
- Font family: Inter

**tsconfig.json** - TypeScript configuration:
- Target: ES2020
- Strict mode enabled
- Module resolution with path aliases

**eslint.config.ts** - ESLint rules:
- React 19 compatibility
- TypeScript support
- React Hooks linting

---

## State Management

### Redux Store

**File**: [client/src/store/index.ts](client/src/store/index.ts)

Store structure:

```typescript
{
  auth: AuthState,           // Auth slice (user, token, initialized)
  trips: TripsState,         // Trips slice (categorized trips, current trip)
  ui: UiState,               // UI slice (sidebar toggle, modals)
}
```

**State Types**:
```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth State (authSlice)

**File**: `features/auth/store/authSlice.ts`

**State Structure**:
```typescript
{
  isAuthenticated: boolean,
  user: User | null,
  token: string | null,
  initialized: boolean,      // Set after initial token refresh attempt
  loading: boolean,
  error: string | null,
}
```

**Actions**:
- `loginStart()` - Begin login
- `loginSuccess(payload)` - Set user & token
- `loginFailure(error)` - Set error
- `logout()` - Clear auth state
- `setInitialized()` - Mark app as initialized
- `updateProfileStart/Success/Failure()` - Profile updates

**Async Thunks**:
- `loginAsync(credentials)` - Login via email/password
- `signupAsync(credentials)` - Register new account
- `googleLoginAsync(googleToken)` - Google OAuth login

**Token Sync**:
The `initializeTokenSync(store)` function in `api.ts` subscribes to Redux changes and syncs the access token to the Axios client, making Redux the source of truth.

### Trips State (tripsSlice)

**File**: `features/trips/store/index.ts`

Manages trip browsing and workspace state.

### UI State (uiSlice)

**File**: [client/src/store/uiSlice.ts](client/src/store/uiSlice.ts)

Manages UI toggles (sidebar, modals, etc.).

---

## API Integration

### Axios Client

**File**: [client/src/services/api.ts](client/src/services/api.ts)

**Configuration**:
- Base URL: `http://localhost:4444/api` (dev) or `VITE_API_URL` env var
- Credentials: `withCredentials: true` (for cookies)
- Content-Type: Auto-detected (FormData handled specially)

**Request Interceptor**:
1. Sets `Content-Type: application/json` (unless FormData)
2. Adds Authorization Bearer token if available

**Response Interceptor**:
1. Catches 401 responses (unauthorized)
2. Attempts token refresh via `/auth/refresh` endpoint
3. Implements request queue to handle concurrent requests during refresh
4. Replays original request with new token
5. Clears token on refresh failure

**Token Management**:
- `setAccessToken(token)` - Set token in client
- `getAccessToken()` - Get current token
- `clearAccessToken()` - Clear token
- `initializeTokenSync(store)` - Subscribe to Redux state changes

**CSRF Protection**:
- CSRF token stored in cookies (set by backend)
- Sent via `x-csrf-token` header on refresh endpoint
- See `services/csrf.ts` for helper functions

### Service Layer

Each domain has a dedicated service file:

**[trips.service.ts](client/src/services/trips.service.ts)**
- `fetchUserTrips()` - Get user's trips
- `createTrip(payload)` - Create new trip
- `updateTrip(id, payload)` - Update trip details
- `deleteTrip(id)` - Delete trip
- `fetchTripMembers(tripId)` - Get trip members
- `getTripStats(tripId)` - Get trip statistics

**[destinations.service.ts](client/src/services/destinations.service.ts)**
- `fetchDestinations(tripId)` - Get trip destinations
- `createDestination(tripId, payload)` - Add destination
- `updateDestination(id, payload)` - Update destination
- `deleteDestination(id)` - Delete destination
- `reorderDestinations(tripId, ids)` - Reorder destinations
- `uploadDestinationImage(id, formData)` - Upload image

**[tasks.service.ts](client/src/services/tasks.service.ts)**
- Trip task management

**[members.service.ts](client/src/services/members.service.ts)**
- Trip member management

**[invitations.service.ts](client/src/services/invitations.service.ts)**
- Invitation handling

**Response Normalization**:

Backend responses follow structure: `{ success: true, data: { entity: {...} } }`

Service functions normalize responses to extract the entity:

```typescript
const normalizeDestinationResponse = (response: any): Destination => {
  if (response.data?.destination) return response.data.destination;
  if (response.destination) return response.destination;
  return response;
};
```

---

## Custom Hooks

### Global Hooks

**[useAsyncAction.ts](client/src/hooks/useAsyncAction.ts)**

Manages async operations with loading/error states:

```typescript
const { execute, isLoading, error, reset } = useAsyncAction({
  onSuccess: () => console.log('Done'),
  errorMessage: 'Custom error message',
  showToast: true,
});

await execute(async () => {
  await api.saveData(data);
});
```

**useImageUpload.ts**
- Handles image selection and upload validation

**useNavigation.ts**
- Navigation helpers

**useOnClickOutside.ts**
- Detect clicks outside elements (for modals, dropdowns)

### Feature Hooks

**Auth Hooks** ([features/auth/hooks](client/src/features/auth/hooks))
- `useAuth()` - Get current user & auth state
- `useLogin()` - Login functionality
- `useSignup()` - Signup functionality
- `useGoogleLogin()` - Google OAuth
- `useLogout()` - Logout functionality
- `useAuthRedirect()` - Handle auth redirects

**Trip Hooks** ([features/trips/hooks](client/src/features/trips/hooks))
- Trip management and workspace hooks

---

## UI Components

### Common Components

Located in [ui/common](client/src/ui/common):

**Layout**:
- `AppNavbar` - Main authenticated navigation bar
- `PublicNavbar` - Public navigation bar
- `Sidebar` - Authenticated sidebar
- `MobileSidebar` - Mobile sidebar
- `Footer` - Footer component
- `MinimalFooter` - Lightweight footer
- `PageHeader` - Page title section

**Forms & Input**:
- `LocationSearchInput` - Location search with suggestions
- `ImageButton` - Image upload button

**Modals**:
- `ConfirmationModal` - Generic confirmation dialog
- `EditTripModal` - Trip editing modal

**Cards & Display**:
- `TripCard` - Trip preview card
- `StatsPill` - Statistics badge

**Utilities**:
- `ThreeDotMenu` - Dropdown menu
- `ErrorAlert` - Error message display
- `Icon` - Icon wrapper

### Icon Components

**[Icon.tsx](client/src/ui/icon/Icon.tsx)** - Wraps Lucide React icons with custom styling.

---

## Styling

### Global Styles

**[styles/global.css](client/src/styles/global.css)** - Global CSS including:
- CSS variables for colors
- Tailwind directives
- Custom utility classes

### Tailwind Configuration

**Custom Colors**:
```
primary: Blue (50, 500, 600, 700)
secondary: Emerald (50, 500, 600, 700)
```

**Breakpoints**: Bootstrap-standard (sm, md, lg, xl, 2xl)

### Component Styling

Components use:
- Tailwind utility classes for styling
- CSS variables for theme colors
- `clsx` for conditional classes

---

## Utilities

### Error Handling

**File**: [utils/errorHandling.ts](client/src/utils/errorHandling.ts)

**Functions**:
- `extractApiError(error, fallback)` - Extract error message from API response
- `showErrorToast(message)` - Display error toast notification

**Error Types**:
```typescript
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: any[];
    };
  };
  message?: string;
}
```

### Other Utilities

**[utils/debounce.ts](client/src/utils/debounce.ts)** - Debounce function for rate-limiting

---

## Authentication Flow

### Protected Routes

**[ProtectedRoute.tsx](client/src/features/auth/routes/ProtectedRoute.tsx)**

Redirects unauthenticated users to login:

```tsx
<ProtectedRoute>
  <MyComponent />
</ProtectedRoute>
```

### Public Routes

**[PublicRoute.tsx](client/src/features/auth/routes/PublicRoute.tsx)**

Allows public access, redirects authenticated users from auth pages.

### Landing Route

**[LandingRoute.tsx](client/src/features/auth/routes/LandingRoute.tsx)**

Landing page accessible only to unauthenticated users.

### Token Initialization

**App.tsx**:

1. On app load, App.tsx checks for refresh token in cookies
2. If exists, calls `/auth/refresh` endpoint
3. Gets new access token and user object
4. Dispatches `loginSuccess` to Redux
5. Sets `initialized` to true (shows main content)
6. If refresh fails, sets `initialized` to true (shows login)

---

## Form Validation

### Auth Validators

**File**: `features/auth/validators/authValidators.ts`

**Validators**:
- `validateEmail(email)` - Email format
- `validateUsername(username)` - Username rules (3-20 chars, alphanumeric + underscore)
- `validatePassword(password)` - Password strength
- `validateLoginCredentials(data)` - Full login form
- `validateSignupCredentials(data)` - Full signup form

**Password Strength**:
- `calculatePasswordStrength(password)` - Returns 0-4 strength score
- `getPasswordStrengthInfo(strength)` - Returns color, message, requirements
- `PASSWORD_REQUIREMENTS` constant

### React Hook Form Integration

Components use React Hook Form for form state management:

```typescript
const { register, handleSubmit, watch, formState: { errors } } = useForm();
```

---

## Constants

### Auth Constants

**File**: `features/auth/constants/authConstants.ts`

- `AUTH_ENDPOINTS` - API endpoint paths
- `AUTH_ROUTES` - Frontend route paths
- `AUTH_STORAGE_KEYS` - localStorage keys
- `PASSWORD_REQUIREMENTS` - Password validation rules
- `USERNAME_REQUIREMENTS` - Username validation rules

### Toast Messages

**File**: [constants/toastMessages.ts](client/src/constants/toastMessages.ts)

Centralized toast notification messages.

---

## Real-Time Features (Socket.IO)

**Client**: [socket.io-client](https://socket.io/docs/v4/client-api/) library

**Setup** (in components):
1. Import `io` from socket.io-client
2. Connect to backend with `io(API_BASE_URL)`
3. Listen to events: `socket.on('eventName', callback)`
4. Emit events: `socket.emit('eventName', data)`
5. Disconnect on cleanup

**Events** (typically in trip workspace):
- `joinRoom` - Connect to trip channel
- `sendMessage` - Send message
- `receiveMessage` - Receive broadcast messages
- `disconnect` - Handle disconnect

---

## Environment Variables

**.env** (create in client/ directory):

```
VITE_API_URL=http://localhost:4444/api
```

**Development** (defaults):
- API Base: `http://localhost:4444/api`
- Client: `http://localhost:5173`

**Production**:
- Set `VITE_API_URL` to production API URL
- Backend CORS updated to production domain

---

## Development Workflow

### Local Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Backend should be running on http://localhost:4444
# Frontend will be on http://localhost:5173
```

### Common Tasks

**Adding a New Feature**:

1. Create feature folder: `src/features/newFeature/`
2. Create README.md with feature documentation
3. Set up structure: `components/`, `pages/`, `hooks/`, `types/`, `store/` (if needed)
4. Create `index.ts` with public exports
5. Add routes to `App.tsx`
6. Update Redux store if needed

**Adding a New UI Component**:

1. Create in `ui/common/ComponentName.tsx`
2. Export from `ui/common/index.ts`
3. Use Tailwind classes for styling
4. Add TypeScript interfaces

**Adding a New API Service**:

1. Create `services/entity.service.ts`
2. Define TypeScript types/interfaces
3. Implement CRUD functions
4. Use `extractApiError` for error handling
5. Export from service file

**Styling Guidelines**:
- Use Tailwind utilities
- Define custom colors as CSS variables
- Mobile-first responsive design
- Dark mode compatible (if applicable)

---

## Performance Optimization

### Code Splitting

React Router automatically code-splits route components with React.lazy().

### Image Optimization

- Use WebP format where possible
- Lazy load images with native `loading="lazy"`
- Optimize images before upload via Cloudinary

### Bundle Analysis

```bash
npm run build -- --report
```

---

## Browser Support

- Modern browsers supporting ES2020
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Testing Strategy (Future)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Test features with mocked API
- **E2E Tests**: Cypress or Playwright for user flows
- **Snapshot Tests**: Component render stability

---

## Common Patterns

### Data Fetching Pattern

```typescript
const [data, setData] = useState<Data | null>(null);
const { execute, isLoading, error } = useAsyncAction();

useEffect(() => {
  execute(async () => {
    const result = await fetchData();
    setData(result);
  });
}, [execute]);
```

### Form Handling Pattern

```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
const { execute, isLoading } = useAsyncAction();

const onSubmit = async (data) => {
  await execute(async () => {
    await submitData(data);
  });
};
```

### Redux Connected Component Pattern

```typescript
const data = useSelector((state: RootState) => state.trips.trips);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchTripsAsync());
}, [dispatch]);
```

---

## Deployment

### Build Process

```bash
npm run build
```

Outputs optimized files to `dist/`.

### Deployment Platforms

- **Vercel** (recommended for React)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** (any static file server)

### Environment Setup

Update `VITE_API_URL` to production API URL.

### Security Considerations

1. **HTTPS Only**: Secure cookies require HTTPS in production
2. **CORS**: Backend must allow production frontend domain
3. **Content Security Policy**: Add CSP headers
4. **JWT Secrets**: Backend should use strong, unique secrets
5. **Sensitive Data**: Never commit `.env` files

---

## Troubleshooting

### Common Issues

**Token Expired Error**:
- Check backend `/auth/refresh` endpoint is working
- Verify refresh token in cookies
- Check CSRF token is valid

**CORS Errors**:
- Backend `CLIENT_URL` env var must match frontend origin
- Verify `withCredentials: true` in Axios config

**Build Errors**:
- Clear `node_modules` and `dist/`
- Run `npm install` again
- Check TypeScript errors: `npx tsc --noEmit`

**Development Server Issues**:
- Kill existing Vite process on port 5173
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

---

## Future Enhancements

- **Offline Support**: Service workers for PWA
- **Real-time Collaboration**: Enhanced Socket.IO features
- **Testing**: Full test suite with Jest + RTL
- **Performance**: React Query for data caching
- **Analytics**: User behavior tracking
- **Notifications**: Push notifications
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Multi-language support

---

## Summary

Nomadly's frontend is a feature-driven React application with:

- ✅ Modular feature-based architecture
- ✅ Redux state management with async thunks
- ✅ Protected routes and authentication flow
- ✅ Real-time Socket.IO integration
- ✅ Comprehensive error handling
- ✅ Responsive Tailwind CSS styling
- ✅ TypeScript for type safety
- ✅ Optimized Vite build system
- ✅ Service layer for API abstraction
- ✅ Reusable hooks and components

For detailed feature documentation, see feature-specific README files linked above.

