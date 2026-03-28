# Simple Job Application Tracker

A minimal Angular application for tracking job applications with basic CRUD operations.

## Features

- **Simple Dashboard** - Shows total applications and status counts
- **Add Applications** - Basic form to add new job applications
- **View Applications** - List view of all applications with status indicators
- **Update Status** - Change application status (Applied, Interviewing, Offered, Rejected)
- **Delete Applications** - Remove applications from the list
- **Responsive Design** - Works on desktop and mobile devices

## Technical Stack

- **Angular 17** (Standalone Components)
- **TypeScript** for type safety
- **Template-driven Forms** for simplicity
- **Custom CSS** for styling (no external frameworks)
- **Component-level State** (no complex services)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the development server:**

   ```bash
   npx ng serve
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:4200
   ```

## Application Structure

```
src/
├── app/
│   └── app.component.ts    # Single component with all functionality
├── assets/                 # Static assets
├── styles.css             # Global styles
├── index.html            # Main HTML file
└── main.ts              # Application bootstrap
```

## Usage

### Adding a New Application

1. Click the "Add Application" button
2. Fill in the required fields:
   - Company name
   - Position title
   - Application status
   - Date applied
   - Location
3. Click "Add Application" to save

### Managing Applications

- **Change Status**: Use the dropdown in each application card to update status
- **Delete Applications**: Click the "Delete" button to remove an application
- **View Details**: All application details are displayed in the card view

## Sample Data

The application comes with sample job applications:

- TechCorp Inc. - Senior Frontend Developer (Interviewing)
- StartupXYZ - Full Stack Developer (Applied)
- Enterprise Solutions - Angular Developer (Offered)

## Simplification Changes

This version was simplified from a more complex version by:

- **Single Component**: Combined dashboard, form, and list into one component
- **No External Dependencies**: Removed Bootstrap, using custom CSS
- **Simple Data Model**: Reduced from 10+ fields to 6 essential fields
- **Template-driven Forms**: Replaced reactive forms with simpler template forms
- **Component State**: Removed RxJS and service layer, using simple arrays
- **Inline Styles**: All CSS is in the component for easier maintenance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).
