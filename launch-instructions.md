# Launch Instructions for 99 Pancakes Analytics

## Prerequisites Setup Required

Since Docker is not available on this system, you'll need to install and configure the following components manually:

### 1. Install PostgreSQL

**Option A: Download from Official Site**
1. Go to https://www.postgresql.org/download/windows/
2. Download and install PostgreSQL (version 12 or higher)
3. During installation, set password for 'postgres' user to: `pancakes123`
4. Make sure PostgreSQL service is running

**Option B: Use Package Manager**
```powershell
# Using Chocolatey (if installed)
choco install postgresql

# Using Scoop (if installed)  
scoop install postgresql
```

### 2. Create Database and Schema

After PostgreSQL is installed:

1. **Open Command Prompt as Administrator**

2. **Create the database:**
   ```cmd
   createdb -U postgres pancakes_analytics
   ```

3. **Apply the schema:**
   ```cmd
   cd C:\Users\Karthik\pancakes-analytics\database
   psql -U postgres -d pancakes_analytics -f schema.sql
   psql -U postgres -d pancakes_analytics -f seed_data.sql
   ```

### 3. Launch the Application

Once PostgreSQL is set up, you can start the application:

**Terminal 1 - Backend:**
```cmd
cd C:\Users\Karthik\pancakes-analytics\backend
npm start
```

**Terminal 2 - Frontend:**
```cmd
cd C:\Users\Karthik\pancakes-analytics\frontend
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 5. Login Credentials

**Admin Account:**
- Email: `admin@99pancakes.com`
- Password: `admin123`

**Normal User Accounts:**
- Kompally: `kompally@99pancakes.com` / `password`
- Madhapur: `madhapur@99pancakes.com` / `password`
- Jubilee Hills: `jubilee@99pancakes.com` / `password`
- Banjara Hills: `banjara@99pancakes.com` / `password`

## Alternative: SQLite Setup (Easier Option)

If PostgreSQL setup is difficult, I can modify the application to use SQLite instead, which requires no additional installation.

## Troubleshooting

### Common Issues:

1. **Port Already in Use:**
   - Backend (5000): Change PORT in backend/.env
   - Frontend (3000): Use npm start and choose different port when prompted

2. **Database Connection Failed:**
   - Verify PostgreSQL is running: `net start postgresql-x64-15` (adjust version)
   - Check credentials match in backend/.env file
   - Ensure database exists: `psql -U postgres -l`

3. **Frontend Build Errors:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear npm cache: `npm cache clean --force`

4. **CORS Errors:**
   - Ensure frontend .env has correct API URL
   - Check backend CORS settings in server.js

### Getting Help:

The application structure is ready and all code is in place. The main requirement is setting up PostgreSQL database. Once that's done, the application should launch successfully.

Would you like me to:
1. Help set up PostgreSQL step by step?
2. Modify the app to use SQLite instead?
3. Provide a different database solution?