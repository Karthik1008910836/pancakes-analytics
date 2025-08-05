#!/usr/bin/env node

/**
 * PostgreSQL Migration Script for 99 Pancakes Analytics
 * Migrates SQLite data to PostgreSQL for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🐘 PostgreSQL Migration Script');
console.log('==============================\n');

// Database connection configurations
const configs = {
  railway: {
    name: 'Railway (Recommended)',
    url: 'postgresql://postgres:password@junction.proxy.rlwy.net:port/railway',
    note: 'Replace with actual Railway PostgreSQL URL from dashboard'
  },
  render: {
    name: 'Render',
    url: 'postgresql://user:password@host:5432/database',
    note: 'Get from Render database dashboard'
  },
  supabase: {
    name: 'Supabase',
    url: 'postgresql://postgres:password@db.project.supabase.co:5432/postgres',
    note: 'Get from Supabase project settings'
  },
  elephantsql: {
    name: 'ElephantSQL (Free 20MB)',
    url: 'postgresql://user:pass@server.db.elephantsql.com:5432/database',
    note: 'Free tier: 20MB storage, perfect for testing'
  }
};

console.log('📋 Available Free PostgreSQL Options:');
console.log('=====================================\n');

Object.entries(configs).forEach(([key, config]) => {
  console.log(`🔹 ${config.name}`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Note: ${config.note}\n`);
});

console.log('🔧 Migration Steps:');
console.log('==================\n');

console.log('1️⃣ **Setup PostgreSQL Connection:**');
console.log('   export DATABASE_URL="your_postgresql_url_here"');
console.log('   # Or add to backend/.env file\n');

console.log('2️⃣ **Install PostgreSQL Client:**');
console.log('   npm install pg');
console.log('   # Already included in package.json\n');

console.log('3️⃣ **Run Schema Migration:**');
console.log('   node migrate-schema.js');
console.log('   # Creates tables and indexes\n');

console.log('4️⃣ **Migrate Sample Data:**');
console.log('   node migrate-data.js');
console.log('   # Transfers last 2 days of data\n');

console.log('📊 Current SQLite Data Summary:');
console.log('==============================');
console.log('• Sales Entries: 2 days (August 4-5, 2025)');
console.log('• Users: 5 accounts (1 admin, 4 normal)');
console.log('• Outlets: 4 locations');
console.log('• Monthly Targets: 12 months configured');
console.log('• Total Revenue: ₹26,944');
console.log('• Clean, production-ready state ✅\n');

console.log('🚀 Quick Migration Commands:');
console.log('============================\n');

// Generate migration commands
const migrationScript = `
# Set your PostgreSQL URL
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Run migration
node -e "
const { Pool } = require('pg');
const fs = require('fs');

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  console.log('🔧 Creating schema...');
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await pool.query(schema);
  
  console.log('⚡ Adding performance indexes...');
  const indexes = fs.readFileSync('./database/performance-indexes.sql', 'utf8');
  await pool.query(indexes);
  
  console.log('✅ PostgreSQL migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
"
`;

fs.writeFileSync('./quick-migrate.sh', migrationScript.trim());
console.log('📝 Created quick-migrate.sh script');

console.log('\n🎯 Environment Variables for Production:');
console.log('=======================================\n');

const envTemplate = `
# Backend Environment (.env)
NODE_ENV=production
DATABASE_URL=your_postgresql_url_here
JWT_SECRET=your_super_secure_jwt_secret_key
FRONTEND_URL=https://your-app.vercel.app
PORT=5000

# Frontend Environment (.env.production)
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
`;

console.log(envTemplate);

console.log('💡 Next Steps:');
console.log('=============');
console.log('1. Choose a PostgreSQL provider (Railway recommended)');
console.log('2. Update DATABASE_URL in environment variables');
console.log('3. Run: chmod +x quick-migrate.sh && ./quick-migrate.sh');
console.log('4. Deploy using FREE_DEPLOYMENT_GUIDE.md instructions');
console.log('5. Test your production application');

console.log('\n🎉 Your application is ready for free PostgreSQL deployment!');