# 99 Pancakes Analytics - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- Docker (optional, for containerized deployment)

## Quick Start with Docker (Recommended)

1. **Clone and navigate to the project**
   ```bash
   cd pancakes-analytics
   ```

2. **Start all services with Docker Compose**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

4. **Login with demo credentials**
   - Admin: `admin@99pancakes.com` / `admin123`
   - User: `kompally@99pancakes.com` / `password`

## Manual Setup (Alternative)

### 1. Database Setup

1. **Install PostgreSQL** and create database
   ```sql
   CREATE DATABASE pancakes_analytics;
   ```

2. **Run database migrations**
   ```bash
   cd database
   psql -U postgres -d pancakes_analytics -f schema.sql
   psql -U postgres -d pancakes_analytics -f seed_data.sql
   ```

### 2. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pancakes_analytics
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Default User Accounts

The system comes with pre-configured accounts:

### Admin Account
- **Email**: admin@99pancakes.com
- **Password**: admin123
- **Permissions**: Full access to all data and user management

### Normal User Accounts
- **Kompally**: kompally@99pancakes.com / password
- **Madhapur**: madhapur@99pancakes.com / password
- **Jubilee Hills**: jubilee@99pancakes.com / password
- **Banjara Hills**: banjara@99pancakes.com / password

## Features Overview

### For Normal Users
- Daily sales data entry form
- View own outlet's sales history
- Auto-calculated metrics (APC, target achievement)
- Responsive mobile-friendly interface

### For Admin Users
- All normal user features
- Access to all outlets' data
- User management (create, edit, deactivate users)
- Historical data analysis across all outlets
- Advanced reporting and analytics
- Target setting and management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Sales Management
- `POST /api/sales` - Create sales entry
- `GET /api/sales` - Get sales entries (with filtering)
- `GET /api/sales/:id` - Get specific sales entry
- `PUT /api/sales/:id` - Update sales entry
- `DELETE /api/sales/:id` - Delete sales entry (admin only)
- `GET /api/sales/mtd-summary` - Monthly summary

## Database Schema

The application uses the following main tables:
- `users` - User accounts and roles
- `outlets` - Store locations
- `daily_sales` - Daily sales records
- `monthly_targets` - Target configuration
- `product_categories` - Product classification
- `raw_materials` - Inventory tracking

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers

## Performance Considerations

- Database indexing on frequently queried fields
- Connection pooling
- Optimized queries with proper joins
- Frontend state management
- Lazy loading of components
- Caching strategies

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists and schema is applied

### Port Conflicts
- Frontend default: 3000
- Backend default: 5000
- Database default: 5432
- Change ports in respective configuration files if needed

### Authentication Issues
- Clear browser localStorage
- Verify JWT secret is consistent
- Check token expiration settings

## Production Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   ```

3. **Use production database**
   - Configure production PostgreSQL instance
   - Update connection strings
   - Apply database migrations

4. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.