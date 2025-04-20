# BookLab Backend

## Overview

BookLab is a comprehensive room booking and lab management system designed for educational institutions. This backend API provides all the necessary functionality for managing rooms, bookings, users, and related resources.

## Technologies

- **.NET 8.0**: Core framework
- **Entity Framework Core**: ORM for database operations
- **OData**: For flexible API querying
- **JWT Authentication**: For secure user authentication
- **Google OAuth**: For social login
- **AWS S3**: For file storage and management
- **SQL Server**: Database

## Project Structure

The solution is organized into multiple projects following a clean architecture approach:

- **BookLabModel**: Database entities and DbContext
- **BookLabDAO**: Data Access Objects for direct database operations
- **BookLabDTO**: Data Transfer Objects for API communication
- **BookLabRepositories**: Repository pattern implementation
- **BookLabServices**: Business logic and service implementations
- **BookLab-Odata**: API controllers, startup configuration, and main application

## Setup and Installation

### Prerequisites

- .NET 8.0 SDK
- SQL Server
- AWS Account (for S3 storage)
- Google Developer Account (for OAuth)

### Configuration

1. Clone the repository
2. Update the connection string in `appsettings.json`
3. Set up environment variables or update configuration files:
   - JWT settings
   - Google OAuth credentials
   - AWS S3 credentials
   - Email configuration

### Running the Application

```bash
cd BookLab-Odata
dotnet restore
dotnet run
```

## Key Features

### Authentication

- JWT-based authentication
- Google OAuth integration
- Refresh token mechanism
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

## API Documentation

Access the API documentation via Swagger at `/swagger` when running the application.

## Authentication Flow

1. User logs in via Google OAuth or demo login
2. System exchanges authorization code for tokens
3. JWT tokens are issued for API access
4. Refresh tokens provide seamless authentication experience

## Email Templates

The system supports customizable email templates for various notifications:
- Booking confirmations
- Reminders
- Updates and cancellations

