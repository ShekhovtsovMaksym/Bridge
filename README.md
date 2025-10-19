# Demo Authentication Application

A full-stack web application with React frontend and Spring Boot backend featuring JWT authentication.

## Technologies Used

### Backend
- Spring Boot 3.5.6
- Java 17
- H2 Database (in-memory)
- Liquibase for database migrations
- Spring Security with JWT authentication
- BCrypt password encryption

### Frontend
- React.js 18
- React Router v6
- Axios for API calls
- JavaScript (no TypeScript)

## Project Structure

```
demo/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/     # REST API controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access layer
│   │   ├── model/          # Entity models
│   │   ├── security/       # JWT and security configuration
│   │   └── dto/            # Data transfer objects
│   └── src/main/resources/
│       ├── application.yml
│       └── db/changelog/   # Liquibase migrations
└── frontend/
    ├── src/
    │   ├── pages/          # React page components
    │   ├── components/     # Reusable components
    │   └── App.js          # Main app with routing
    └── package.json
```

## API Endpoints

### Authentication Endpoints (Public)
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
  
- `POST /api/auth/login` - Login and get JWT token
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Protected Endpoints (Requires JWT)
- `GET /api/home` - Get welcome message
  - Requires header: `Authorization: Bearer <token>`

## Setup and Running

### Backend Setup

1. Navigate to the project root directory:
   ```bash
   cd C:\Users\XboX\IdeaProjects\demo
   ```

2. Build and run the Spring Boot application:
   ```bash
   mvnw spring-boot:run
   ```
   Or using Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

3. The backend will start on `http://localhost:8080`

4. H2 Console is available at: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: (leave empty)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

## Usage Workflow

1. **Register**: Navigate to `/register` and create a new account with username, email, and password
2. **Login**: Go to `/login` and enter your credentials
3. **Home**: After successful login, you'll be redirected to `/home` where you'll see a welcome message
4. **Logout**: Click the logout button to clear your session and return to login

## Features

- ✅ User registration with unique username and email validation
- ✅ Password encryption using BCrypt
- ✅ JWT-based authentication
- ✅ Protected routes on frontend
- ✅ Token stored in localStorage
- ✅ Automatic redirection for unauthorized access
- ✅ CORS enabled for frontend-backend communication
- ✅ Clean and responsive UI
- ✅ Error handling and user feedback

## Database Schema

The application uses Liquibase to manage database schema. The `users` table:

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

## Security Configuration

- JWT secret key is configured in `application.yml`
- Token expiration: 24 hours (86400000 ms)
- Stateless session management
- Public endpoints: `/api/auth/**`, `/h2-console/**`
- All other endpoints require authentication

## Future Enhancements

- Add unit tests (JUnit + MockMvc for backend)
- Add toast notifications for better UX
- Implement refresh token mechanism
- Replace H2 with PostgreSQL for production
- Add role-based access control
- Add password strength validation
- Add email verification

## Role and Permission Model

The application uses an evolvable RBAC model based on string codes instead of bitmasks.

Entities:
- permissions (code PK, name, description, is_active)
- roles (name PK, description)
- role_permissions (role_name FK -> roles.name, permission_code FK -> permissions.code)
- user_permissions (optional, for per-user overrides, not yet used)

Users have a string field role_name indicating their current role. No perm_mask is used.

Seeded roles:
- SUPER_ADMIN — full access (all permissions)
- USER — no elevated permissions by default

Seeded permissions:
- MANAGE_USERS
- MANAGE_ROLES
- VIEW_SHIPMENTS
- EDIT_SHIPMENTS
- WAREHOUSE_CHECKIN
- WAREHOUSE_RELEASE
- ANSWER_TICKETS
- CONFIGURE_SYSTEM

JWT and /api/users/me include:
- role: string role name (e.g., SUPER_ADMIN)
- permissions: array of permission codes (e.g., ["VIEW_SHIPMENTS", "EDIT_SHIPMENTS"]) 

Authorities mapping on backend:
- ROLE_{ROLE_NAME} for role (e.g., ROLE_SUPER_ADMIN)
- PERM_{PERMISSION_CODE} for permissions (e.g., PERM_EDIT_SHIPMENTS)

Frontend can check UI features by verifying code presence in the permissions array—no bit arithmetic required.
