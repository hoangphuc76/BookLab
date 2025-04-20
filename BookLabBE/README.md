**BookLab Backend**

🧾**Overview**

- BookLab is a comprehensive room booking and lab management system tailored for educational institutions. This backend API provides all the essential features to manage users, rooms, bookings, and related resources.

**🚀 Technologies Used**

- .NET 8.0 – Core development framework

- Entity Framework Core – ORM for database operations

- OData – Flexible API querying

- JWT Authentication – Secure user authentication

- Google OAuth – Social login integration

- AWS S3 – File storage and management

- SQL Server – Database system

🧱**Project Structure (Clean Architecture)**

- BookLabModel: Database entities & DbContext

- BookLabDAO: Direct data access logic

- BookLabDTO: Data Transfer Objects for API

- BookLabRepositories: Repository pattern implementation

- BookLabServices: Business logic and services

- BookLab-Odata: API controllers and app configuration

⚙️**Setup & Installation**

📌**Prerequisites**

- .NET 8.0 SDK

- SQL Server

- AWS Account (for S3)

- Google Developer Account (for OAuth)

🛠**Configuration Steps**

**Clone the repository:**

- git clone https://github.com/your-org/BookLab.git
- Update the database connection string in appsettings.json
- Set environment variables or update config files with:

  - JWT settings

  - Google OAuth credentials

  - AWS S3 credentials

  - Email SMTP configuration

**▶️Running the Application**

cd BookLab-Odata

dotnet run

Access Swagger at: http://localhost:xxxx/swagger

**🔐Authentication**
- Login via Google OAuth or demo account

- System exchanges authorization code for tokens

- JWT tokens are issued for API access

- Refresh token mechanism for seamless auth

- Role-based access control

**👤 User Management**
- Create and manage user accounts

- Assign user roles

- Update profile and upload avatar

**🏫 Room Management**
- Create and configure rooms

- Organize rooms by buildings and campuses

- Categorize rooms by type or equipment

- Check room availability

- Add favorite rooms

📅**Booking System**
- Create, update, and cancel bookings

- Support for recurring bookings

- Group bookings

- Manage students in bookings

- Bulk booking via Excel import

**📆Calendar Integration**
- Google Calendar synchronization

- Event creation and management

- Automatic email notifications

📬**Email Templates**
- Supports customizable email templates for:

- Booking confirmations

- Reminders

- Updates and cancellations
