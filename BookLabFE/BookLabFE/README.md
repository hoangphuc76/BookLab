# BookLab - Room Booking Management System

## Overview
BookLab is a comprehensive room booking management system designed for educational institutions. The application consists of two separate frontend interfaces:
- **Admin Interface**: For administrators and managers to handle bookings, rooms, and system configuration
- **Customer Interface**: For students and users to book rooms, manage their schedules, and view available spaces

## Features

### Customer Interface
- User profile management
- Room browsing and details view
- Room booking functionality
- Scheduling and calendar integration
- Group management
- Mobile-responsive interface
- Help and documentation section

### Admin Interface
- Dashboard with analytics
- Booking request management
- Room and building management
- User account administration
- Email template customization
- SMTP configuration
- Booking history tracking
- Role-based access control

## Technologies

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **UI Components**: 
  - Ant Design
  - React Icons
  - Chart.js
  - SweetAlert2
- **Date Handling**: Moment.js
- **Code Quality**: ESLint

## Project Structure

```
BookLabFE/
├── fe-admin/             # Admin interface
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration
│   └── package.json      # Dependencies for admin interface
│
├── fe-customer/          # Customer interface
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration
│   └── package.json      # Dependencies for customer interface
│
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/BookLabFE.git
   cd BookLabFE
   ```

2. Install dependencies for admin interface
   ```bash
   cd fe-admin
   npm install
   ```

3. Install dependencies for customer interface
   ```bash
   cd ../fe-customer
   npm install
   ```

4. Start development servers

   For admin interface:
   ```bash
   cd fe-admin
   npm run dev
   ```
   The admin interface will be available at http://localhost:5734

   For customer interface:
   ```bash
   cd fe-customer
   npm run dev
   ```
   The customer interface will be available at http://localhost:5173

5. Build for production
   ```bash
   # In each project directory (fe-admin and fe-customer)
   npm run build
   ```

## API Configuration

The application connects to a backend API at `https://booklab-demo.runasp.net/odata`. To change this:

1. Edit the API client configuration in:
   - `fe-admin/src/services/ApiClient.js`
   - `fe-customer/src/services/ApiClient.js`

## Deployment

The build output for each interface is placed in their respective `build` or `dist` directories. These can be deployed to any static hosting service.


