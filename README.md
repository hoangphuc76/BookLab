# BookLab

## Overview

BookLab is a comprehensive room booking and lab management system designed for educational institutions. The platform provides an intuitive interface for students to browse and book lab rooms while offering robust administrative tools for facility management.

## Project Structure

The project is organized into two main components:

### Backend (BookLabBE)
- **BookLabModel**: Database entities and DbContext
- **BookLabDAO**: Data Access Objects for database operations
- **BookLabDTO**: Data Transfer Objects for API communication
- **BookLabRepositories**: Repository pattern implementation
- **BookLabServices**: Business logic and service implementations
- **BookLab-Odata**: API controllers, startup configuration, and main application

### Frontend (BookLabFE)
- **fe-customer**: Customer-facing application for room booking
- **fe-admin**: Administration portal for managing rooms, bookings, and users

## Technology Stack

### Backend
- **.NET 8.0**: Core framework
- **Entity Framework Core**: ORM for database operations
- **OData**: For flexible API querying
- **JWT Authentication**: For secure user authentication
- **Google OAuth**: For social login
- **AWS S3**: For file storage and management
- **SQL Server**: Database

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Redux**: State management
- **Ant Design**: UI component library
- **React Router**: Navigation
- **Axios**: API client

## Key Features

### Authentication
- JWT-based authentication
- Google OAuth integration
- Role-based authorization

### User Management
- Account creation and management
- Role assignment
- Profile management with avatar upload

### Room Management
- Room creation and configuration
- Building and campus organization
- Room categorization
- Room availability checking
- Favorite rooms

### Booking System
- Create, update, and cancel bookings
- Recurring bookings
- Group bookings
- Student management in bookings
- Excel import for bulk booking

### Calendar Integration
- Google Calendar synchronization
- Event management
- Email notifications

## Setup and Installation

### Backend

#### Prerequisites
- .NET 8.0 SDK
- SQL Server
- AWS Account (for S3 storage)
- Google Developer Account (for OAuth)

#### Configuration
1. Clone the repository
2. Update the connection string in `appsettings.json`
3. Set up environment variables or update configuration files:
   - JWT settings
   - Google OAuth credentials
   - AWS S3 credentials
   - Email configuration

#### Running the Backend
```bash
cd BookLabBE/BookLab-Odata
dotnet restore
dotnet run