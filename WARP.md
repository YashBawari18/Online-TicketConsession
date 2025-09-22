# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **React-based Online Ticket Concession System** built with TypeScript, Vite, Tailwind CSS, and Supabase. The application manages train concession applications for college students with separate dashboards for students and administrators.

## Key Technologies
- **Frontend**: React 18.3+ with TypeScript, Vite (development/build tool)
- **UI Framework**: Tailwind CSS for styling
- **Database**: Supabase (PostgreSQL) with real-time features
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF with autoTable for exporting reports
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM v7+ for navigation

## Essential Commands

### Development
```bash
npm run dev          # Start development server (usually localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
```

### Environment Setup
Create a `.env` file in the root directory with Supabase credentials:
```
VITE_SUPABASE_URL=https://zrepirglssfdxyyimghj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZXBpcmdsc3NmZHh5eWltZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDIzOTEsImV4cCI6MjA3NDAxODM5MX0.BAwWFKqQiD9n_XlqiRdX6hM27-ixd3HM9jR1FdMf6oY
```

## Architecture Overview

### Application Structure
The app follows a standard React structure with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers (auth, etc.)
├── lib/               # External service configurations (Supabase)
├── pages/             # Route-level components organized by user type
│   ├── admin/         # Admin-specific pages
│   └── student/       # Student-specific pages
├── utils/             # Utility functions and helpers
└── main.tsx           # Application entry point
```

### Authentication & Authorization
- **Dual Authentication System**: Separate login flows for students and administrators
- **Context-based State Management**: `AuthContext` manages user sessions across the app
- **Route Protection**: `PrivateRoute` component guards authenticated routes
- **Local Storage Persistence**: User sessions persist across browser sessions

### Database Schema (Supabase Tables)
- **`students`**: Student user accounts with roll numbers, names, emails
- **`admins`**: Administrator accounts with username/password
- **`concession_applications`**: Core application data with comprehensive fields

### Key Components

#### Student Flow
- **StudentDashboard**: Overview with stats, form submission, and application tracking
- **ConcessionForm**: Comprehensive form with multi-document upload and intelligent auto-fill features
  - Auto-calculates age from date of birth
  - Auto-calculates previous pass expiry date from issue date (30-day period)
  - **Three-document upload system**: College ID Card, Aadhar Card, and Fee Receipt
  - Visual upload status indicators with file name confirmation
  - Separate storage buckets for different document types
- **ApplicationStatus**: Real-time status tracking for submitted applications

#### Admin Flow  
- **AdminDashboard**: Multi-tab interface with Dashboard, View Documents, and Analytics sections
- **ApplicationTable**: Data table with approve/reject actions and multi-document viewing capabilities
  - Document count indicators (x/3 documents uploaded)
  - Visual status dots for each document type
- **ViewDocs**: Dedicated section for reviewing all uploaded student documents
  - Shows upload status for all three document types
  - Advanced filtering by document availability
- **DocumentViewer**: Modal component with tabbed interface for viewing all documents
  - Tab-based navigation between ID Card, Aadhar, and Fee Receipt
  - Document availability indicators with visual feedback
  - Individual download options for each document type
- **Analytics**: Charts and statistics using Recharts

### File Upload & Storage
- **Multi-bucket storage system**:
  - `id-cards`: College ID Card documents
  - `aadhar-cards`: Aadhar Card documents  
  - `fee-receipts`: Fee Receipt documents
- Supports image and PDF uploads for all document types
- Files are named with user ID and timestamp for uniqueness
- Documents are displayed in-browser with fallback download options
- **Advanced document viewer** with tabbed interface for all three document types
- Individual download capabilities for each document
- Visual status indicators showing upload completion

### PDF Export Functionality
- Generates formatted reports of approved applications
- Uses jsPDF with autoTable for professional layouts
- Includes college branding and comprehensive application data

## Development Guidelines

### State Management Patterns
- React Context for global state (authentication, user data)
- Local component state with `useState` for form data and UI state
- `useEffect` hooks for data fetching and side effects

### API Integration
- All Supabase operations are centralized in component methods
- Database operations use Supabase JavaScript client
- Real-time updates can be implemented using Supabase subscriptions

### Styling Conventions
- Tailwind CSS utility classes for all styling
- Consistent color scheme: Blue (primary), Green (success), Red (error), Yellow (warning)
- Responsive design with mobile-first approach using Tailwind breakpoints

### Form Handling
- Controlled components with comprehensive validation
- Auto-calculation features:
  - Age calculation from date of birth
  - Previous pass expiry date from issue date (configurable 30-day period)
  - Smart field state management (read-only when auto-calculated)
- File upload with preview and validation
- Visual indicators for auto-calculated fields

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages via alerts (can be enhanced with toast notifications)
- Form validation with required field indicators

## Common Development Tasks

### Adding New Application Fields
1. Update the database schema in Supabase
2. Modify the `Database` type definitions in `src/lib/supabase.ts`
3. Update form components (`ConcessionForm.tsx`)
4. Update display components (`ApplicationTable.tsx`, `ApplicationStatus.tsx`, `ViewDocs.tsx`)
5. Update the `DocumentViewer.tsx` if the field needs to be shown in document review

### Extending User Roles
1. Update the `User` type in `AuthContext.tsx`
2. Add new route protection logic in `App.tsx`
3. Create new dashboard components if needed

### Adding New Chart Types
- Import from Recharts library
- Add chart components to `AdminDashboard.tsx`
- Process application data for chart-specific formats

### Implementing Real-time Updates
Use Supabase real-time subscriptions:
```typescript
const subscription = supabase
  .channel('concession_applications')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'concession_applications' }, handleChange)
  .subscribe()
```

### Testing Database Operations
- Use Supabase dashboard for direct database testing
- Test file uploads using the storage interface
- Verify row-level security policies if implemented

## Advanced Features

### Document Management System
The admin panel includes a comprehensive document management system:
- **View Documents Tab**: Dedicated interface for reviewing all uploaded documents
- **Document Viewer Modal**: Full-screen document viewer supporting images and PDFs
- **Approval Workflow**: Admins can approve/reject applications directly from document viewer
- **Pass Date Automation**: Auto-calculates expiry dates (30-day default, configurable)
- **Filtering Options**: Filter by document status, application status, and student details

### Admin Dashboard Navigation
The admin interface is organized into three main tabs:
1. **Dashboard**: Overview with statistics, filters, and application management
2. **View Documents**: Dedicated document review interface with advanced filtering
3. **Analytics**: Charts and data visualization for application insights

### Document Viewing Capabilities
- **Image Support**: JPG, PNG, GIF, WebP formats with zoom and pan
- **PDF Support**: Embedded PDF viewer with download option
- **Fallback Handling**: Graceful fallback for unsupported formats
- **Error Handling**: Image load error handling with user feedback

### Pass Date Management
- Previous Pass Issue Date field in admin interface
- Auto-calculation of expiry date (configurable 30-day period)
- Manual override capability for special cases
- Integration with approval workflow
