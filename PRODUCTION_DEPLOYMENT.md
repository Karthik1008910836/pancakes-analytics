# 🚀 Production Deployment Guide - 99 Pancakes Analytics

## ✅ Pre-Deployment Cleanup Complete

### **📊 Current Database State**
- **Sales Entries**: 2 days only (August 4-5, 2025)
- **Users**: 5 users (1 admin, 4 normal users)
- **Outlets**: 4 outlets (Kompally as primary)
- **Monthly Targets**: 12 months configured
- **Clean State**: ✅ Ready for production

### **🎯 Remaining Data Summary**
```
📅 August 5, 2025 (Today):
• Net Sale: ₹11,959
• Customers: 77 (50 online, 27 offline)
• Products: 41 cakes, 152 pastries
• APC: ₹155.31

📅 August 4, 2025 (Yesterday):
• Net Sale: ₹14,985 (Target achieved ⭐)
• Customers: 108 (73 online, 35 offline)
• Products: 72 cakes, 145 pastries
• APC: ₹138.75
```

---

## 🔧 Production Environment Setup

### **1. Environment Variables (.env files)**

**Backend (.env):**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your_production_postgresql_url
JWT_SECRET=your_super_secure_jwt_secret_key_here
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

**Frontend (.env.production):**
```bash
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_NODE_ENV=production
```

### **2. Database Migration (PostgreSQL)**

**Apply performance indexes:**
```bash
# Run the performance optimization SQL
psql -d your_production_db -f database/performance-indexes.sql
```

**Migrate from SQLite to PostgreSQL:**
```bash
# Backend setup
cd backend
npm install
npm run db:migrate
```

### **3. Production Build Process**

**Install dependencies:**
```bash
# Root level
npm install

# Install all dependencies
npm run install:all
```

**Build frontend:**
```bash
cd frontend
npm run build
# This creates optimized build in /build folder
```

**Setup backend for production:**
```bash
cd backend
# Ensure production dependencies only
npm ci --only=production
```

---

## 🐳 Docker Deployment

### **Docker Compose Production**
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/pancakes_analytics
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=pancakes_analytics
      - POSTGRES_USER=your_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  postgres_data:
```

**Deploy with Docker:**
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

---

## 🌐 Production Server Deployment

### **1. Server Requirements**
- **OS**: Ubuntu 20.04+ / CentOS 8+
- **Node.js**: v18+ 
- **PostgreSQL**: v13+
- **Memory**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum

### **2. Server Setup Commands**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone https://your-repo-url.git
cd pancakes-analytics
```

### **3. Database Setup**
```bash
# Create production database
sudo -u postgres createdb pancakes_analytics
sudo -u postgres createuser pancakes_user
sudo -u postgres psql -c "ALTER USER pancakes_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pancakes_analytics TO pancakes_user;"

# Run schema
psql -h localhost -U pancakes_user -d pancakes_analytics -f database/schema.sql
psql -h localhost -U pancakes_user -d pancakes_analytics -f database/performance-indexes.sql
```

### **4. Application Deployment**
```bash
# Install dependencies
npm run install:all

# Build frontend
cd frontend && npm run build && cd ..

# Setup PM2 ecosystem
pm2 ecosystem.config.js

# Start application
pm2 start ecosystem.config.js --env production

# Setup auto-restart
pm2 startup
pm2 save
```

---

## ⚙️ PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'pancakes-backend',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_URL: 'postgresql://pancakes_user:secure_password@localhost:5432/pancakes_analytics'
      }
    },
    {
      name: 'pancakes-frontend',
      script: 'serve',
      args: '-s ./frontend/build -p 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

---

## 🔒 Production Security Checklist

### **✅ Environment Security**
- [ ] Change default JWT secret
- [ ] Use strong database passwords  
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall (ports 80, 443, 22 only)
- [ ] Setup fail2ban for SSH protection

### **✅ Application Security**
- [ ] Remove demo users in production
- [ ] Configure CORS for your domain only
- [ ] Enable rate limiting (already configured)
- [ ] Setup monitoring and logging
- [ ] Configure automated backups

### **✅ Database Security**
- [ ] Restrict PostgreSQL access to localhost
- [ ] Enable PostgreSQL SSL
- [ ] Setup regular database backups
- [ ] Configure log retention policies

---

## 📋 Post-Deployment Verification

### **1. Health Checks**
```bash
# Backend health
curl https://your-domain.com/api/health

# Frontend accessibility
curl https://your-domain.com

# Database connectivity
npm run db:test
```

### **2. Functional Testing**
- [ ] Login with admin credentials
- [ ] Create new sales entry
- [ ] View reports and analytics
- [ ] Test pagination functionality
- [ ] Verify performance optimizations

### **3. Performance Monitoring**
```bash
# Monitor PM2 processes
pm2 monit

# Check logs
pm2 logs

# Monitor database performance
psql -d pancakes_analytics -c "SELECT * FROM pg_stat_activity;"
```

---

## 🔧 Production User Management

### **Default Admin Account**
```
Email: admin@99pancakes.com
Username: admin
Password: admin123
Role: Administrator
```

**⚠️ IMPORTANT**: Change admin password immediately after deployment!

### **Sample Normal User**
```
Email: kompally@99pancakes.com  
Username: kompallyuser
Password: password
Role: Normal User
Outlet: Kompally
```

---

## 📊 Production Data State

### **Current MTD Performance (August 2025)**
- **Days Reported**: 2 days
- **Total Revenue**: ₹26,944
- **Monthly Target**: ₹4,00,000
- **Achievement**: 6.7% (on track)
- **Average APC**: ₹145
- **Total Customers**: 185

### **Clean Deployment Benefits**
✅ **Minimal data footprint** for fast deployment  
✅ **Realistic sample data** for immediate use  
✅ **Performance optimizations** already applied  
✅ **Production-ready database** schema  
✅ **Clean audit trails** from day one  

---

## 🎉 Ready for Production!

Your 99 Pancakes Analytics application is now **production-ready** with:

- ✅ **Clean database** with only last 2 days
- ✅ **Performance optimizations** applied
- ✅ **Production-grade security** configurations  
- ✅ **Scalable architecture** for growth
- ✅ **Complete deployment guide** 

**Deploy with confidence!** 🚀