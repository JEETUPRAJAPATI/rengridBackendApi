# Admin Authentication & Management System

A complete admin authentication and management system built with Node.js, Express, and PostgreSQL. This system provides comprehensive user management, role-based access control, and property management features.

## 🚀 Features

- **Admin Authentication**: Login, forgot/reset password with JWT tokens
- **Role & Permission Management**: Flexible role-based access control
- **Admin CRUD Operations**: Complete admin management with role assignment
- **User Management**: Full user lifecycle management with filtering
- **Property Management**: Complete property CRUD with images, amenities, and SEO
- **Email Integration**: Password reset emails using MailTrap
- **Security**: JWT authentication, bcrypt password hashing, input validation
- **Database**: PostgreSQL with proper schema design and relationships
- **Logging**: Winston logger with file and console output
- **Structured Architecture**: Clean separation of concerns with MVC pattern

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer with MailTrap
- **Validation**: Joi
- **Logging**: Winston
- **Environment**: dotenv

## 📁 Project Structure

```
├── config/                   # DB, JWT, SMTP configs
│   ├── database.js          # PostgreSQL configuration
│   ├── jwt.js               # JWT utilities
│   └── email.js             # Email configuration
├── controllers/              # Business logic (CRUD, Auth)
│   ├── AuthController.js
│   ├── AdminController.js
│   ├── UserController.js
│   └── PropertyController.js
├── middleware/               # JWT, role, validation middleware
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Request validation middleware
├── models/                   # Database models
│   ├── Admin.js
│   ├── User.js
│   └── Property.js
├── routes/                   # API route definitions
│   ├── auth.js
│   ├── admin.js
│   ├── users.js
│   └── properties.js
├── services/                 # Logic reused across controllers
│   ├── AuthService.js
│   ├── AdminService.js
│   ├── UserService.js
│   └── PropertyService.js
├── utils/                   # Helpers, validators, etc.
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── adminValidators.js
│   │   ├── userValidators.js
│   │   └── propertyValidators.js
│   ├── helpers.js           # Utility functions
│   └── logger.js            # Winston logger utility
├── logs/                    # Log files stored here
│   ├── error.log
│   └── combined.log
├── uploads/                  # Uploaded images (static)
├── database/                 # Database schema and seeders
│   ├── schema.sql
│   └── seeders.js
├── .env                      # Environment variables
├── .gitignore
├── README.md
├── package.json
├── index.js                  # Main server file
└── postman_collection.json   # API collection
```

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-auth-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   Make sure PostgreSQL is installed and running on your system.

4. **Set up environment variables**
   Update the `.env` file with your database and email credentials:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=admin
   DATABASE_NAME=postgres

   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=1d

   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your-mailtrap-username
   MAIL_PASSWORD=your-mailtrap-password
   MAIL_FROM=noreply@admin-system.com

   LOG_LEVEL=info
   ```

5. **Set up database schema**
   ```bash
   # Connect to PostgreSQL and run the schema
   psql -U postgres -d postgres -f database/schema.sql
   ```

6. **Run seeders**
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- **admins**: Admin user accounts
- **users**: Regular user accounts
- **roles**: Role definitions
- **permissions**: Permission definitions
- **role_admin**: Admin-role relationships
- **permission_role**: Role-permission relationships
- **permission_admin**: Direct admin-permission relationships
- **properties**: Property listings
- **property_images**: Property image gallery
- **amenities**: Available amenities
- **admin_password_resets**: Password reset tokens

## 🔐 Authentication

### Login Credentials (Default)
- **Super Admin**: admin@example.com / admin123
- **Manager**: manager@example.com / manager123
- **Sample Users**: john@example.com, jane@example.com / user123

### JWT Token
Include the JWT token in requests:
```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin Management
- `GET /api/admin/admins` - List all admins
- `POST /api/admin/admins` - Create new admin
- `GET /api/admin/admins/:id` - Get single admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin

### Role Management
- `GET /api/admin/roles` - List all roles
- `POST /api/admin/roles` - Create new role

### Permission Management
- `GET /api/admin/permissions` - List all permissions
- `POST /api/admin/permissions` - Create new permission

### User Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/status` - Update user status
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/:id/logins` - Get user login history

### Property Management
- `GET /api/admin/properties` - List all properties
- `POST /api/admin/properties` - Create new property
- `GET /api/admin/properties/:id` - Get single property
- `PUT /api/admin/properties/:id` - Update property
- `PATCH /api/admin/properties/:id/status` - Update property status
- `DELETE /api/admin/properties/:id` - Delete property
- `POST /api/admin/properties/:id/images` - Upload property images
- `DELETE /api/admin/properties/:id/images/:imageId` - Delete property image
- `GET /api/admin/properties/amenities/all` - Get all amenities

## 🧪 Testing with Postman

1. **Import the collection**: Import `postman_collection.json`
2. **Set base URL**: Update `BASE_URL` to `http://localhost:3000`
3. **Login first**: Use the login endpoint to get JWT token
4. **Token auto-save**: The collection automatically saves the JWT token from login response
5. **Test all endpoints**: All endpoints are organized by feature with sample data

## 📋 Permission System

The system uses a flexible permission system:

### Permission Structure
```json
{
  "permissions": {
    "user": ["view", "create", "edit", "delete"],
    "property": ["view", "create", "edit", "delete"],
    "admin": ["view", "create", "edit", "delete"]
  }
}
```

### Built-in Roles
- **Super Admin**: Full access to all features
- **Manager**: User and property management
- **Editor**: Property and user editing
- **Viewer**: Read-only access

## 📝 Logging

The system uses Winston for comprehensive logging:

- **Console logging**: Development environment
- **File logging**: Production environment
- **Log levels**: error, warn, info, debug
- **Log files**: `logs/error.log`, `logs/combined.log`

## 🚀 Deployment

### Environment Variables
Set these in production:
```
NODE_ENV=production
DATABASE_HOST=your-production-database-host
DATABASE_USERNAME=your-production-database-username
DATABASE_PASSWORD=your-production-database-password
DATABASE_NAME=your-production-database-name
JWT_SECRET=your-production-jwt-secret
MAIL_HOST=your-smtp-host
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
```

### Database Setup
1. Run schema.sql on production database
2. Run seeders for initial data
3. Set up database backups

## 🔒 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT authentication** with expiration
- **Input validation** with Joi
- **SQL injection prevention** with parameterized queries
- **Role-based access control**
- **Request logging** for audit trails

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📞 Support

For support, please create an issue in the repository or contact the development team.